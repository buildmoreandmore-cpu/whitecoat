'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AdminNav() {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="font-mono text-secondary text-xs font-bold tracking-widest">
                WHITECOAT BRIEF
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-slate-600">Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
