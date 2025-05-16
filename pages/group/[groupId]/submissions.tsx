import supabase from "@/utils/supabaseClient"
import { GetServerSideProps, NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// type Submission = Database["public"]["Tables"]["form_submissions"]["Row"]
type Submission = any

interface SubmissionsPageProps {
  initialSubmissions: Submission[]
  error?: string
  groupId: string // Pass groupId to the component
}

const SubmissionsPage: NextPage<SubmissionsPageProps> = ({
  initialSubmissions,
  error,
  groupId
}) => {
  const router = useRouter()
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions)
  const [loading, setLoading] = useState<boolean>(!initialSubmissions && !error) // Loading if no initial data/error

  // Basic error handling display
  useEffect(() => {
    if (error) {
      toast.error(`Error loading submissions: ${error}`)
      // Optionally redirect or show a more prominent error message
      // router.push('/') // Example redirect
    }
  }, [error, router])

  // Re-fetch on client-side if needed, or handle pagination/updates
  // (Currently just displays initial server-side props)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] circuit-pattern">
        <div className="text-center p-10 bg-bandada-black-light rounded-md border border-bandada-gold/30">
          <div className="cyber-spinner mx-auto"></div>
          <p className="mt-4 text-bandada-gold-light">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="circuit-pattern min-h-[calc(100vh-200px)] py-10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-bandada-gold mb-6">
            Submissions for Group {groupId}
          </h1>
          <p className="text-bandada-gold-light">
            No submissions found for this group yet.
          </p>
          <button
            onClick={() => router.back()}
            className="cyber-btn-secondary mt-6"
          >
            Back to Group
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="circuit-pattern min-h-[calc(100vh-200px)] py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-bandada-gold">
            Form Submissions
          </h1>
          <button onClick={() => router.back()} className="cyber-btn-secondary">
            Back to Group
          </button>
        </div>

        <div className="space-y-6">
          {submissions.map((submission, index) => (
            <div
              key={submission.id || index} // Keep using db id for React key
              className="p-6 border border-bandada-gold/40 rounded-md bg-bandada-black/60 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-bandada-gold-light mb-4 border-b border-bandada-gold/20 pb-2">
                Submission #{index + 1} {/* Use index + 1 for display order */}
              </h2>
              <div className="space-y-3">
                {/* Display group_id and hash if needed */}
                {/* <p className="text-sm text-gray-400 font-mono">Group ID: {submission.group_id}</p> */}
                {/* <p className="text-sm text-gray-400 font-mono">Data Hash: {submission.form_data_hash}</p> */}

                {/* Iterate over form_data object */}
                {submission.form_data &&
                typeof submission.form_data === "object" ? (
                  Object.entries(submission.form_data)
                    .sort(([keyA], [keyB]) => {
                      // Extract numeric part from the beginning of the key
                      const numA = parseInt(keyA.match(/^\d+/)?.[0] || "0")
                      const numB = parseInt(keyB.match(/^\d+/)?.[0] || "0")
                      return numA - numB
                    })
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col md:flex-row md:items-start"
                      >
                        <p className="w-full md:w-1/3 font-medium text-bandada-gold font-mono break-words pr-2">
                          {key}:
                        </p>
                        <p className="w-full md:w-2/3 text-white font-mono break-words bg-black/30 px-2 py-1 rounded">
                          {/* Handle different value types (string, array, etc.) */}
                          {Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 italic">
                    Invalid form data format.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { groupId } = context.params || {}

  if (!groupId || typeof groupId !== "string") {
    return { notFound: true } // Or redirect, or return an error prop
  }

  // TODO: Add access control here - verify if the logged-in user owns this groupId

  try {
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*") // Select all columns for now
      .eq("group_id", groupId)
      .order("id", { ascending: false }) // Show newest first, adjust if needed

    if (error) {
      console.error("Error fetching submissions:", error)
      // Return error to the page component to handle display
      return {
        props: { initialSubmissions: [], error: error.message, groupId }
      }
    }

    // Ensure form_data is parsed if it's stored as a stringified JSON
    // Although jsonb should handle this, belt-and-suspenders approach
    const parsedSubmissions =
      data?.map((sub) => ({
        ...sub,
        form_data:
          typeof sub.form_data === "string"
            ? JSON.parse(sub.form_data)
            : sub.form_data
      })) || []

    return {
      props: {
        initialSubmissions: parsedSubmissions,
        groupId // Pass groupId to the component
      }
    }
  } catch (err: any) {
    console.error("Server-side error:", err)
    return {
      props: {
        initialSubmissions: [],
        error: err.message || "An unexpected error occurred",
        groupId
      }
    }
  }
}

export default SubmissionsPage
