import Divider from "@/components/divider"
import { ApiSdk } from "@bandada/api-sdk"
import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// Initialize Bandada API SDK
const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

type Group = {
  id: string
  name: string
  description: string
  memberCount: number
}

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
    // Only proceed if commitment is available from the URL
    if (!commitment) return

    // Load identity from local storage
    const identityString = localStorage.getItem(localStorageTag)
    if (identityString) {
      const loadedIdentity = new Identity(identityString)

      // Verify that the URL commitment matches the loaded identity
      if (loadedIdentity.commitment.toString() === commitment) {
        setIdentity(loadedIdentity)
        setIdentityVerified(true)

        // Fetch groups the user is a member of
        fetchMemberGroups(commitment as string)
      } else {
        // Redirect to main page if commitments don't match
        router.push("/")
      }
    } else {
      // Redirect to identity creation if no identity exists
      router.push("/")
    }
  }, [commitment, localStorageTag, router])

  const fetchMemberGroups = async (memberCommitment: string) => {
    setLoading(true)
    try {
      // Here you would implement the API call to fetch groups where the user is a member
      // Example (replace with actual implementation):
      // const fetchedGroups = await apiSdk.getMemberGroups(memberCommitment)

      // For now, we'll use mock data
      const mockGroups: Group[] = [
        {
          id: "group-1",
          name: "Community Members",
          description: "A group for all community members",
          memberCount: 156
        },
        {
          id: "group-2",
          name: "Contributors",
          description: "Active project contributors",
          memberCount: 42
        }
      ]

      setMemberGroups(mockGroups)
    } catch (error) {
      console.error("Error fetching member groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinWithInvite = async () => {
    if (!identity || !inviteCode) return

    setJoinLoading(true)
    try {
      // Here you would implement the API call to join the group using the SDK
      // Example (replace with actual implementation):
      // await apiSdk.joinGroupWithInvite(inviteCode, identity.commitment.toString())

      // After successful join, refresh the groups list
      await fetchMemberGroups(identity.commitment.toString())

      // Reset the invite code input
      setInviteCode("")
      setShowInviteInput(false)

      // Show success message
      alert("Successfully joined the group!")
    } catch (error) {
      console.error("Error joining group:", error)
      alert(
        "Failed to join group. Please check your invite code and try again."
      )
    } finally {
      setJoinLoading(false)
    }
  }

  const navigateToGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`)
  }

  // If identity verification is still in progress, show loading
  if (!identityVerified && commitment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Verifying identity...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-slate-700">My Groups</h1>
      </div>

      <div className="flex justify-center items-center mt-10">
        <span className="lg:w-2/5 md:w-2/4 w-full">
          <div>
            These are the Bandada groups you are a member of. You can
            participate in group activities and prove your membership
            anonymously.
          </div>
          <Divider />
        </span>
      </div>

      <div className="flex justify-center items-center mt-5">
        <div className="lg:w-2/5 md:w-2/4 w-full">
          <div className="flex justify-between items-center mb-5">
            <div className="text-2xl font-semibold text-slate-700">
              Your Groups
            </div>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              onClick={() => setShowInviteInput(!showInviteInput)}
            >
              Join with Invite
            </button>
          </div>

          {showInviteInput && (
            <div className="mb-5 p-4 border border-slate-300 rounded-md">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-md"
                  placeholder="Enter invite code"
                  disabled={joinLoading}
                />
                <button
                  className="px-4 py-2 font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  onClick={handleJoinWithInvite}
                  disabled={!inviteCode || joinLoading}
                >
                  {joinLoading ? "Joining..." : "Join"}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600">Loading your groups...</p>
            </div>
          ) : memberGroups.length > 0 ? (
            <div className="space-y-4">
              {memberGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-slate-300 rounded-md p-4 hover:border-blue-400 cursor-pointer"
                  onClick={() => navigateToGroup(group.id)}
                >
                  <h3 className="text-xl font-medium text-slate-700">
                    {group.name}
                  </h3>
                  <p className="text-slate-600 mt-1">{group.description}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {group.memberCount} members
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-300 rounded-md">
              <p className="text-slate-600">
                You haven&apos;t joined any groups yet. Use an invite code to
                join a group.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mt-10">
        <div className="lg:w-2/5 md:w-2/4 w-full">
          <div className="flex justify-between">
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              onClick={() => router.push("/")}
            >
              Back to Identity
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/groups")}
            >
              Explore Groups
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
