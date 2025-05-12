import Stepper from "@/components/stepper"
import { ApiSdk } from "@bandada/api-sdk"
import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// Initialize Bandada API SDK
const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

export default function JoinGroup() {
  const router = useRouter()
  const { inviteCode, groupId } = router.query

  const [identity, setIdentity] = useState<Identity>()
  const [loading, setLoading] = useState<boolean>(false)
  const [joinStatus, setJoinStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Environment variable for local storage key
  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  useEffect(() => {
    // Only proceed if inviteCode is available
    if (!inviteCode) {
      router.push("/")
      return
    }

    // Load identity from local storage
    const identityString = localStorage.getItem(localStorageTag)
    if (identityString) {
      const identity = new Identity(identityString)
      setIdentity(identity)
    } else {
      // Redirect to identity creation if no identity exists
      router.push(`/?inviteCode=${inviteCode}`)
    }
  }, [localStorageTag, router, inviteCode])

  const handleJoinGroup = async () => {
    if (!identity || !inviteCode) return

    setJoinStatus("loading")
    setLoading(true)

    try {
      // Call our API endpoint to join the group
      const response = await fetch("/api/join-with-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commitment: identity.commitment.toString(),
          inviteCode: inviteCode
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to join group")
      }

      const data = await response.json()
      console.log(data)
      setJoinStatus("success")

      // After successful join, redirect to the member's groups page
      setTimeout(() => {
        router.push(`/${identity.commitment.toString()}`)
      }, 1000)
    } catch (error) {
      console.error("Error joining group:", error)
      setJoinStatus("error")
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bandada-black min-h-screen py-12 px-4">
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-bandada-gold font-mono">
          Join Group
        </h1>
      </div>

      <div className="flex justify-center items-center mt-10">
        <span className="lg:w-2/5 md:w-2/4 w-full">
          <div className="text-white font-mono">
            You&apos;ve been invited to join a Bandada group. Your identity will
            be added to the group using zero-knowledge proofs, preserving your
            privacy while proving membership.
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-bandada-gold/70 to-transparent my-6"></div>
        </span>
      </div>

      <div className="flex justify-center items-center mt-5">
        <div className="lg:w-2/5 md:w-2/4 w-full">
          <div className="border border-bandada-gold/50 bg-black/80 p-7 rounded-md">
            <div className="mb-4">
              <div className="text-xl font-semibold text-bandada-gold font-mono mb-2">
                Invite Code
              </div>
              <div className="p-2 bg-black/60 text-white rounded-md overflow-auto border border-bandada-gold/30 font-mono">
                {inviteCode}
              </div>
            </div>

            {identity && (
              <div className="mb-4">
                <div className="text-xl font-semibold text-bandada-gold font-mono mb-2">
                  Your Identity Commitment
                </div>
                <div className="p-2 bg-black/60 text-white rounded-md overflow-auto border border-bandada-gold/30 font-mono">
                  {identity.commitment.toString()}
                </div>
              </div>
            )}

            {joinStatus === "error" && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md font-mono">
                {errorMessage || "Failed to join the group. Please try again."}
              </div>
            )}

            {joinStatus === "success" ? (
              <div className="mb-4 p-3 bg-green-900/50 text-green-300 border border-green-700 rounded-md font-mono">
                Successfully joined the group! Redirecting to your groups...
              </div>
            ) : (
              <button
                className="w-full flex justify-center items-center space-x-3 text-lg font-medium rounded-md px-5 py-3 bg-bandada-gold hover:bg-gold-light text-bandada-black disabled:opacity-50 font-mono"
                onClick={handleJoinGroup}
                disabled={!identity || joinStatus === "loading"}
              >
                {joinStatus === "loading" ? "Joining..." : "Join Group"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mt-10">
        <div className="lg:w-2/5 md:w-2/4 w-full text-white font-mono">
          <Stepper
            step={2}
            onPrevClick={() => router.push("/")}
            onNextClick={
              joinStatus === "success"
                ? () => router.push(`/${identity?.commitment.toString()}`)
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}
