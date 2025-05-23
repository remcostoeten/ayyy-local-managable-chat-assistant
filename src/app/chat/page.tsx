"use client"

import { ChatContainer } from "@/components/chat/chat-container"
import { Button } from "@/components/ui/button"
import { Settings, MessageSquare, Plus, History, Command } from "lucide-react"
import ChatSuggestions from "@/components/chat/chat-suggestions"
import { ChatSettings } from "@/components/chat/chat-settings"

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10 p-4 flex flex-col">
        <Button variant="outline" className="w-full mb-4 justify-start gap-2">
          <Plus size={16} />
          New Chat
        </Button>
        
        <div className="flex items-center gap-2 px-2 py-1 mb-4">
          <History size={16} />
          <h2 className="font-semibold">Chat History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Chat history items will go here */}
          <div className="space-y-2">
            {/* Placeholder items */}
            <Button variant="ghost" className="w-full justify-start text-sm truncate">
              <MessageSquare size={14} className="mr-2" />
              Previous Chat 1
            </Button>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t">
          <ChatSettings />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat with AI Assistant</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Command size={16} className="mr-2" />
              Commands
            </Button>
            <Button variant="outline" size="sm">Clear Chat</Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <ChatContainer />
            </div>
            <div className="p-4 border-t bg-background">
              <ChatSuggestions onSuggestionClick={(suggestion) => {
                // TODO: Implement suggestion click handler
                console.log("Clicked suggestion:", suggestion)
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 