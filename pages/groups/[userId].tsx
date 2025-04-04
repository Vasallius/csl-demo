import CreateGroupModal from "@/components/groups/CreateGroupModal"
import { CreateGroupFormData, Group } from "@/types/group"
import supabase from "@/utils/supabaseClient"
import { ApiSdk } from "@bandada/api-sdk"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// Initialize Bandada API SDK
const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

// Constant admin ID for now
const ADMIN_ID =
  "0x6c5589644cfe9fc2b4e57882a446525221cfd44aa45cbf54d52ff0026afc286f"

export default function UserGroups() {
  const router = useRouter()
  const { userId } = router.query
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
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

        // Fetch group IDs associated with the user from your database
        const { data: userGroups, error } = await supabase
          .from("groups")
          .select("id")
          .eq("user_id", data.session.user.id)

        if (error) {
          console.error("Error fetching user groups:", error)
          // Use dummy data if there's an error
          setDummyGroups()
          setLoading(false)
          return
        }

        // Extract user's group IDs
        const userGroupIds = userGroups
          ? userGroups.map((group) => group.id)
          : []

        try {
          // Fetch all groups by admin ID
          const allAdminGroups = await apiSdk.getGroupsByAdminId(ADMIN_ID)

          // Filter groups to only include those associated with the user
          let filteredGroups: any[]

          if (userGroupIds.length > 0) {
            // If user has groups, filter the admin groups
            filteredGroups = allAdminGroups.filter((group) =>
              userGroupIds.includes(group.id)
            )
          } else {
            // If no user groups found, just use all admin groups for now
            // In a production app, you might want to show an empty state instead
            filteredGroups = allAdminGroups
          }

          // Transform Bandada groups to our format
          const formattedGroups = filteredGroups.map((group) => ({
            id: group.id,
            name: group.name || "Unnamed Group",
            description: group.description || "No description",
            members: group.members?.length || 0,
            formFields: [] // Initialize with empty form fields
          }))

          if (formattedGroups.length > 0) {
            setGroups(formattedGroups)
          } else {
            // If no groups after filtering, use dummy data
            setDummyGroups()
          }
        } catch (bandadaError) {
          console.error("Error fetching groups from Bandada:", bandadaError)
          // Use dummy data if there's an error
          setDummyGroups()
        }
      } catch (error) {
        console.error("Error in authentication check:", error)
        // Use dummy data if there's an error
        setDummyGroups()
      } finally {
        setLoading(false)
      }
    }

    // Only run the effect if we have a userId from the route
    if (userId) {
      checkUserAndFetchGroups()
    }
  }, [router, userId])

  // Function to set dummy groups data for testing
  const setDummyGroups = () => {
    setGroups([
      {
        id: "1",
        name: "Example Group 1",
        description: "This is an example group",
        members: 0,
        formFields: []
      },
      {
        id: "2",
        name: "Example Group 2",
        description: "Another example group",
        members: 0,
        formFields: []
      }
    ])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleCreateGroup = (data: CreateGroupFormData) => {
    console.log("Creating group:", data)
    // TODO: Implement group creation
    setIsCreateModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader-app"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-slate-700">My Groups</h1>
      </div>

      <div className="flex justify-end items-center mt-4 px-4 lg:px-8">
        <button
          onClick={handleSignOut}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-8 px-4 lg:px-8">
        <div className="bg-pink-100 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Group Card */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Create New Group
              </h3>
            </div>

            {/* Group Cards */}
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-2">
                  <span className="inline-block bg-pink-200 text-pink-800 text-xs px-2 py-1 rounded-full">
                    off-chain
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {group.description}
                </p>
                <div className="text-sm text-gray-500">
                  {group.members}
                  <br />
                  members
                </div>
              </div>
            ))}
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
