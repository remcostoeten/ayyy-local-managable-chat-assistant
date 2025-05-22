import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContainerProps {
  initialMessages?: Message[];
  onSendMessage: (message: string) => Promise<void>;
  suggestions?: string[];
  className?: string;
}

export function ChatContainer({
  initialMessages = [],
  onSendMessage,
  suggestions = [],
  className,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await onSendMessage(content);
      // Note: The actual assistant message should be added by the parent component
      // through the initialMessages prop to maintain proper state management
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <ChatMessage
              content=""
              role="assistant"
              isLoading={true}
            />
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSend}
          suggestions={suggestions}
          isLoading={isLoading}
          placeholder="Type a message or use / for commands..."
        />
      </div>
    </div>
  );
} 