import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alcance+ | Agência de Marketing',
  description: 'Sistema de gestão Alcance+ Agência',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
