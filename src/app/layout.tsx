import type { Metadata } from 'next'
import '@/styles/main.css'
import Providers from '@/components/providers'
import NextTopLoader from 'nextjs-toploader'

export const metadata: Metadata = {
  title: 'Local AI | AI Chatbot | Knowledge Base | Vector Database',
  description: "A powerful local AI chatbot featuring custom knowledge base integration, vector embeddings, RAG (Retrieval-Augmented Generation), real-time model status monitoring, chat history management, and an advanced admin dashboard.",
  generator: 'Local AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
    lang="nl"
    suppressHydrationWarning
    data-theme="supabase"
className="dark"
>    
      <body>
      <NextTopLoader
          color="#6366f1" 
          initialPosition={0.3}
          crawlSpeed={200}
          height={5}
           showSpinner={false}
          easing="ease"
          speed={500}
        />  
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
