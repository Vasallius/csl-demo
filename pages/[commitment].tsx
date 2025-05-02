import { ApiSdk } from "@bandada/api-sdk"
import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Initialize Bandada API SDK
const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
}

// Simple styled divider for this page
const CyberDivider = () => (
  <hr className="my-5 h-px border-t-0 bg-bandada-gold/30" />
)

export default function MemberGroups() {
  const router = useRouter()
  const { commitment } = router.query

  const [identity, setIdentity] = useState<Identity>()
  const [memberGroups, setMemberGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [identityVerified, setIdentityVerified] = useState<boolean>(false)
  const [inviteCode, setInviteCode] = useState<string>("")
  const [showInviteInput, setShowInviteInput] = useState<boolean>(false)
  const [joinLoading, setJoinLoading] = useState<boolean>(false)

  // Environment variable for local storage key
  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  useEffect(() => {
    if (!commitment) return

    const identityString = localStorage.getItem(localStorageTag)
    if (identityString) {
      const loadedIdentity = new Identity(identityString)

      if (loadedIdentity.commitment.toString() === commitment) {
        setIdentity(loadedIdentity)
        setIdentityVerified(true)
        fetchMemberGroups(commitment as string)
      } else {
        toast.error("Identity mismatch. Redirecting...")
        router.push("/")
      }
    } else {
      toast.error("No identity found. Redirecting...")
      router.push("/")
    }
  }, [commitment, localStorageTag, router])

  const fetchMemberGroups = async (memberCommitment: string) => {
    setLoading(true)
    try {
      const bandadaGroups = await apiSdk.getGroupsByMemberId(memberCommitment)
      console.log("bandadaGroups", bandadaGroups)
      const transformedGroups: Group[] = bandadaGroups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description || "No description available",
        memberCount: group.members?.length || 0 // Note: members might not always be populated depending on API version/call
        // Consider fetching member count separately if needed: await apiSdk.getGroup(group.id)
      }))
      setMemberGroups(transformedGroups)
    } catch (error) {
      console.error("Error fetching member groups:", error)
      toast.error("Could not fetch your groups.")
      setMemberGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWithInvite = async () => {
    if (!identity || !inviteCode) return

    setJoinLoading(true)
    const toastId = toast.loading("Joining group...")
    try {
      // Instead of calling Bandada API directly, use our server endpoint
      // which will handle both joining the group AND updating root_history
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
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to join group")
      }

      const data = await response.json()

      await fetchMemberGroups(identity.commitment.toString()) // Refresh list
      setInviteCode("")
      setShowInviteInput(false)
      toast.success(`Successfully joined ${data.groupName || "the group"}!`, {
        id: toastId
      })
    } catch (error: any) {
      console.error("Error joining group:", error)
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to join group. Check invite code."
      toast.error(message, { id: toastId })
    } finally {
      setJoinLoading(false)
    }
  }
  const navigateToGroup = (groupId: string) => {
    // Decide where clicking a group should lead. To a generic group page?
    // For now, let's just log it or perhaps show details if we had them
    console.log("Navigate to group:", groupId)
    router.push(`/group/${groupId}`)
  }

  // Loading state for initial identity verification
  if (!identityVerified && commitment) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] circuit-pattern">
        <div className="text-center p-10 bg-bandada-black-light rounded-md border border-bandada-gold/30">
          <div className="cyber-spinner mx-auto"></div>
          <p className="mt-4 text-bandada-gold-light">Verifying identity...</p>
        </div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="circuit-pattern min-h-[calc(100vh-200px)] py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-bandada-gold mb-6">
          My Groups
        </h1>

        <div className="text-center text-bandada-gold-light mb-8 max-w-xl mx-auto">
          These are the Bandada groups you are a member of. Participate in group
          activities and prove your membership anonymously.
        </div>
        <CyberDivider />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-semibold text-bandada-gold">
              Your Groups ({memberGroups.length})
            </h2>
            <button
              className="cyber-btn text-sm" // Adjusted button style
              onClick={() => setShowInviteInput(!showInviteInput)}
              aria-expanded={showInviteInput}
            >
              {showInviteInput ? "Cancel Join" : "Join with Invite"}
            </button>
          </div>

          {showInviteInput && (
            <div className="cyber-card mb-6 p-5">
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="cyber-input flex-1" // Use cyber-input style
                  placeholder="Enter invite code"
                  disabled={joinLoading}
                  aria-label="Invite Code"
                />
                <button
                  className="cyber-btn" // Use cyber-btn style
                  onClick={handleJoinWithInvite}
                  disabled={!inviteCode || joinLoading}
                >
                  {joinLoading ? (
                    <>
                      <span className="loader mr-2"></span>{" "}
                      {/* Use adapted loader */}
                      Joining...
                    </>
                  ) : (
                    "Join Group"
                  )}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="cyber-spinner mx-auto"></div>
              <p className="mt-3 text-bandada-gold-light">
                Loading your groups...
              </p>
            </div>
          ) : memberGroups.length > 0 ? (
            <div className="space-y-4">
              {memberGroups.map((group) => (
                <div
                  key={group.id}
                  className="cyber-card cursor-pointer" // Use cyber-card style
                  onClick={() => navigateToGroup(group.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) =>
                    e.key === "Enter" && navigateToGroup(group.id)
                  } // Accessibility
                >
                  <h3 className="text-xl font-bold text-bandada-gold">
                    {group.name}
                  </h3>
                  <p className="text-bandada-gold-light mt-1 text-sm">
                    {group.description}
                  </p>
                  <p className="text-xs text-bandada-gold/70 mt-2">
                    {group.memberCount} members
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-bandada-gold/50 rounded-md circuit-pattern">
              <p className="text-bandada-gold-light">
                You haven&apos;t joined any groups yet.
              </p>
              <p className="text-bandada-gold/80 text-sm mt-1">
                Use an invite code above to join a group.
              </p>
            </div>
          )}
        </div>

        {/* <CyberDivider />

        <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
          <button
            className="cyber-btn-secondary w-full sm:w-auto" // Secondary style for back
            onClick={() => router.push("/")}
          >
            Back to Identity
          </button>
          <button
            className="cyber-btn w-full sm:w-auto" // Primary style
            onClick={() => router.push("/groups")} // Navigate to a page showing all available groups
          >
            Explore All Groups
          </button>
        </div> */}
      </div>
    </div>
  )
}
