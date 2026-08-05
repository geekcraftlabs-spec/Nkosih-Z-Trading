import './globals.css'

export const metadata = {
  title: 'Debit Order System',
  description: 'Smart payment approvals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">{children}</body>
    </html>
  )
}