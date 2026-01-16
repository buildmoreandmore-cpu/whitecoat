import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Allow login page without auth
  // Layout is applied to all /admin routes, check happens in pages

  return (
    <div className="min-h-screen bg-surface">
      {session && <AdminNav />}
      {children}
    </div>
  )
}
