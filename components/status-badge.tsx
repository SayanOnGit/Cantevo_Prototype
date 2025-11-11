"use client"

import type { Order } from "@/types"

interface StatusBadgeProps {
  status: Order["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[status]}`}>
      {status}
    </span>
  )
}
