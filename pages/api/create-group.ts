import { CreateGroupFormData } from "@/types/group"
import supabase from "@/utils/supabaseClient"
import { ApiSdk } from "@bandada/api-sdk"
import type { NextApiRequest, NextApiResponse } from "next"

const apiSdk = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Get the authenticated user
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const formData: CreateGroupFormData = req.body

    // Create group in Bandada with the correct parameters
    const groupCreateDetails = {
      name: formData.name,
      description: formData.description,
      treeDepth: 16, // Default value, can be made configurable
      fingerprintDuration: 3600 // Default 1 hour in seconds, can be made configurable
    }

    const group = await apiSdk.createGroup(
      groupCreateDetails,
      process.env.NEXT_PUBLIC_BANDADA_ADMIN_API_KEY!
    )

    // Store everything in a single row with JSON columns
    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        id: group.id,
        user_id: session.user.id,
        form_fields: formData.formFields,
        group_details: {
          name: formData.name,
          description: formData.description,
          created_at: new Date().toISOString(),
          treeDepth: groupCreateDetails.treeDepth,
          fingerprintDuration: groupCreateDetails.fingerprintDuration
        }
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return res.status(200).json({ group: newGroup })
  } catch (error: any) {
    console.error("Error creating group:", error)
    return res.status(500).json({
      message: "Error creating group",
      error: error.message
    })
  }
}
