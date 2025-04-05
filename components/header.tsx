import Link from "next/link"

export default function Header() {
  return (
    <header className="flex flex-wrap justify-between p-5 mb-5 bg-bandada-black border-b border-bandada-gold/30">
      <Link
        href="/"
        className="text-xl md:mb-auto mb-5 font-bold text-bandada-gold font-mono hover:text-bandada-gold-light transition-colors"
      >
        Anonymous Forms via zk-SNARKs
      </Link>
      <div className="flex space-x-4 items-center">
        <Link href="/login" className="cyber-btn-secondary text-sm">
          Login
        </Link>
      </div>
    </header>
  )
}
