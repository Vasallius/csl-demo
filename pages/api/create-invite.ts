import { createInvite } from "@/utils/bandadaApi"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { groupId } = req.body

  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required" })
  }

  try {
    // Use the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_BANDADA_ADMIN_API_KEY

    if (!apiKey) {
      return res.status(500).json({ message: "API key is not configured" })
    }

    const invite = await createInvite(groupId, apiKey)
    return res.status(200).json(invite)
  } catch (error: any) {
    console.error("Error creating invite:", error)

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: error.response.statusText || "Failed to create invite"
      })
    }

    return res.status(500).json({ message: "An unknown error occurred" })
  }
}
