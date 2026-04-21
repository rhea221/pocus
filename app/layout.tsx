import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'pocus' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=IM+Fell+English&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}