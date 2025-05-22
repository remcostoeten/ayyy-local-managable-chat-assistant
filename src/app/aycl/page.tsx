import ChatBubble from "@/components/chat/chat-bubble"
import Link from "next/link"


/**
 * A replica for our support page
 * https://support.allyoucanlearn.nl/hc/nl/
 * Solely for the purpose of the demo
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 text-white">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/10 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="bg-white p-2 rounded-lg shadow-lg">
              <span className="text-purple-700 font-bold text-xs">
                all you
                <br />
                can learn.
              </span>
            </Link>
            <h1 className="text-xl font-medium">Help Center</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/admin" className="hover:text-white/80 transition-colors">
    Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h2 className="text-4xl font-bold text-center mb-8">Hoi! Hoe kunnen we je helpen?</h2>

        <div className="mb-16 text-center">
          <p className="mb-3 text-white/90">Populaire zoekopdrachten:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
              Inloggen
            </button>
            <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
              Abonnement verlengen
            </button>
            <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
              Leerprogramma aanpassen
            </button>
            <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
              Coach koppelen
            </button>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-5xl">
          {/* General */}
          <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-orange-500/80 p-4 rounded-lg mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <h3 className="font-bold mb-2">General</h3>
            <p className="text-sm text-white/80">
              Here you read everything about logging and navigating within the platform, and about (taking out)
              subscriptions
            </p>
          </div>

          {/* For coaches */}
          <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-purple-500/80 p-4 rounded-lg mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h3 className="font-bold mb-2">For coaches</h3>
            <p className="text-sm text-white/80">Here you read everything about the functionalities in the coach panel.</p>
          </div>

          {/* For participants */}
          <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-indigo-500/80 p-4 rounded-lg mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className="font-bold mb-2">For participants</h3>
            <p className="text-sm text-white/80">Here you read everything about taking courses on the platform.</p>
          </div>

          {/* Working with the course editor */}
          <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-blue-500/80 p-4 rounded-lg mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h3 className="font-bold mb-2">Working with the course editor</h3>
            <p className="text-sm text-white/80">Here you can read everything about making changes to the courses on the platform.</p>
          </div>
        </div>

        {/* Updates section */}
        <div className="flex flex-col items-center text-center max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors">
          <div className="bg-amber-500/80 p-4 rounded-lg mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3 className="font-bold mb-2">Updates</h3>
          <p className="text-sm text-white/80">
            Discover the latest platform updates, from exciting new features to enhanced functionalities!
          </p>
        </div>
      </main>

      <ChatBubble />
    </div>
  )
}

