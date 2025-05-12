import CreateGroupModal from "@/components/groups/CreateGroupModal"
import InviteButton from "@/components/InviteButton"
import { CreateGroupFormData } from "@/types/group"
import { getGroupsByIds } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { ApiSdk, type Group as BandadaGroup } from "@bandada/api-sdk"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Initialize Bandada API SDK
const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

// Constant admin ID for now
const ADMIN_ID =
  "0x8ecabac8f4348aa9ca192ac200e1ac7c249a55c36a995a99ef49694a885ccc7d"

// Simple styled divider for this page
const CyberDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-bandada-gold/70 to-transparent my-6"></div>
)

export default function UserGroups() {
  const router = useRouter()
  const { userId } = router.query
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<BandadaGroup[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and fetch groups
    const checkUserAndFetchGroups = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          // Redirect to login if not authenticated
          router.push("/login")
          return
        }

        // Verify if the logged-in user matches the URL userId
        if (data.session.user.id !== userId) {
          // Redirect to their correct groups page if they're trying to access another user's groups
          router.push(`/groups/${data.session.user.id}`)
          return
        }

        setUser(data.session.user)

        // Fetch groups associated with the user from your database
        const { data: userGroups, error } = await supabase
          .from("groups")
          .select("id")
          .eq("user_id", data.session.user.id)

        if (error) {
          console.error("Error fetching user groups:", error)
          toast.error("Failed to fetch your groups.")
          setLoading(false)
          return
        }

        if (userGroups && userGroups.length > 0) {
          // Extract just the IDs
          const groupIds = userGroups.map((group) => group.id)

          // Fetch fresh group data from Bandada API
          const freshGroups = await getGroupsByIds(groupIds)
          setGroups(freshGroups)
        } else {
          setGroups([])
        }
      } catch (error) {
        console.error("Error in authentication check:", error)
        toast.error("An error occurred during authentication check.")
      } finally {
        setLoading(false)
      }
    }

    // Only run the effect if we have a userId from the route
    if (userId) {
      checkUserAndFetchGroups()
    }
  }, [router, userId])

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    console.log("data", data)
    const toastId = toast.loading("Creating group...")
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("No session found")
      }

      const response = await fetch("/api/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create group")
      }

      const result = await response.json()
      console.log("result", result)

      if (result.group && result.group.id) {
        setGroups((prev) => [...prev, result.group])
      } else {
        console.warn(
          "Group data missing in API response, refreshing list instead."
        )
      }

      // Close the modal
      setIsCreateModalOpen(false)

      // Show success message
      toast.success("Group created successfully!", { id: toastId })
    } catch (error: any) {
      console.error("Error creating group:", error)
      toast.error(`Failed to create group: ${error.message}`, { id: toastId })
    }
  }

  if (loading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] bg-bandada-black">
        <div className="text-center p-10 bg-black/80 rounded-md border border-bandada-gold/50">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bandada-gold mx-auto"></div>
          <p className="mt-4 text-bandada-gold font-mono">
            Loading your groups...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bandada-black min-h-[calc(100vh-200px)] py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-bandada-gold mb-4 sm:mb-0 font-mono">
            My Groups
          </h1>
        </div>

        <CyberDivider />

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-black/80 border border-bandada-gold/50 hover:border-bandada-gold hover:shadow-[0_0_20px_rgba(244,215,125,0.4)] rounded-md cursor-pointer flex flex-col items-center justify-center min-h-[220px] text-center p-6 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-bandada-gold/10 border border-bandada-gold/50 flex items-center justify-center mb-4 group-hover:bg-bandada-gold/20 group-hover:border-bandada-gold transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-bandada-gold"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-bandada-gold group-hover:text-gold-light transition-colors duration-300 font-mono">
                Create New Group
              </h3>
              <p className="text-white mt-1 font-mono">
                Start a new off-chain group
              </p>
            </div>

            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-black/80 border border-bandada-gold/50 hover:border-bandada-gold hover:shadow-[0_0_15px_rgba(244,215,125,0.3)] rounded-md flex flex-col justify-between min-h-[240px] p-6 transition-all duration-300"
              >
                <div>
                  <div className="mb-3">
                    <span className="inline-block bg-bandada-black text-bandada-gold text-xs px-2 py-1 rounded-full border border-bandada-gold/50 font-mono">
                      off-chain
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-bandada-gold mb-1 font-mono">
                    {group.name}
                  </h3>
                  <p className="text-white mb-3 flex-grow font-mono">
                    {group.description || "No description provided."}
                  </p>
                  <div className="text-bandada-gold/80 mb-4 font-mono">
                    {group.members?.length ?? "N/A"} members
                  </div>
                </div>

                <div className="mt-auto flex flex-col space-y-3">
                  <InviteButton groupId={group.id} />

                  <Link href={`/group/${group.id}/submissions`} legacyBehavior>
                    <a className="w-full text-center bg-transparent hover:bg-bandada-gold/10 text-bandada-gold border border-bandada-gold/50 font-medium rounded-md px-4 py-2 transition-colors duration-200 font-mono text-sm">
                      View Submissions
                    </a>
                  </Link>
                </div>
              </div>
            ))}

            {!loading && groups.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12 border border-dashed border-bandada-gold/50 rounded-md bg-black/60">
                <p className="text-bandada-gold font-mono">
                  You haven&apos;t created or joined any groups yet.
                </p>
                <p className="text-white mt-1 font-mono">
                  Click the &apos;+&apos; card to create your first group.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateGroupModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  )
}
