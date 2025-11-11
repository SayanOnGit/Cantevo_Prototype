"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface HeaderProps {
  cartCount: number
}

export function Header({ cartCount }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-card to-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src={"/cantevo_logo.jpg"} width={50} height={50} alt="logo"/>
            <span className="font-bold text-lg hidden sm:inline text-foreground">Cantevo</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/menu" className="text-foreground hover:text-primary transition">
              Menu
            </Link>
            <Link href="/orders" className="text-foreground hover:text-primary transition">
              My Orders
            </Link>
            <Link href="/feedback" className="text-foreground hover:text-primary transition">
              Feedback
            </Link>
            <Link href="/admin" className="text-foreground hover:text-primary transition text-sm">
              Admin
            </Link>
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/80 transition"
            >
              <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/menu" className="block px-4 py-2 rounded-lg hover:bg-muted transition">
              Menu
            </Link>
            <Link href="/orders" className="block px-4 py-2 rounded-lg hover:bg-muted transition">
              My Orders
            </Link>
            <Link href="/feedback" className="block px-4 py-2 rounded-lg hover:bg-muted transition">
              Feedback
            </Link>
            <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-muted transition text-sm">
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
