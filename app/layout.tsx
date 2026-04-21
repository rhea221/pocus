import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'pocus' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>{children}</body>
    </html>
  )
}