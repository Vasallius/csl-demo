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
    // Get the auth token from the request header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing auth token" })
    }
    const token = authHeader.split(" ")[1]

    // Verify the token and get user data
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
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

    console.log("group", group)

    // Store everything in a single row with JSON columns
    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        id: group.id,
        user_id: user.id,
        form_fields: formData.formFields,
        details: group
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return res.status(200).json({ group: group })
  } catch (error: any) {
    console.error("Error creating group:", error)
    return res.status(500).json({
      message: "Error creating group",
      error: error.message
    })
  }
}
