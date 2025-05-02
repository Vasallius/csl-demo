import {
  getGroup,
  getInviteDetails,
  joinGroupWithInvite
} from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { getRoot } from "@/utils/useSemaphore"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" })
    return
  }

  const { commitment, inviteCode } = req.body

  if (!commitment || !inviteCode) {
    res.status(400).json({
      message: "Both commitment and inviteCode are required"
    })
    return
  }

  console.log(
    `[JOIN-INVITE] Starting join process with invite code ${inviteCode.slice(
      0,
      10
    )}...`
  )

  try {
    // First, get the group ID from the invite code
    console.log(`[JOIN-INVITE] Getting invite details from Bandada...`)
    const invite = await getInviteDetails(inviteCode)

    if (!invite || !invite.group || !invite.group.id) {
      console.error(`[JOIN-INVITE] Invalid invite code or group not found`)
      res
        .status(404)
        .json({ message: "Invalid invite code or group not found" })
      return
    }

    const groupId = invite.group.id
    const groupName = invite.group.name || "Unknown Group"
    console.log(`[JOIN-INVITE] Invite is for group: ${groupId} (${groupName})`)

    // Now join the group with the retrieved group ID
    console.log(
      `[JOIN-INVITE] Joining group with commitment ${commitment.slice(
        0,
        10
      )}...`
    )
    await joinGroupWithInvite(groupId, commitment, inviteCode)
    console.log(`[JOIN-INVITE] Successfully joined group via Bandada API`)

    // Get the updated group details after joining
    console.log(`[JOIN-INVITE] Fetching updated group details...`)
    const updatedGroup = await getGroup(groupId)

    // If group exists, update root history in the backend.
    if (updatedGroup) {
      console.log(
        `[JOIN-INVITE] Group fetched successfully. Member count: ${updatedGroup.members.length}`
      )
      console.log(`[JOIN-INVITE] Calculating new Merkle root...`)
      const groupRoot = await getRoot(updatedGroup.members)
      console.log(
        `[JOIN-INVITE] New Merkle root calculated: ${groupRoot.toString()}`
      )

      // Check if this root already exists in the database
      console.log(
        `[JOIN-INVITE] Checking if root already exists in database...`
      )
      const { data: existingRoots } = await supabase
        .from("root_history")
        .select("id")
        .eq("root", groupRoot.toString())

      if (existingRoots && existingRoots.length > 0) {
        console.log(
          `[JOIN-INVITE] Root already exists in database (ID: ${existingRoots[0].id}). Skipping insert.`
        )
      } else {
        console.log(`[JOIN-INVITE] Inserting new root into database...`)
        // Note: Removed group_id from the insert since your table doesn't have this column
        const { error, data: insertedRoot } = await supabase
          .from("root_history")
          .insert([{ root: groupRoot.toString() }])
          .select()

        // Handle error if occurred during insertion.
        if (error) {
          console.error(`[JOIN-INVITE] Error inserting root history:`, error)
          // We'll still return success for the join itself
        } else {
          console.log(
            `[JOIN-INVITE] Root history updated successfully. New record ID: ${insertedRoot?.[0]?.id}`
          )
        }
      }
    } else {
      console.warn(
        `[JOIN-INVITE] Could not fetch updated group ${groupId} after invite join.`
      )
    }

    // Send success response explicitly at the end of the try block
    res.status(200).json({
      success: true,
      groupId: groupId,
      groupName: groupName
    })
  } catch (error) {
    console.error(`[JOIN-INVITE] Error in join process:`, error)
    res.status(500).json({
      message: "Failed to join group with invite",
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
