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
        className="cyber-btn w-full"
      >
        {loading ? (
          <>
            <span className="loader mr-2"></span>
            Creating...
          </>
        ) : (
          "Create Invite"
        )}
      </button>

      {showModal && inviteData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="cyber-card max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-xl text-bandada-gold">
                Invite Ready
              </h3>
              <button
                onClick={closeModal}
                className="text-bandada-gray-light hover:text-bandada-gold text-2xl"
                title="Close"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-bandada-gold/80 mb-2">Invite Code:</p>
              <div className="flex items-center space-x-2">
                <code className="cyber-input flex-grow !bg-bandada-black !cursor-default overflow-x-auto p-2">
                  {inviteData.code}
                </code>
                <button
                  onClick={() => copyToClipboard(inviteData.code)}
                  className="cyber-btn cyber-btn-secondary p-2"
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
                <p className="text-sm text-bandada-gold/80 mb-2">
                  Invite Link:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="cyber-input flex-grow !bg-bandada-black !cursor-default overflow-x-auto p-2">
                    {inviteLink}
                  </code>
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="cyber-btn cyber-btn-secondary p-2"
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
                className="cyber-btn cyber-btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => createInvite()}
                disabled={loading}
                className="cyber-btn"
              >
                {loading ? "Creating..." : "New Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
