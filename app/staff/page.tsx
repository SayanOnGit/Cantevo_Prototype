"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Order } from "@/types"
import { load, save } from "@/lib/storage"
import { ChefHat } from "lucide-react"

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadOrders()
  }, [])

  const loadOrders = () => {
    const savedOrders: Order[] = load("orders", [])
    setOrders(savedOrders.reverse())
  }

  const updateOrderStatus = (orderId: string, newStatus: "Pending" | "Preparing" | "Ready") => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    setOrders(updatedOrders.reverse())
    save("orders", updatedOrders.reverse())
  }

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const pendingOrders = orders.filter((o) => o.status === "Pending")
  const preparingOrders = orders.filter((o) => o.status === "Preparing")
  const readyOrders = orders.filter((o) => o.status === "Ready")

  return (
    <>
      <Header cartCount={0} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-muted-foreground">Manage incoming orders</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Pending Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-foreground">Pending</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-bold">
                    {pendingOrders.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No pending orders</p>
                  ) : (
                    pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30"
                      >
                        <p className="font-mono text-xs font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                          {order.id}
                        </p>
                        <p className="font-medium text-sm text-foreground mb-1">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {order.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
                        </p>
                        <button
                          onClick={() => updateOrderStatus(order.id, "Preparing")}
                          className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded transition"
                        >
                          Start Preparing
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Preparing Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-foreground">Preparing</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-bold">
                    {preparingOrders.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {preparingOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No orders being prepared</p>
                  ) : (
                    preparingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30"
                      >
                        <p className="font-mono text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          {order.id}
                        </p>
                        <p className="font-medium text-sm text-foreground mb-1">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {order.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
                        </p>
                        <button
                          onClick={() => updateOrderStatus(order.id, "Ready")}
                          className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition"
                        >
                          Mark Ready
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ready Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-foreground">Ready for Pickup</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold">
                    {readyOrders.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {readyOrders.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No ready orders</p>
                  ) : (
                    readyOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30"
                      >
                        <p className="font-mono text-xs font-semibold text-green-900 dark:text-green-300 mb-2">
                          {order.id}
                        </p>
                        <p className="font-medium text-sm text-foreground mb-1">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
                        </p>
                      </div>
                    ))
                  )}
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
