import './globals.css'
import PayPalProvider from '@/components/providers/PayPalProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

