import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const { inviteCode } = router.query

  // State to store the user's Semaphore identity.
  // You can learn more about Semaphore identity here
  // https://docs.semaphore.pse.dev/V3/guides/identities.
  const [identity, setIdentity] = useState<Identity>()
  const [loading, setLoading] = useState<boolean>(true)
  const [justCreated, setJustCreated] = useState<boolean>(false)

  // Environment variable for local storage key.
  const localStorageTag = process.env.NEXT_PUBLIC_LOCAL_STORAGE_TAG!

  // Effect to load identity from local storage or prompt creation.
  useEffect(() => {
    const identityString = localStorage.getItem(localStorageTag)

    if (identityString) {
      // If identity exists in local storage, load it.
      const identity = new Identity(identityString)
      setIdentity(identity)

      if (inviteCode && !justCreated) {
        // If there's an invite code, go to join group page
        router.push(`/join-group?inviteCode=${inviteCode}`)
      } else if (!justCreated) {
        // Otherwise, go to member's groups page
        router.push(`/${identity.commitment.toString()}`)
      }
    } else {
      // No identity exists
      setLoading(false)
      console.log("Create your Semaphore identity 👆🏽")
    }
  }, [localStorageTag, inviteCode, router, justCreated])

  // Function to create a new Semaphore identity and store it.
  const createIdentity = async () => {
    const identity = new Identity()
    setIdentity(identity)
    localStorage.setItem(localStorageTag, identity.export())
    setJustCreated(true)
    console.log("Your new Semaphore identity was just created 🎉")
  }

  const handleNext = () => {
    if (inviteCode) {
      // If there's an invite code, go to join group page
      router.push(`/join-group?inviteCode=${inviteCode}`)
    } else if (identity) {
      // Otherwise, go to member's groups page
      router.push(`/${identity.commitment.toString()}`)
    }
  }

  const renderIdentity = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-mono font-semibold text-bandada-gold">
            Identity
          </div>
          <div>
            <button
              className="font-mono bg-black hover:bg-bandada-gray-dark text-bandada-gold border border-bandada-gold/50 font-medium rounded-md px-3 py-1 transition-colors duration-200"
              onClick={createIdentity}
            >
              New
            </button>
          </div>
        </div>

        {identity && (
          <div className="flex justify-center items-center">
            <div className="w-full overflow-auto border border-bandada-gold/50 bg-black/80 p-5 rounded-md space-y-4 font-mono">
              <div>
                <p className="text-bandada-gold font-bold mb-1">
                  Private Key (base64):
                </p>
                <p className="text-white break-all bg-black/60 p-2 rounded border border-bandada-gold/30">
                  {identity.export()}
                </p>
              </div>
              <div>
                <p className="text-bandada-gold font-bold mb-1">Public Key:</p>
                <p className="text-white break-all bg-black/60 p-2 rounded border border-bandada-gold/30">
                  [{identity.publicKey[1].toString()}]
                </p>
              </div>
              <div>
                <p className="text-bandada-gold font-bold mb-1">Commitment:</p>
                <p className="text-white break-all bg-black/60 p-2 rounded border border-bandada-gold/30">
                  {identity.commitment.toString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading && !justCreated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bandada-gold"></div>
          <p className="mt-2 text-bandada-gold font-mono">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bandada-black min-h-screen flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bandada-gold font-mono">
            Identities
          </h1>
        </div>

        {inviteCode && !identity && (
          <div className="mb-8 p-4 bg-black/80 border-2 border-bandada-gold rounded-md">
            <p className="text-white font-mono flex items-center">
              <span className="text-bandada-gold mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="font-bold text-bandada-gold">
                GROUP INVITE DETECTED!
              </span>{" "}
              Create your identity to join the group.
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="text-white font-mono">
            Users interact with Bandada using a{" "}
            <a
              className="text-bandada-gold hover:text-gold-light underline decoration-dotted"
              href="https://docs.semaphore.pse.dev/guides/identities"
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              Semaphore identity
            </a>{" "}
            (similar to Ethereum accounts). This identity consists of an{" "}
            <a
              className="text-bandada-gold hover:text-gold-light underline decoration-dotted"
              href="https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon"
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              EdDSA
            </a>{" "}
            public/private key pair and a commitment, used as the public
            identifier of the identity.
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-bandada-gold/70 to-transparent my-6"></div>
        </div>

        <div className="flex justify-center items-center mb-8">
          {/* Render identity details or creation button based on state */}
          {identity ? (
            renderIdentity()
          ) : (
            <button
              className="font-mono bg-bandada-gold hover:bg-gold-light text-bandada-black font-medium rounded-md px-5 py-3 transition-colors duration-200"
              onClick={createIdentity}
            >
              Create identity
            </button>
          )}
        </div>

        {justCreated && (
          <div className="flex justify-center mt-8">
            <button
              className="font-mono bg-bandada-gold hover:bg-gold-light text-bandada-black font-medium rounded-md px-8 py-3 transition-colors duration-200"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
