"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(false)
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sightlinemedia.net').toLowerCase()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setIsAdmin(!!(user?.email && user.email.toLowerCase() === adminEmail))
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setIsAdmin(!!(session?.user?.email && session.user.email.toLowerCase() === adminEmail))
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, adminEmail])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Header */}
      <header className="border-b-4 border-black bg-yellow-400 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center relative p-3 md:p-4">
          <Link
            href="/"
            className="text-xl md:text-2xl font-black uppercase tracking-tight hover:underline decoration-4 absolute left-3 md:left-4"
          >
            SIGHTLINE
          </Link>
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link href="/" className="font-bold uppercase text-sm hover:underline decoration-4">
              HOME
            </Link>
            <Link href="/portfolio" className="font-bold uppercase text-sm hover:underline decoration-4">
              PORTFOLIO
            </Link>
            <Link href="/contact" className="font-bold uppercase text-sm hover:underline decoration-4">
              CONTACT
            </Link>
          </nav>
          <div className="absolute right-3 md:right-4">
            {isAuthenticated === null ? (
              // Loading state
              <div className="w-20 h-8"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button className="bg-purple-400 text-black border-2 md:border-3 border-black font-black uppercase text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-500 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                      ADMIN
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button className="bg-cyan-400 text-black border-2 md:border-3 border-black font-black uppercase text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
                    DASHBOARD
                  </Button>
                </Link>
              </div>
            ) : (
              // Not authenticated: Show Login button
              <Link href="/login">
                <Button className="text-white border-2 md:border-3 border-black font-black uppercase text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group" style={{ background: 'linear-gradient(to bottom right, #3b82f6 0%, #3b82f6 50%, #ec4899 50%, #ec4899 100%)' }}>
                  <span className="relative z-10">LOGIN</span>
                  <span className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer className="bg-pink-500 border-t-4 border-black py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4">SIGHTLINE</div>
              <p className="font-bold text-sm md:text-base">
                MAKING THE WEB MORE INTERESTING, ONE BRUTAL DESIGN AT A TIME.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase pt-[46px] pb-[46px] pl-[37px] pr-[37px] border-0 bg-transparent">WEB DESIGN</h3>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase mb-4">CONTACT</h3>
              <div className="space-y-2 font-bold">
                <div>info@sightlinemedia.net</div>
                <div>240 728 8323</div>
                <div>Mclean, VA</div>
              </div>
            </div>
          </div>
          <div className="border-t-4 border-black mt-8 md:mt-12 pt-6 md:pt-8 text-center font-bold uppercase text-white text-xs md:text-sm">
            © 2025 SIGHTLINE - ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  )
}
