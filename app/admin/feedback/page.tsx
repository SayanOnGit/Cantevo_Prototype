"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Feedback } from "@/types"
import { load, save } from "@/lib/storage"
import Link from "next/link"
import { AlertCircle, MessageCircle, Lightbulb, ChevronLeft } from "lucide-react"

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<"all" | "new" | "reviewing" | "resolved">("all")

  useEffect(() => {
    setMounted(true)
    const allFeedback: Feedback[] = load("feedback", [])
    setFeedback(allFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }, [])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleUpdateStatus = (id: string, newStatus: "new" | "reviewing" | "resolved") => {
    const updated = feedback.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    setFeedback(updated)
    save("feedback", updated)
  }

  const filteredFeedback = feedback.filter((f) => (filter === "all" ? true : f.status === filter))

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return <AlertCircle size={20} className="text-destructive" />
      case "suggestion":
        return <Lightbulb size={20} className="text-accent" />
      default:
        return <MessageCircle size={20} className="text-primary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  return (
    <>
      <Header cartCount={0} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium"
          >
            <ChevronLeft size={20} /> Back to Admin
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Feedback Management</h1>
            <p className="text-muted-foreground">Review and respond to user feedback</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border pb-4">
            {["all", "new", "reviewing", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 font-medium rounded-lg transition ${
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {feedback.filter((f) => f.status === (status === "all" ? f.status : status)).length})
              </button>
            ))}
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No feedback in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(item.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.email} • {item.date}
                        </p>
                        <p className="text-foreground">{item.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {["new", "reviewing", "resolved"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(item.id, status as any)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          item.status === status
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
