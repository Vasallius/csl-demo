import Divider from "@/components/divider"
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
            router.push("/test")
            return
          }
        }

        throw error
      }

      if (data.user) {
        // Redirect to test page on successful login
        router.push("/test")
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
          router.push("/test")
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-slate-700">Login</h1>
      </div>
      <div className="flex justify-center items-center mt-10">
        <span className="lg:w-2/5 md:w-2/4 w-full">
          <div>
            Sign in with your email and password or create a new account.
          </div>
          <Divider />
        </span>
      </div>
      <div className="flex justify-center items-center mt-5">
        <div className="lg:w-2/5 md:w-2/4 w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                onClick={handleLogin}
                disabled={loading}
                className="flex justify-center items-center w-full space-x-3 disabled:cursor-not-allowed disabled:opacity-50 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
              >
                {loading && <div className="loader"></div>}
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="flex justify-center items-center w-full space-x-3 disabled:cursor-not-allowed disabled:opacity-50 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-slate-100"
              >
                {loading && <div className="loader"></div>}
                <span>Sign Up</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
