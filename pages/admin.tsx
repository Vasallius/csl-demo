import supabase from "@/utils/supabaseClient"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (signInError) {
        // Attempt to auto-confirm and retry sign-in if email is not confirmed
        if (signInError.message.includes("Email not confirmed")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { confirmed: true } }
          })

          if (signUpError) throw signUpError

          const { data: retryData, error: retryError } =
            await supabase.auth.signInWithPassword({ email, password })

          if (retryError) throw retryError

          if (retryData.user) {
            toast.success("Login successful! Redirecting...")
            router.push(`/groups/${retryData.user.id}`)
            return
          }
        }
        throw signInError
      }

      if (data.user) {
        toast.success("Login successful! Redirecting...")
        router.push(`/groups/${data.user.id}`)
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An error occurred during login.")
      toast.error(err.message || "An error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { confirmed: true } } // Auto-confirm
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Attempt to sign in immediately after sign up
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
          setMessage("Account created! Please try logging in.")
          toast.success("Account created! Please try logging in.")
        } else if (signInData.user) {
          toast.success("Account created and logged in! Redirecting...")
          router.push(`/groups/${signInData.user.id}`)
        }
      }
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "An error occurred during sign up.")
      toast.error(err.message || "An error occurred during sign up.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="circuit-pattern min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bandada-black-light p-8 sm:p-10 rounded-lg border border-bandada-gold/30 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-bandada-gold font-mono">
            Admin Access
          </h1>
          <p className="mt-3 text-bandada-gold-light font-mono">
            Manage groups and users.
          </p>
          <hr className="my-5 h-px border-t-0 bg-bandada-gold/30" />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-4 font-mono text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-md mb-4 font-mono text-sm">
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-bandada-gold font-mono mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input w-full"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-bandada-gold font-mono mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input w-full"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="cyber-btn w-full justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2"></span>
                  Processing...
                </span>
              ) : (
                "Login"
              )}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="cyber-btn-secondary w-full justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2"></span>
                  Processing...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
