import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cantevo - Online Canteen Automation System",
  description: "Fast and easy food ordering from the canteen with real-time order tracking",
  generator: "Sayan",
  // viewport: {
  //   width: "device-width",
  //   initialScale: 1,
  //   maximumScale: 5,
  //   userScalable: true,
  // },
  icons: {
    icon: [
      {
        url: "/cantevo_logo.jpg",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen flex flex-col`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
