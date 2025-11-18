"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MenuCard } from "@/components/menu-card"
import type { MenuItem, CartItem } from "@/types"
import { load, save } from "@/lib/storage"
import menu from "@/data/menu.json"
import { Search } from "lucide-react"

export default function MenuPage() {
  type User = {
    username: string
    email: string
    password: string
  }

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [showAuthOverlay, setShowAuthOverlay] = useState(false)
  const [authMode, setAuthMode] = useState<"register" | "login">("register")

  // form states
  const [formUsername, setFormUsername] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)

  const USERS_KEY = "users"
  const AUTH_KEY = "authUser"

  useEffect(() => {
    const stored = load<User | null>(AUTH_KEY, null as unknown as User | null)
    if (stored && stored.username) {
      setAuthUser(stored)
      setShowAuthOverlay(false)
    } else {
      setShowAuthOverlay(true)
    }
  }, [])

  const getUsers = (): User[] => load<User[]>(USERS_KEY, [])
  const saveUsers = (users: User[]) => save(USERS_KEY, users)

  const handleRegister = () => {
    setAuthError(null)
    const username = formUsername.trim()
    const email = formEmail.trim().toLowerCase()
    const password = formPassword

    if (!username) return setAuthError("Username is required")
    if (!email.includes("@")) return setAuthError("Valid email is required")
    if (password.length < 4) return setAuthError("Password must be at least 4 characters")

    const users = getUsers()
    if (users.find((u) => u.email === email)) return setAuthError("An account with this email already exists")

    const newUser: User = { username, email, password }
    users.push(newUser)
    saveUsers(users)
    save(AUTH_KEY, { username, email })
    setAuthUser({ username, email, password: "" })
    setShowAuthOverlay(false)
    setFormPassword("")
  }

  const handleLogin = () => {
    setAuthError(null)
    const email = formEmail.trim().toLowerCase()
    const password = formPassword

    if (!email || !password) return setAuthError("Email and password are required")

    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) return setAuthError("Invalid email or password")

    save(AUTH_KEY, { username: user.username, email: user.email })
    setAuthUser({ username: user.username, email: user.email, password: "" })
    setShowAuthOverlay(false)
    setFormPassword("")
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {}
    setAuthUser(null)
    setShowAuthOverlay(true)
    setFormEmail("")
    setFormPassword("")
    setFormUsername("")
  }

  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Prefer persisted menu items (admin additions) if the key exists in localStorage.
    // This ensures an intentionally empty list (admin deleted all items) is respected.
    try {
      const raw = localStorage.getItem("menu_items")
      if (raw !== null) {
        const parsed = JSON.parse(raw) as MenuItem[]
        setItems(parsed || [])
      } else {
        setItems(menu)
      }
    } catch {
      setItems(menu)
    }
  }, [])

  const categories = ["All", ...new Set(items.map((item) => item.category))]

  let filteredItems = selectedCategory === "All" ? items : items.filter((item) => item.category === selectedCategory)

  if (searchQuery.trim()) {
    filteredItems = filteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const handleAddToCart = (item: MenuItem) => {
    const cart: CartItem[] = load("cart", [])
    const existingItem = cart.find((ci) => ci.id === item.id)

    if (existingItem) {
      existingItem.qty += 1
    } else {
      cart.push({ ...item, qty: 1 })
    }

    save("cart", cart)
    setCartCount(cart.reduce((sum, ci) => sum + ci.qty, 0))
  }

  useEffect(() => {
    const cart: CartItem[] = load("cart", [])
    setCartCount(cart.reduce((sum, ci) => sum + ci.qty, 0))
  }, [])

  return (
    <>
      <Header cartCount={cartCount} />
      {/* Top-right greeting + logout (fixed so Header isn't modified) */}
      {authUser && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3">
          <div className="px-3 py-2 bg-card rounded-md border border-border text-foreground">Hi, {authUser.username}</div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-muted rounded-md border border-border text-foreground hover:opacity-90"
          >
            Logout
          </button>
        </div>
      )}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Browse Menu</h1>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground text-lg mb-2">
                {searchQuery ? `No items found for "${searchQuery}"` : "No items in this category"}
              </p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-6">
                  Try a different search term or browse all categories
                </p>
              )}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                  }}
                  className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {/* Auth overlay: forces registration/login before viewing site */}
      {showAuthOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">{authMode === "register" ? "Create an account" : "Log in"}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {authMode === "register"
                ? "Sign up to continue. This is frontend-only demo authentication."
                : "Sign in with your email and password."}
            </p>

            {authError && <div className="text-sm text-destructive mb-3">{authError}</div>}

            {authMode === "register" && (
              <div className="mb-3">
                <label className="text-sm mb-1 block">Username</label>
                <input
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="text-sm mb-1 block">Email</label>
              <input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
              />
            </div>

            <div className="flex gap-2 mb-3">
              {authMode === "register" ? (
                <button onClick={handleRegister} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Register
                </button>
              ) : (
                <button onClick={handleLogin} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Log In
                </button>
              )}

              <button
                onClick={() => {
                  setAuthMode(authMode === "register" ? "login" : "register")
                  setAuthError(null)
                }}
                className="px-3 py-2 bg-muted rounded-md border border-border text-foreground"
              >
                {authMode === "register" ? "Have an account? Log in" : "New here? Register"}
              </button>
            </div>

            <div className="text-xs text-muted-foreground">This site stores account data locally in your browser for demo purposes.</div>
          </div>
        </div>
      )}
    </>
  )
}
