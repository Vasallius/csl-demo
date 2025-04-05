import Divider from "@/components/divider"
import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const { inviteCode } = router.query

  // State to store the user's Semaphore identity.
  // You can learn more about Semaphore identity here
  // https://docs.semaphore.pse.dev/V3/guides/identities.
  const [_identity, setIdentity] = useState<Identity>()
  const [loading, setLoading] = useState<boolean>(true)

  // Environment variable for local storage key.
  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  // Effect to load identity from local storage or prompt creation.
  useEffect(() => {
    const identityString = localStorage.getItem(localStorageTag)

    if (identityString) {
      // If identity exists in local storage, load it.
      const identity = new Identity(identityString)
      setIdentity(identity)

      if (inviteCode) {
        // If there's an invite code, go to join group page
        router.push(`/join-group?inviteCode=${inviteCode}`)
      } else {
        // Otherwise, go to member's groups page
        router.push(`/${identity.commitment.toString()}`)
      }
    } else {
      // No identity exists
      setLoading(false)
      console.log("Create your Semaphore identity 👆🏽")
    }
  }, [localStorageTag, inviteCode, router])

  // Function to create a new Semaphore identity and store it.
  const createIdentity = async () => {
    const identity = new Identity()
    setIdentity(identity)
    localStorage.setItem(localStorageTag, identity.export())
    console.log("Your new Semaphore identity was just created 🎉")

    if (inviteCode) {
      // If there's an invite code, go to join group page
      router.push(`/join-group?inviteCode=${inviteCode}`)
    } else {
      // Otherwise, go to member's groups page
      router.push(`/${identity.commitment.toString()}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <div className="flex justify-center items-center">
          <h1 className="text-3xl font-semibold text-slate-700">Identities</h1>
        </div>
        {inviteCode && (
          <div className="flex justify-center items-center mt-5">
            <div className="lg:w-2/5 md:w-2/4 w-full p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">
                <span className="font-bold">Group Invite Detected!</span> Create
                your identity to join the group.
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-center items-center mt-10">
          <span className="lg:w-2/5 md:w-2/4 w-full">
            <div>
              Users interact with Bandada using a{" "}
              <a
                className="space-x-1 text-blue-700 hover:underline"
                href="https://docs.semaphore.pse.dev/guides/identities"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                Semaphore identity
              </a>{" "}
              (similar to Ethereum accounts). This identity consists of an{" "}
              <a
                className="space-x-1 text-blue-700 hover:underline"
                href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                EdDSA
              </a>{" "}
              public/private key pair and a commitment, used as the public
              identifier of the identity.
            </div>
            <Divider />
          </span>
        </div>
        <div className="flex justify-center items-center mt-5">
          {/* Render identity creation button */}
          <button
            className="flex justify-center items-center w-auto space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-slate-100"
            onClick={createIdentity}
          >
            Create identity
          </button>
        </div>
      </div>
    </div>
  )
}
