import { getMembersGroup } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import { hexlify, toBigInt } from "ethers"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type FormField = {
  id: string
  type: string
  label: string
  required: boolean
  options?: string // For select fields
  min?: number // For slider
  max?: number // For slider
  step?: number // For slider
}

export default function GroupForm() {
  const router = useRouter()
  const { groupId } = router.query
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(true)
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!groupId) return
    fetchFormFields()
  }, [groupId])

  const fetchFormFields = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("form_fields")
        .eq("id", groupId)
        .single()

      if (error) throw error

      if (data?.form_fields) {
        setFormFields(data.form_fields)
        // Initialize form values using field labels as keys
        const initialValues = data.form_fields.reduce(
          (acc: any, field: FormField) => {
            // Use field.label as the key
            acc[field.label] = field.type === "slider" ? field.min || 0 : ""
            return acc
          },
          {}
        )
        setFormValues(initialValues)
      }
    } catch (error) {
      console.error("Error fetching form fields:", error)
      toast.error("Failed to load form")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldLabel]: value // Use field label as the key
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!groupId) {
      toast.error("Group ID is missing")
      return
    }

    // Get identity from localStorage
    const localStorageTag =
      process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG || "semaphore_identity"
    const identityString = localStorage.getItem(localStorageTag)

    if (!identityString) {
      toast.error("You need to create an identity first")
      router.push("/")
      return
    }

    setLoading(true)

    try {
      // 1. Stringify the form data
      const formDataString = JSON.stringify(formValues)

      // 2. Hash the stringified data using Web Crypto API (SHA-256)
      const encoder = new TextEncoder()
      const data = encoder.encode(formDataString)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data) // Produces ArrayBuffer

      // 3. Convert the hash (ArrayBuffer) directly to a BigInt
      //    - Create Uint8Array view from the ArrayBuffer
      //    - hexlify converts the Uint8Array to a '0x...' hex string
      //    - toBigInt converts the hex string to a BigInt
      const messageBigInt = toBigInt(hexlify(new Uint8Array(hashBuffer)))
      const messageForProof = messageBigInt.toString() // Convert to string for generateProof

      // Create Semaphore identity
      const identity = new Identity(identityString)

      // Get group members from Bandada API
      const members = await getMembersGroup(groupId as string)
      if (!members) throw new Error("Failed to get group members")

      // Get the Bandada group details
      // const bandadaGroup = await getGroup(groupId as string)
      // if (!bandadaGroup) throw new Error("The Bandada group does not exist")

      // Create Semaphore group with members
      const semaphoreGroup = new Group(members)

      // 4. Generate the proof using the hash BigInt as the message
      const proof = await generateProof(
        identity,
        semaphoreGroup,
        messageForProof, // Use the BigInt hash (as string)
        groupId as string
      )

      // 5. Send the proof components AND the original form data
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merkleTreeDepth: proof.merkleTreeDepth,
          merkleTreeRoot: proof.merkleTreeRoot,
          formData: formValues, // Send the original data for server-side hashing and storage
          nullifierHash: proof.nullifier,
          points: proof.points,
          groupId
          // No need to send the message/hash itself here,
          // the server will recalculate it from formData for verification
        })
      })

      if (response.status === 200) {
        toast.success("Form submitted anonymously!")
        router.push("/")
      } else {
        const errorText = await response.text()
        console.error("Submission Error:", errorText)
        toast.error(errorText || "Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(
        "Failed to submit form: " +
          (error instanceof Error ? error.message : "Unknown error")
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] circuit-pattern">
        <div className="text-center p-10 bg-bandada-black-light rounded-md border border-bandada-gold/30">
          <div className="cyber-spinner mx-auto"></div>
          <p className="mt-4 text-bandada-gold-light">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="circuit-pattern min-h-[calc(100vh-200px)] py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-bandada-gold mb-6">
          Anonymous Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field) => (
            <div
              key={field.id}
              className="p-4 border border-bandada-gold/40 rounded-md bg-bandada-black/60"
            >
              <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={formValues[field.label] || ""}
                  onChange={(e) =>
                    handleInputChange(field.label, e.target.value)
                  }
                  required={field.required}
                  className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
                />
              )}

              {field.type === "single-select" && field.options && (
                <select
                  value={formValues[field.label] || ""}
                  onChange={(e) =>
                    handleInputChange(field.label, e.target.value)
                  }
                  required={field.required}
                  className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
                >
                  <option value="">Select an option</option>
                  {field.options.split(",").map((option, idx) => (
                    <option key={idx} value={option.trim()}>
                      {option.trim()}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "multi-select" && field.options && (
                <div className="space-y-2">
                  {field.options.split(",").map((option, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formValues[field.label]?.includes(
                          option.trim()
                        )}
                        onChange={(e) => {
                          const currentValues = formValues[field.label] || []
                          const newValues = e.target.checked
                            ? [...currentValues, option.trim()]
                            : currentValues.filter(
                                (v: string) => v !== option.trim()
                              )
                          handleInputChange(field.label, newValues)
                        }}
                        className="form-checkbox h-4 w-4 text-bandada-gold border-bandada-gold/50 rounded focus:ring-bandada-gold focus:ring-offset-black"
                      />
                      <span className="text-white font-mono">
                        {option.trim()}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "slider" && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                    value={formValues[field.label] || field.min || 0}
                    onChange={(e) =>
                      handleInputChange(field.label, Number(e.target.value))
                    }
                    className="w-full accent-bandada-gold"
                  />
                  <div className="text-bandada-gold-light text-sm font-mono">
                    Value: {formValues[field.label] || field.min || 0}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="cyber-btn-secondary"
            >
              Back
            </button>
            <button type="submit" className="cyber-btn">
              Submit Anonymously
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
