import supabase from "@/utils/supabaseClient"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type InviteButtonProps = {
  groupId: string
  className?: string
}

type InviteResponse = {
  code: string
  isRedeemed: boolean
  createdAt: string
  group: {
    id: string
    name: string
    description: string
    adminId: string
    treeDepth: number
    fingerprintDuration: number
    credentials: Record<string, any>
    createdAt: string
    updatedAt: string
  }
}

export default function InviteButton({
  groupId,
  className
}: InviteButtonProps) {
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setToken(data.session.access_token)
      } else {
        console.warn("No active session found for creating invites.")
      }
    }

    getSession()
  }, [])

  const createInvite = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        throw new Error("No session found")
      }

      setToken(data.session.access_token)

      const response = await fetch("/api/create-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`
        },
        body: JSON.stringify({ groupId })
      })

      if (!response.ok) {
        throw new Error("Failed to create invite")
      }

      const inviteData = await response.json()
      setInviteData(inviteData)
      setShowModal(true)
    } catch (error) {
      console.error("Error creating invite:", error)
      toast.error("Failed to create invite")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      toast.error("Clipboard access not available or denied.")
      return
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!")
      })
      .catch((err) => {
        toast.error("Failed to copy.")
        console.error("Failed to copy:", err)
      })
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const inviteLink =
    typeof window !== "undefined" && inviteData
      ? `${window.location.origin}/?inviteCode=${inviteData.code}`
      : ""

  return (
    <div className={` ${className || "w-full"} flex flex-col`}>
      <button
        onClick={createInvite}
        disabled={loading || !token}
        className="font-mono bg-bandada-gold hover:bg-gold-light text-bandada-black font-medium rounded-md px-4 py-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
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
            Creating...
          </span>
        ) : (
          "Create Invite"
        )}
      </button>

      {showModal && inviteData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-bandada-gold/70 rounded-md max-w-md w-full p-6 relative shadow-[0_0_30px_rgba(244,215,125,0.15)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-xl text-bandada-gold font-mono">
                Invite Ready
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-bandada-gold text-2xl transition-colors"
                title="Close"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-bandada-gold font-mono mb-2">
                Invite Code:
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-grow bg-bandada-black/80 border border-bandada-gold/30 text-white overflow-x-auto p-2 rounded-md font-mono">
                  {inviteData.code}
                </code>
                <button
                  onClick={() => copyToClipboard(inviteData.code)}
                  className="bg-bandada-black hover:bg-bandada-gray-dark text-bandada-gold border border-bandada-gold/50 p-2 rounded-md transition-colors"
                  title="Copy code"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {inviteLink && (
              <div className="mb-4">
                <p className="text-sm text-bandada-gold font-mono mb-2">
                  Invite Link:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-grow bg-bandada-black/80 border border-bandada-gold/30 text-white overflow-x-auto p-2 rounded-md font-mono">
                    {inviteLink}
                  </code>
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="bg-bandada-black hover:bg-bandada-gray-dark text-bandada-gold border border-bandada-gold/50 p-2 rounded-md transition-colors"
                    title="Copy link"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="bg-bandada-black hover:bg-bandada-gray-dark text-bandada-gold border border-bandada-gold/50 font-medium rounded-md px-4 py-2 transition-colors duration-200 font-mono"
              >
                Close
              </button>
              <button
                onClick={() => createInvite()}
                disabled={loading}
                className="font-mono bg-bandada-gold hover:bg-gold-light text-bandada-black font-medium rounded-md px-4 py-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Creating...
                  </span>
                ) : (
                  "New Invite"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
