import { getInviteDetails, joinGroupWithInvite } from "@/utils/bandadaApi"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { commitment, inviteCode } = req.body

  if (!commitment || !inviteCode) {
    return res.status(400).json({
      message: "Both commitment and inviteCode are required"
    })
  }

  try {
    // First, get the group ID from the invite code
    const invite = await getInviteDetails(inviteCode)

    if (!invite || !invite.group || !invite.group.id) {
      return res
        .status(404)
        .json({ message: "Invalid invite code or group not found" })
    }

    const groupId = invite.group.id

    // Now join the group with the retrieved group ID
    await joinGroupWithInvite(groupId, commitment, inviteCode)

    return res.status(200).json({
      success: true,
      groupId: groupId,
      groupName: invite.group.name || "Unknown Group"
    })
  } catch (error: any) {
    console.error("Error joining group:", error)

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: error.response.statusText || "Failed to join group"
      })
    }

    return res.status(500).json({
      message: error.message || "An unknown error occurred"
    })
  }
}
