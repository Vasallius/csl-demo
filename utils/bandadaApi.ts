import { ApiSdk, DashboardUrl, Group } from "@bandada/api-sdk"

// Initialize Bandada API SDK.
const bandadaApi = new ApiSdk(process.env.NEXT_PUBLIC_BANDADA_API_URL)

export { DashboardUrl }

/**
 * Function to get group details by groupId.
 * @param groupId The group identifier.
 * @returns The group (if any).
 */
export async function getGroup(groupId: string): Promise<Group | null> {
  try {
    // Get group details using the Bandada API SDK.
    return await bandadaApi.getGroup(groupId)
  } catch (error: any) {
    console.error(error)

    // Handle errors and display appropriate alerts.
    if (error.response) {
      alert(error.response.statusText)
    } else {
      alert("Some error occurred!")
    }

    return null
  }
}

/**
 * Function to create a new group invite.
 * @param groupId The group identifier.
 * @param apiKey The admin API key.
 * @returns The created invite (if successful).
 */
export async function createInvite(groupId: string, apiKey: string) {
  try {
    // Create an invite using the Bandada API SDK.
    return await bandadaApi.createInvite(groupId, apiKey)
  } catch (error: any) {
    console.error(error)
    throw error
  }
}

/**
 * Function to add a member to a group using an API key.
 * @param groupId The group identifier.
 * @param memberId The member identifier.
 * @param apiKey The admin API key.
 */
export async function addMemberByApiKey(
  groupId: string,
  memberId: string,
  apiKey: string
): Promise<void> {
  try {
    // Add a member to the group using the Bandada API SDK.
    await bandadaApi.addMemberByApiKey(groupId, memberId, apiKey)
  } catch (error: any) {
    console.error(error)

    // Handle errors and display appropriate alerts.
    if (error.response) {
      alert(error.response.statusText)
    } else {
      alert("Some error occurred!")
    }
  }
}

/**
 * Function to get members of a group by groupId.
 * @param groupId The group identifier.
 * @returns A list of members of the group (if any).
 */
export async function getMembersGroup(
  groupId: string
): Promise<string[] | null> {
  try {
    // Get group details using the Bandada API SDK.
    const group = await bandadaApi.getGroup(groupId)
    return group.members
  } catch (error: any) {
    console.error(error)

    // Handle errors and display appropriate alerts.
    if (error.response) {
      alert(error.response.statusText)
    } else {
      alert("Some error occurred!")
    }

    return null
  }
}

/**
 * Function to get the credential group join URL.
 * @param dashboardUrl The dashboard URL.
 * @param groupId The group identifier.
 * @param commitment The identity commitment.
 * @param providerName The provider name.
 * @param redirectUri The redirect URI.
 * @returns The credential group join URL.
 */
export function getCredentialGroupJoinUrl(
  dashboardUrl: DashboardUrl,
  groupId: string,
  commitment: string,
  providerName: string,
  redirectUri: string
): string | null {
  try {
    // Get credential group join URL using the Bandada API SDK.
    return bandadaApi.getCredentialGroupJoinUrl(
      dashboardUrl,
      groupId,
      commitment,
      providerName,
      redirectUri
    )
  } catch (error: any) {
    console.error(error)

    // Handle errors and display appropriate alerts.
    if (error.response) {
      alert(error.response.statusText)
    } else {
      alert("Some error occurred!")
    }

    return null
  }
}

/**
 * Function to add a member to a group using an invite code.
 * @param groupId The group identifier.
 * @param memberId The member identifier (commitment).
 * @param inviteCode The invite code.
 * @returns A promise that resolves when the member is added.
 */
export async function joinGroupWithInvite(
  groupId: string,
  memberId: string,
  inviteCode: string
): Promise<void> {
  try {
    // Join the group using the Bandada API SDK
    await bandadaApi.addMemberByInviteCode(groupId, memberId, inviteCode)
  } catch (error: any) {
    console.error("Error joining group with invite:", error)
    throw error
  }
}

/**
 * Function to get invite details from an invite code.
 * @param inviteCode The invite code.
 * @returns A promise that resolves to the invite details.
 */
export async function getInviteDetails(inviteCode: string): Promise<any> {
  try {
    const invite = await bandadaApi.getInvite(inviteCode)
    return invite
  } catch (error: any) {
    console.error("Error getting invite details:", error)
    throw error
  }
}

/**
 * Function to get multiple groups by their IDs.
 * @param groupIds Array of group IDs to fetch.
 * @returns A promise that resolves to an array of group details.
 */
export async function getGroupsByIds(groupIds: string[]): Promise<any[]> {
  try {
    const groups = await bandadaApi.getGroupsByGroupIds(groupIds)
    return groups
  } catch (error: any) {
    console.error("Error fetching groups by IDs:", error)
    throw error
  }
}

/**
 * Function to get a single group by ID.
 * @param groupId The group ID to fetch.
 * @returns A promise that resolves to the group details.
 */
export async function getGroupById(groupId: string): Promise<any> {
  try {
    const groups = await getGroupsByIds([groupId])
    return groups[0] || null
  } catch (error: any) {
    console.error(`Error fetching group ${groupId}:`, error)
    throw error
  }
}
