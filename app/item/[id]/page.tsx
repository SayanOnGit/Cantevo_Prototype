"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { MenuItem, CartItem, Review } from "@/types"
import { load, save } from "@/lib/storage"
import menu from "@/data/menu.json"
import { ArrowLeft, Star, Plus, Minus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ItemDetailPage() {
  const params = useParams()
  const itemId = params.id as string

  const [item, setItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", name: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    // Check persisted menu items first (admin additions), then fall back to bundled menu.json.
    // Use direct localStorage access so an explicit empty array saved by admin is respected.
    try {
      const raw = localStorage.getItem("menu_items")
      if (raw !== null) {
        const persisted: MenuItem[] = JSON.parse(raw)
        const foundInPersisted = persisted.find((m) => m.id === itemId)
        setItem(foundInPersisted || null)
      } else {
        const foundItem = menu.find((m) => m.id === itemId)
        setItem(foundItem || null)
      }
    } catch {
      const foundItem = menu.find((m) => m.id === itemId)
      setItem(foundItem || null)
    }

    // Load reviews from localStorage
    const allReviews: Review[] = load("reviews", [])
    setReviews(allReviews.filter((r) => r.itemId === itemId))

    // Load cart count
    const cart: CartItem[] = load("cart", [])
    setCartCount(cart.reduce((sum, ci) => sum + ci.qty, 0))
  }, [itemId])

  const handleAddToCart = () => {
    if (!item) return

    const cart: CartItem[] = load("cart", [])
    const existingItem = cart.find((ci) => ci.id === item.id)

    if (existingItem) {
      existingItem.qty += quantity
    } else {
      cart.push({ ...item, qty: quantity })
    }

    save("cart", cart)
    setCartCount(cart.reduce((sum, ci) => sum + ci.qty, 0))
    setQuantity(1)
  }

  const handleSubmitReview = () => {
    if (!newReview.comment.trim() || !newReview.name.trim()) {
      alert("Please fill in all fields")
      return
    }

    const review: Review = {
      id: Date.now().toString(),
      itemId: itemId,
      userName: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString(),
    }

    const allReviews: Review[] = load("reviews", [])
    allReviews.push(review)
    save("reviews", allReviews)
    setReviews([...reviews, review])
    setNewReview({ rating: 5, comment: "", name: "" })
    setShowReviewForm(false)
  }

  if (!item) {
    return (
      <>
        <Header cartCount={cartCount} />
        <main className="flex-1 flex items-center justify-center min-h-96">
          <p className="text-muted-foreground">Item not found</p>
        </main>
        <Footer />
      </>
    )
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : item.rating || 0

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium"
          >
            <ArrowLeft size={20} /> Back to Menu
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="flex items-center justify-center bg-card rounded-lg border border-border p-8">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full max-w-96 h-auto object-cover rounded-lg"
              />
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{item.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{item.description}</p>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < Math.floor(Number(averageRating)) ? "fill-accent text-accent" : "text-muted-foreground"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-foreground">{averageRating}</span>
                  </div>
                  <span className="text-muted-foreground">({reviews.length + (item.reviews || 0)} reviews)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Price</span>
                  <p className="text-4xl font-bold text-primary">₹{item.price}</p>
                </div>
                {!item.availability && <span className="text-destructive font-semibold">Out of Stock</span>}
              </div>

              {/* Nutritional Info */}
              {item.nutritionalInfo && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Nutritional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-lg font-semibold text-foreground">{item.nutritionalInfo.calories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-lg font-semibold text-foreground">{item.nutritionalInfo.protein}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-lg font-semibold text-foreground">{item.nutritionalInfo.carbs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fats</p>
                      <p className="text-lg font-semibold text-foreground">{item.nutritionalInfo.fats}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-6 py-2 font-semibold text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted transition">
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!item.availability}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Reviews ({reviews.length + (item.reviews || 0)})
            </h2>

            {/* Add Review Button */}
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mb-8 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition"
              >
                Write a Review
              </button>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Share Your Experience</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="transition"
                        >
                          <Star
                            size={32}
                            className={star <= newReview.rating ? "fill-accent text-accent" : "text-muted-foreground"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Write your review here..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitReview}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 px-4 py-2 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{review.userName}</h4>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">{review.rating}/5</span>
                    </div>
                    <p className="text-foreground">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
