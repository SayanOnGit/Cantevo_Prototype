"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { CartItem, Order, UserProfile } from "@/types"
import { load, save } from "@/lib/storage"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState("")
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    loyaltyPoints: 0,
    totalOrders: 0,
  })

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    pickupTime: "",
    paymentMethod: "Cash",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
    const promo = load("appliedPromo", "")
    setAppliedPromo(promo)
    const loyalty = load("useLoyaltyPoints", false)
    setUseLoyaltyPoints(loyalty)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (cart.length === 0) {
    return (
      <>
        <Header cartCount={0} />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Link
              href="/menu"
              className="inline-flex px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              Back to Menu
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.customerName.trim()) newErrors.customerName = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500))

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

    const validPromoCodes: Record<string, number> = {
      WELCOME10: 10,
      STUDENT15: 15,
      FRIEND20: 20,
    }
    const promoDiscount = appliedPromo ? (subtotal * (validPromoCodes[appliedPromo] || 0)) / 100 : 0
    const loyaltyDiscount = useLoyaltyPoints ? Math.min(userProfile.loyaltyPoints, subtotal) : 0
    const total = Math.max(0, subtotal - promoDiscount - loyaltyDiscount)

    const order: Order = {
      id: `ORD-${Date.now()}`,
      customerName: formData.customerName,
      email: formData.email,
      pickupTime: formData.pickupTime,
      items: cart,
      subtotal,
      discount: promoDiscount + loyaltyDiscount,
      loyaltyPointsUsed: useLoyaltyPoints ? loyaltyDiscount : 0,
      total,
      paymentMethod: formData.paymentMethod as "Cash" | "Card" | "UPI",
      status: "Pending",
      placedAt: new Date().toISOString(),
    }

    // Save order
    const orders: Order[] = load("orders", [])
    orders.push(order)
    save("orders", orders)

    const earnedPoints = Math.floor(total)
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      loyaltyPoints: useLoyaltyPoints
        ? userProfile.loyaltyPoints - loyaltyDiscount + earnedPoints
        : userProfile.loyaltyPoints + earnedPoints,
      totalOrders: userProfile.totalOrders + 1,
    }
    save("userProfile", updatedProfile)

    // Clear cart and temporary data
    save("cart", [])
    save("appliedPromo", "")
    save("useLoyaltyPoints", false)

    setLoading(false)
    router.push(`/confirmation/${order.id}`)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const validPromoCodes: Record<string, number> = {
    WELCOME10: 10,
    STUDENT15: 15,
    FRIEND20: 20,
  }
  const promoDiscount = appliedPromo ? (subtotal * (validPromoCodes[appliedPromo] || 0)) / 100 : 0
  const loyaltyDiscount = useLoyaltyPoints ? Math.min(userProfile.loyaltyPoints, subtotal) : 0
  const total = Math.max(0, subtotal - promoDiscount - loyaltyDiscount)

  return (
    <>
      <Header cartCount={cart.length} />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground mt-2">Complete your order</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-4">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John Doe"
                      />
                      {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 XXXXXXXXXX"
                      />
                      {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Pickup Details */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-4">Pickup Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Preferred Pickup Time *</label>
                      <input
                        type="datetime-local"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.pickupTime && <p className="text-destructive text-sm mt-1">{errors.pickupTime}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {["Cash", "Card", "UPI"].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={formData.paymentMethod === method}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-foreground">
                          {method === "Cash"
                            ? "Cash on Pickup"
                            : method === "Card"
                              ? "Card Payment (Mock)"
                              : "UPI (Google Pay, PhonePe)"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Place Order"} <ChevronRight size={20} />
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-20">
                <h2 className="font-semibold text-lg text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 pb-4 border-b border-border max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.qty}
                      </span>
                      <span className="font-medium text-foreground">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Promo Discount</span>
                      <span>-₹{promoDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Loyalty Points</span>
                      <span>-₹{loyaltyDiscount.toFixed(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
