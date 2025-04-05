import Divider from "@/components/divider"
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
    <div>
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-slate-700">Join Group</h1>
      </div>

      <div className="flex justify-center items-center mt-10">
        <span className="lg:w-2/5 md:w-2/4 w-full">
          <div>
            You&apos;ve been invited to join a Bandada group. Your identity will
            be added to the group using zero-knowledge proofs, preserving your
            privacy while proving membership.
          </div>
          <Divider />
        </span>
      </div>

      <div className="flex justify-center items-center mt-5">
        <div className="lg:w-2/5 md:w-2/4 w-full">
          <div className="border-2 p-7 border-slate-300 rounded-md">
            <div className="mb-4">
              <div className="text-xl font-semibold text-slate-700 mb-2">
                Invite Code
              </div>
              <div className="p-2 bg-slate-100 rounded-md overflow-auto">
                {inviteCode}
              </div>
            </div>

            {identity && (
              <div className="mb-4">
                <div className="text-xl font-semibold text-slate-700 mb-2">
                  Your Identity Commitment
                </div>
                <div className="p-2 bg-slate-100 rounded-md overflow-auto">
                  {identity.commitment.toString()}
                </div>
              </div>
            )}

            {joinStatus === "error" && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                {errorMessage || "Failed to join the group. Please try again."}
              </div>
            )}

            {joinStatus === "success" ? (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
                Successfully joined the group! Redirecting to your groups...
              </div>
            ) : (
              <button
                className="w-full flex justify-center items-center space-x-3 text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100 disabled:opacity-50"
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
        <div className="lg:w-2/5 md:w-2/4 w-full">
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
