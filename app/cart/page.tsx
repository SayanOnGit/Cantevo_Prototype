"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuantityControl } from "@/components/quantity-control"
import type { CartItem, UserProfile } from "@/types"
import { load, save } from "@/lib/storage"
import Link from "next/link"
import { Trash2, ShoppingBag, Gift, Zap } from "lucide-react"

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    loyaltyPoints: 0,
    totalOrders: 0,
  })
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState("")
  const [promoError, setPromoError] = useState("")

  useEffect(() => {
    setMounted(true)
    const savedCart: CartItem[] = load("cart", [])
    setCart(savedCart)
    const profile: UserProfile = load("userProfile", {
      name: "",
      email: "",
      phone: "",
      loyaltyPoints: 0,
      totalOrders: 0,
    })
    setUserProfile(profile)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleQuantityChange = (id: string, delta: number) => {
    const updatedCart = cart.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    setCart(updatedCart)
    save("cart", updatedCart)
  }

  const handleRemove = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id)
    setCart(updatedCart)
    save("cart", updatedCart)
  }

  const validPromoCodes: Record<string, number> = {
    WELCOME10: 10,
    STUDENT15: 15,
    FRIEND20: 20,
  }

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase()
    if (validPromoCodes[code]) {
      setAppliedPromo(code)
      setPromoError("")
    } else {
      setPromoError("Invalid promo code")
      setAppliedPromo("")
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const promoDiscount = appliedPromo ? (subtotal * validPromoCodes[appliedPromo]) / 100 : 0
  const loyaltyDiscount = useLoyaltyPoints ? Math.min(userProfile.loyaltyPoints, subtotal) : 0
  const total = Math.max(0, subtotal - promoDiscount - loyaltyDiscount)

  return (
    <>
      <Header cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
              <Link
                href="/menu"
                className="inline-flex px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg border border-border p-4 flex gap-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <QuantityControl
                          qty={item.qty}
                          onIncrease={() => handleQuantityChange(item.id, 1)}
                          onDecrease={() => handleQuantityChange(item.id, -1)}
                        />
                        <span className="font-bold text-primary">₹{item.price * item.qty}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}

                <div className="space-y-4">
                  {/* Promo Code */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift size={20} className="text-accent" />
                      <h3 className="font-semibold text-foreground">Apply Promo Code</h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code (e.g., WELCOME10)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-destructive text-sm mt-2">{promoError}</p>}
                    {appliedPromo && (
                      <p className="text-green-600 text-sm mt-2">
                        Promo {appliedPromo} applied! Save ₹{promoDiscount.toFixed(0)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Valid codes: WELCOME10, STUDENT15, FRIEND20</p>
                  </div>

                  {/* Loyalty Points */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={20} className="text-accent" />
                        <div>
                          <h3 className="font-semibold text-foreground">Loyalty Points</h3>
                          <p className="text-sm text-muted-foreground">Balance: ₹{userProfile.loyaltyPoints}</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useLoyaltyPoints}
                          onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                          disabled={userProfile.loyaltyPoints === 0}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-foreground">Use Points</span>
                      </label>
                    </div>
                    {useLoyaltyPoints && (
                      <p className="text-green-600 text-sm">Saving ₹{loyaltyDiscount.toFixed(0)} with loyalty points</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary & Checkout */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-20">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo ({appliedPromo})</span>
                        <span>-₹{promoDiscount.toFixed(0)}</span>
                      </div>
                    )}
                    {useLoyaltyPoints && (
                      <div className="flex justify-between text-green-600">
                        <span>Loyalty Points</span>
                        <span>-₹{loyaltyDiscount.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(0)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full block text-center px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/menu"
                    className="w-full block text-center mt-3 px-4 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
