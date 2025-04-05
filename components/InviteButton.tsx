import supabase from "@/utils/supabaseClient"
import { useEffect, useState } from "react"

type InviteButtonProps = {
  groupId: string
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

export default function InviteButton({ groupId }: InviteButtonProps) {
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState<boolean>(false)

  // Get the auth token when component mounts
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setToken(data.session.access_token)
      }
    }

    getSession()
  }, [])

  const createInvite = async () => {
    if (!token) {
      setError("You must be logged in to create an invite")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/create-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ groupId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create invite")
      }

      const data = await response.json()
      setInviteData(data)
      setShowInvite(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error creating invite:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const closeInvite = () => {
    setShowInvite(false)
  }

  const inviteLink = inviteData
    ? `${window.location.origin}?inviteCode=${inviteData.code}`
    : ""

  return (
    <div className="relative">
      {!showInvite ? (
        <button
          onClick={createInvite}
          disabled={loading || !token}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {loading ? "Creating..." : "Create Invite"}
        </button>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={closeInvite}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={createInvite}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "New Invite"}
          </button>
        </div>
      )}

      {error && <div className="mt-2 text-red-500 text-sm">Error: {error}</div>}

      {showInvite && inviteData && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Invite Created!</h3>
            <button
              onClick={closeInvite}
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Invite Code:</p>
            <div className="flex items-center">
              <code className="bg-white p-2 rounded border border-gray-300 flex-grow overflow-x-auto">
                {inviteData.code}
              </code>
              <button
                onClick={() => copyToClipboard(inviteData.code)}
                className="ml-2 p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Copy code"
              >
                📋
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Invite Link:</p>
            <div className="flex items-center">
              <code className="bg-white p-2 rounded border border-gray-300 flex-grow overflow-x-auto">
                {inviteLink}
              </code>
              <button
                onClick={() => copyToClipboard(inviteLink)}
                className="ml-2 p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Copy link"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
