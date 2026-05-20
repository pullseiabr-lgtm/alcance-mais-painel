import Providers from '@/components/Providers'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="app">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </Providers>
  )
}
