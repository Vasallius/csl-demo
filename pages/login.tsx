import supabase from "@/utils/supabaseClient"
import { useRouter } from "next/router"
import { useState } from "react"

export default function Login() {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // If the error is about email not confirmed, let's try to auto-confirm it
        if (error.message.includes("Email not confirmed")) {
          // Try to sign up again which will auto-confirm the email
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  confirmed: true
                }
              }
            })

          if (signUpError) {
            throw signUpError
          }

          // Try logging in again after confirming
          const { data: retryData, error: retryError } =
            await supabase.auth.signInWithPassword({
              email,
              password
            })

          if (retryError) {
            throw retryError
          }

          if (retryData.user) {
            router.push(`/groups/${retryData.user.id}`)
            return
          }
        }

        throw error
      }

      if (data.user) {
        // Redirect to user's groups page
        router.push(`/groups/${data.user.id}`)
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
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
      // Sign up and immediately sign in
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            confirmed: true
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Try to immediately sign in after signup
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password
          })

        if (signInError) {
          setMessage("Account created! Please try logging in.")
        } else if (signInData.user) {
          router.push(`/groups/${signInData.user.id}`)
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bandada-black h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-bandada-gold font-mono">
            Login
          </h1>
          <p className="mt-3 text-white font-mono">
            Sign in with your email and password or create a new account.
          </p>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-bandada-gold to-transparent my-6"></div>
        </div>

        {error && (
          <div className="bg-black/80 border-2 border-red-500 text-white px-4 py-3 rounded-md mb-4 font-mono">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-black/80 border-2 border-green-500 text-white px-4 py-3 rounded-md mb-4 font-mono">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-bandada-gold font-mono mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-bandada-gold/70 bg-black/60 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-bandada-gold font-mono mb-2"
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
                className="appearance-none relative block w-full px-3 py-3 border border-bandada-gold/70 bg-black/60 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-bandada-black bg-bandada-gold hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bandada-gold font-mono font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-bandada-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-bandada-gold rounded-md text-bandada-gold bg-transparent hover:bg-bandada-gold/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bandada-gold font-mono font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-bandada-gold"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
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
