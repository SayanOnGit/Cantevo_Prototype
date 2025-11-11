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
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setItems(menu)
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
    </>
  )
}
