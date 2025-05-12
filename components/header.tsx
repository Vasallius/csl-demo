import supabase from "@/utils/supabaseClient" // Assuming this is the correct path based on typical project structure
import { Session } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Header() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/admin")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="flex flex-wrap justify-between items-center p-5 mb-5 bg-bandada-black border-b border-bandada-gold/30">
      <Link
        href="/"
        className="text-xl md:mb-auto mb-2 sm:mb-0 font-bold text-bandada-gold font-mono hover:text-bandada-gold-light transition-colors"
      >
        Anonymous Forms via zk-SNARKs
      </Link>
      <div className="flex space-x-4 items-center">
        {router.pathname.startsWith("/groups") &&
          !loading &&
          session &&
          session.user && (
            <div className="flex items-center space-x-3">
              <Link href="/" className="cyber-btn-secondary text-sm">
                Back to Forms
              </Link>

              <button
                onClick={handleSignOut}
                className="bg-black hover:bg-bandada-gray-dark text-bandada-gold border border-bandada-gold/50 font-medium rounded-md px-4 py-2 transition-colors duration-200 font-mono"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-bandada-gold mr-2"></span>
                ) : null}
                Sign Out
              </button>
            </div>
          )}

        {!router.pathname.startsWith("/groups") &&
          !loading &&
          session &&
          session.user && (
            <Link
              href={`/groups/${session.user.id}`}
              className="cyber-btn-secondary text-sm"
            >
              Manage Groups
            </Link>
          )}
      </div>
    </header>
  )
}
