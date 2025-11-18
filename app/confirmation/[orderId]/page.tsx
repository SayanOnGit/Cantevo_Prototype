"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Order } from "@/types"
import { load } from "@/lib/storage"
import Link from "next/link"
import { CheckCircle, Clock, MapPin } from "lucide-react"

export default function ConfirmationPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const orders: Order[] = load("orders", [])
    const authUser = load<{ username: string; email: string } | null>("authUser", null as any)
    const profile = load<{ name: string; email: string } | null>("userProfile", null as any)
    const currentEmail = authUser?.email || profile?.email || null

    let foundOrder = orders.find((o) => o.id === params.orderId)

    // If the order wasn't found in the persisted list (race or new), check a transient last_order saved during checkout
    if (!foundOrder) {
      try {
        const raw = localStorage.getItem("last_order")
        if (raw) {
          const last = JSON.parse(raw) as Order
          if (last && last.id === params.orderId) {
            foundOrder = last
          }
        }
      } catch {}
    }

    // Only allow viewing if order belongs to current user (by ownerEmail/order.email) or if we have the transient order
    if (!foundOrder) {
      setOrder(null)
    } else if (!currentEmail) {
      setOrder(foundOrder)
    } else if (foundOrder.ownerEmail === currentEmail || foundOrder.email === currentEmail) {
      setOrder(foundOrder)
    } else {
      setOrder(null)
    }
  }, [params.orderId])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!order) {
    return (
      <>
        <Header cartCount={0} />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">Order not found</p>
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

  const placedTime = new Date(order.placedAt)
  const pickupTime = new Date(order.pickupTime)
  const estimatedReadyTime = new Date(placedTime.getTime() + 20 * 60000) // 20 min estimate

  return (
    <>
      <Header cartCount={0} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg">Your order has been successfully placed</p>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-semibold text-primary">{order.id}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{order.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground">
                    {order.paymentMethod === "Cash"
                      ? "Cash on Pickup"
                      : order.paymentMethod === "Card"
                        ? "Card Payment"
                        : "UPI Payment"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Timing */}
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Ready Time</p>
                    <p className="font-semibold text-foreground text-lg">
                      {estimatedReadyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">~20 minutes from now</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/5 rounded-lg border border-secondary/20 p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-semibold text-foreground">Main Canteen Counter</p>
                    <p className="text-xs text-muted-foreground mt-1">Building A, Ground Floor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="font-semibold text-foreground mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold text-primary">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/menu"
              className="flex-1 px-6 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-center"
            >
              Track Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
