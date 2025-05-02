import { getGroup } from "@/utils/bandadaApi"
import supabase from "@/utils/supabaseClient"
import { verifyProof } from "@semaphore-protocol/core"
import crypto from "crypto"
import { toBigInt } from "ethers"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  let errorLog = ""

  const {
    merkleTreeDepth,
    merkleTreeRoot,
    formData,
    nullifierHash,
    points,
    groupId
  } = req.body

  console.log(`[Submit Form API] Received request for groupId: ${groupId}`)
  console.log(
    `[Submit Form API] Merkle Root from Client Proof: ${merkleTreeRoot}`
  )

  try {
    // Get the group details based on the group ID
    const group = await getGroup(groupId)

    // Check if the group exists
    if (!group) {
      errorLog = "This group does not exist"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    // Fetch the current merkle root from the database
    const { data: currentMerkleRoot, error: errorRootHistory } = await supabase
      .from("root_history")
      .select()
      .order("created_at", { ascending: false })
      .limit(1)

    // Handle error if occurred during fetching current merkle root
    if (errorRootHistory) {
      console.error(
        "[Submit Form API] Error fetching root history:",
        errorRootHistory
      )
      res.status(500).end()
      return
    }

    // Check if current merkle root exists
    if (!currentMerkleRoot) {
      errorLog = "Wrong currentMerkleRoot"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    console.log(
      `[Submit Form API] Current DB Root: ${currentMerkleRoot[0].root}`
    )

    // Compare merkle tree roots
    if (merkleTreeRoot !== currentMerkleRoot[0].root) {
      console.log(
        `[Submit Form API] Client root differs from current DB root. Checking history...`
      )

      // Check if the merkle root exists in history
      const { data: dataMerkleTreeRoot, error: errorMerkleTreeRoot } =
        await supabase.from("root_history").select().eq("root", merkleTreeRoot)

      if (errorMerkleTreeRoot) {
        console.error(
          "[Submit Form API] Error checking root history:",
          errorMerkleTreeRoot
        )
        res.status(500).end()
        return
      }

      // Check if dataMerkleTreeRoot is valid
      if (!dataMerkleTreeRoot) {
        errorLog = "Wrong dataMerkleTreeRoot"
        console.error(`[Submit Form API] ${errorLog}`)
        res.status(500).send(errorLog)
        return
      }

      // Check if the merkle root is in the history
      if (dataMerkleTreeRoot.length === 0) {
        errorLog = "Merkle Root is not part of the group"
        console.error(`[Submit Form API] ${errorLog}`)
        res.status(500).send(errorLog)
        return
      }

      console.log(
        "[Submit Form API] Found root in history:",
        dataMerkleTreeRoot
      )

      // Optional: Check if the merkle root is expired
      // const merkleTreeRootDuration = group.fingerprintDuration
      // if (
      //   Date.now() >
      //   Date.parse(dataMerkleTreeRoot[0].created_at) + merkleTreeRootDuration
      // ) {
      //   errorLog = "Merkle Tree Root is expired"
      //   console.error(`[Submit Form API] ${errorLog}`)
      //   res.status(500).send(errorLog)
      //   return
      // }
    }

    // Check if nullifier has been used before
    const { data: nullifier, error: errorNullifierHash } = await supabase
      .from("nullifier_hash")
      .select("nullifier")
      .eq("nullifier", nullifierHash)

    // Handle error if occurred during fetching nullifier
    if (errorNullifierHash) {
      console.error(
        "[Submit Form API] Error checking nullifier:",
        errorNullifierHash
      )
      res.status(500).end()
      return
    }

    // Check if nullifier is valid
    if (!nullifier) {
      errorLog = "Wrong nullifier"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    // Check for duplicate nullifier usage
    if (nullifier.length > 0) {
      errorLog = "You are using the same nullifier twice"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    // Hash the form data for the proof verification
    const formDataString = JSON.stringify(formData)
    const serverHashHex = crypto
      .createHash("sha256")
      .update(formDataString)
      .digest("hex")
    const messageToVerify = toBigInt("0x" + serverHashHex).toString()

    console.log(
      `[Submit Form API] Verifying proof with message hash: ${messageToVerify}`
    )

    // Verify the proof using Semaphore protocol
    const isVerified = await verifyProof({
      merkleTreeDepth,
      merkleTreeRoot,
      message: messageToVerify,
      nullifier: nullifierHash,
      scope: groupId,
      points
    })

    // Handle unverified proof
    if (!isVerified) {
      errorLog = "The proof was not verified successfully"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    console.log("[Submit Form API] Proof verified successfully")

    // Insert nullifier into the database
    const { error: errorNullifierInsert } = await supabase
      .from("nullifier_hash")
      .insert([{ nullifier: nullifierHash }])

    // Handle error if occurred during inserting nullifier
    if (errorNullifierInsert) {
      console.error(
        "[Submit Form API] Error inserting nullifier:",
        errorNullifierInsert
      )
      res.status(500).end()
      return
    }

    // Insert form submission into the database
    console.log({
      group_id: groupId,
      form_data: formData,
      form_data_hex: serverHashHex
    })

    const { data: dataSubmission, error: errorSubmission } = await supabase
      .from("form_submissions")
      .insert([
        {
          group_id: groupId,
          form_data: formData,
          form_data_hash: serverHashHex
        }
      ])
      .select()

    // Handle error if occurred during inserting form submission
    if (errorSubmission) {
      console.error(
        "[Submit Form API] Error inserting form submission:",
        errorSubmission
      )
      res.status(500).end()
      return
    }

    // Check if form submission data is valid
    if (!dataSubmission) {
      errorLog = "Wrong dataSubmission"
      console.error(`[Submit Form API] ${errorLog}`)
      res.status(500).send(errorLog)
      return
    }

    console.log(`[Submit Form API] Form submission stored successfully`)

    // Return the inserted form submission data
    res.status(200).json(dataSubmission)
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("[Submit Form API] Unhandled error:", error)
    res.status(500).end()
  }
}
