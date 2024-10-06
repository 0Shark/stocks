export const metadata = {
  title: "StockBot powered by Groq",
  description:
    "Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More.",
}

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <>
      <div className="flex flex-1 flex-col bg-muted/50">{children}</div>
    </>
  )
}
