"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Order, MenuItem } from "@/types"
import { load, save } from "@/lib/storage"
import menu from "@/data/menu.json"
import {
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Package,
  CheckCheck,
} from "lucide-react"

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "menu">("dashboard")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Breakfast",
    description: "",
    price: "",
  })

  useEffect(() => {
    setMounted(true)
    const savedOrders: Order[] = load("orders", [])
    setOrders(savedOrders)
    setMenuItems(menu as MenuItem[])
  }, [])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const totalCustomers = new Set(orders.map((o) => o.email)).size
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  const ordersByStatus = {
    pending: orders.filter((o) => o.status === "Pending").length,
    preparing: orders.filter((o) => o.status === "Preparing").length,
    ready: orders.filter((o) => o.status === "Ready").length,
  }

  const itemPopularity = menuItems
    .map((item) => ({
      ...item,
      orderCount: orders.reduce((sum, order) => sum + (order.items.find((i) => i.id === item.id)?.qty || 0), 0),
    }))
    .sort((a, b) => b.orderCount - a.orderCount)

  const handleSaveMenuItem = () => {
    if (!formData.name.trim() || !formData.price) {
      alert("Please fill all fields")
      return
    }

    // In a real app, this would update the menu.json
    console.log("Saving menu item:", formData)
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({ name: "", category: "Breakfast", description: "", price: "" })
  }

  const handleDeleteMenuItem = (id: string) => {
    if (confirm("Are you sure?")) {
      // In a real app, this would delete from menu.json
      console.log("Deleting item:", id)
    }
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: "Pending" | "Preparing" | "Ready" | "Completed") => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    setOrders(updatedOrders)
    save("orders", updatedOrders)
  }

  return (
    <>
      <Header cartCount={0} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage orders, menu, and view analytics</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-border">
            {["dashboard", "orders", "menu"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                    <TrendingUp size={20} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹{totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-2">{totalOrders} orders</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                    <ShoppingCart size={20} className="text-secondary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground mt-2">Average: ₹{averageOrderValue.toFixed(0)}</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Unique Customers</h3>
                    <Users size={20} className="text-accent" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{totalCustomers}</p>
                  <p className="text-xs text-muted-foreground mt-2">Registered users</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Avg Order Value</h3>
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹{averageOrderValue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
                </div>
              </div>

              {/* Order Status Overview */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-semibold text-lg text-foreground mb-4">Order Status Overview</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Clock size={32} className="text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Orders</p>
                      <p className="text-2xl font-bold text-yellow-600">{ordersByStatus.pending}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Package size={32} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Preparing Orders</p>
                      <p className="text-2xl font-bold text-blue-600">{ordersByStatus.preparing}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCheck size={32} className="text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                      <p className="text-2xl font-bold text-green-600">{ordersByStatus.ready}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Items */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-semibold text-lg text-foreground mb-4">Top Selling Items</h2>
                <div className="space-y-2">
                  {itemPopularity.slice(0, 5).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground w-6">{index + 1}</span>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.orderCount} sold</p>
                        <p className="text-xs text-muted-foreground">₹{(item.price * item.orderCount).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab - Staff Dashboard */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Order Management</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                  Refresh Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Order ID</p>
                          <p className="font-mono font-semibold text-foreground text-sm">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Customer</p>
                          <p className="font-semibold text-foreground">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="font-semibold text-foreground">
                            {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold text-primary">₹{order.total.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Pending", "Preparing", "Ready", "Completed"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateOrderStatus(order.id, status as any)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                              order.status === status
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div className="space-y-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                <Plus size={20} /> Add New Item
              </button>

              {showAddForm && (
                <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Add Menu Item</h3>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Snacks</option>
                    <option>Drinks</option>
                  </select>
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveMenuItem}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                    >
                      Save Item
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.category} - ₹{item.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition">
                        <Edit2 size={18} className="text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition"
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
