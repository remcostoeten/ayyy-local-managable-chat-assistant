import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

type TProps = {
  children: string
  className?: string
}

export function Markdown({ children, className }: TProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code  ({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return (
            <SyntaxHighlighter 
              language={match?.[1]}
              PreTag="div"
              style={vscDarkPlus as any}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          )
        },
        // Override other elements as needed
        p({ children }) {
          return <p className="mb-4 last:mb-0">{children}</p>
        },
        a({ children, href }) {
          return (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          )
        },
        ul({ children }) {
          return <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal pl-4 mb-4 last:mb-0">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1 last:mb-0">{children}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-muted pl-4 italic">
              {children}
            </blockquote>
          )
        },
        hr() {
          return <hr className="my-4 border-muted" />
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          )
        },
        th({ children }) {
          return <th className="border border-muted px-4 py-2 text-left font-medium">{children}</th>
        },
        td({ children }) {
          return <td className="border border-muted px-4 py-2">{children}</td>
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
} 