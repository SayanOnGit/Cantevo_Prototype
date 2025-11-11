"use client"
import { Plus, Star } from "lucide-react"
import type { MenuItem } from "@/types"
import Link from "next/link"

interface MenuCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  return (
    <Link href={`/item/${item.id}`}>
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition group h-full cursor-pointer">
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          {!item.availability && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

          {item.rating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center gap-0.5">
                <Star size={14} className="fill-accent text-accent" />
                <span className="text-sm font-medium text-foreground">{item.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({item.reviews || 0})</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">₹{item.price}</span>
            <button
              onClick={(e) => {
                e.preventDefault()
                onAddToCart(item)
              }}
              disabled={!item.availability}
              className="flex items-center justify-center w-9 h-9 bg-secondary hover:bg-secondary/80 disabled:bg-muted disabled:cursor-not-allowed text-secondary-foreground rounded-lg transition"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
