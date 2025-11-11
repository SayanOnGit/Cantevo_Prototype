export interface MenuItem {
  id: string
  category: string
  name: string
  description: string
  price: number
  image: string
  nutritionalInfo?: {
    calories: number
    protein: string
    carbs: string
    fats: string
  }
  availability?: boolean
  rating?: number
  reviews?: number
}

export interface CartItem extends MenuItem {
  qty: number
}

export interface Order {
  id: string
  customerName: string
  email: string
  pickupTime: string
  items: CartItem[]
  subtotal: number
  discount: number
  loyaltyPointsUsed: number
  total: number
  paymentMethod: "Cash" | "Card" | "UPI"
  status: "Pending" | "Preparing" | "Ready" | "Completed"
  placedAt: string
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  totalOrders: number
}

export interface Review {
  id: string
  itemId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Feedback {
  id: string
  name: string
  email: string
  type: "feedback" | "complaint" | "suggestion"
  message: string
  date: string
  status: "new" | "reviewing" | "resolved"
}
