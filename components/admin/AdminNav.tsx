'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AdminNav() {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center min-w-0">
            <Link href="/admin" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-mono text-secondary text-[10px] sm:text-xs font-bold tracking-widest whitespace-nowrap">
                WHITECOAT
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-xs sm:text-sm font-medium text-slate-600">Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
