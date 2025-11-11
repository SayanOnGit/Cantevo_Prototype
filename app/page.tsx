"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Utensils, Clock, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { load } from "@/lib/storage"
import type { CartItem } from "@/types"

export default function Home() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const cart: CartItem[] = load("cart", [])
    setCartCount(cart.reduce((sum, item) => sum + item.qty, 0))

    // Update cart count when storage changes
    const handleStorageChange = () => {
      const updatedCart: CartItem[] = load("cart", [])
      setCartCount(updatedCart.reduce((sum, item) => sum + item.qty, 0))
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight text-balance">
                Fast, Fresh Food Ordering
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Order your favorite meals from our canteen. Quick checkout, real-time status updates, and pickup at your
                convenience.
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                Browse Menu <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why Choose Cantevo?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Wide Menu</h3>
                <p className="text-muted-foreground">
                  Browse through a variety of breakfast, lunch, snacks, and drinks
                </p>
              </div>

              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Real-Time Updates</h3>
                <p className="text-muted-foreground">Track your order status from pending to ready for pickup</p>
              </div>

              <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Quick Ordering</h3>
                <p className="text-muted-foreground">Simple checkout process with multiple payment options</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
