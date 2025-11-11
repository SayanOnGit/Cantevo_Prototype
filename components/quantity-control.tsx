"use client"

import { Minus, Plus } from "lucide-react"

interface QuantityControlProps {
  qty: number
  onIncrease: () => void
  onDecrease: () => void
}

export function QuantityControl({ qty, onIncrease, onDecrease }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      <button
        onClick={onDecrease}
        className="p-1 hover:bg-background rounded transition"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center font-semibold">{qty}</span>
      <button
        onClick={onIncrease}
        className="p-1 hover:bg-background rounded transition"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
