// app/dashboard/layout.tsx
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
