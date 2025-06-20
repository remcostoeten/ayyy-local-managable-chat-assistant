"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Settings,
  Maximize2,
  Minimize2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createChatSession,
  sendMessage,
  getSuggestionsForChat,
} from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { AssistantResponse } from "ai";
import { featureFlags, assistantDefaults, isDevelopment } from "@/lib/config/environment";

const LOADING_MESSAGES = isDevelopment
  ? assistantDefaults.development.loadingMessages
  : ["Assistant is typing..."];

type TChatBubbleHandle = {
  setIsOpen: (open: boolean) => void;
  handleSend: (message: string) => void;
}

type TChatBubbleProps = {
  isWidget?: boolean;
  content: string;
  role: "assistant" | "user";
  avatar?: string;
  name?: string;
  timestamp?: string;
}

type TChatAssistantSettings = {
  id: string;
  name: string;
  description: string;
  status: "away" | "active" | "inactive";
  avatar: string;
}

const ChatBubble = forwardRef<TChatBubbleHandle, TChatBubbleProps>(({
  isWidget = true,
  role,
  avatar,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp?: string;
    }>
  >([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatBubbleRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [assistantSettings, setAssistantSettings] = useState<TChatAssistantSettings>({
    id: "",
    name: isDevelopment ? assistantDefaults.development.name : assistantDefaults.production.name,
    description: isDevelopment ? assistantDefaults.development.description : assistantDefaults.production.description,
    status: isDevelopment ? assistantDefaults.development.defaultStatus : assistantDefaults.production.defaultStatus,
    avatar: ""
  });

  useImperativeHandle(ref, () => ({
    setIsOpen,
    handleSend: (message: string) => {
      setInput(message);
      handleSend();
    }
  }));

  useEffect(() => {
    const initChat = async () => {
      let userId = localStorage.getItem("chatUserId");
      if (!userId) {
        userId = `user-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem("chatUserId", userId);
      }

      const result = await createChatSession(userId);
      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
      }
    };

    if (!sessionId) {
      initChat();
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchInitialSuggestions = async () => {
      setIsFetchingSuggestions(true);
      try {
        const result = await getSuggestionsForChat();
        if (result.success && result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
      setIsFetchingSuggestions(false);
    };

    fetchInitialSuggestions();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: "assistant",
        content: "Message cancelled."
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userId = localStorage.getItem("chatUserId");
    if (!userId) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const result = await sendMessage(sessionId, input, userId);
      setIsLoading(false);

      if (!result.success || !result.message) {
        console.error("Failed to get response:", result.error);
        return;
      }

      const messageId = result.message.id || `assistant-${Date.now()}`;
      const messageContent = result.message.content;

      if (!messageContent) {
        console.error("Message content is missing");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          content: messageContent,
        },
      ]);

      if ('suggestions' in result && Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        }]);
      }
      setIsLoading(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  function handleSuggestionClick(suggestion: string) {
    setInput(suggestion);
    handleSend();
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBubbleRef.current &&
        !chatBubbleRef.current.contains(event.target as Node) &&
        isOpen &&
        !isFullscreen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isFullscreen]);

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditedContent("");
    setIsEditing(false);
  };

  const getSuggestions = async () => {
    try {
      const response = await getSuggestionsForChat();
      if (response.success && response.suggestions) {
        return {
          success: true,
          suggestions: response.suggestions.map(s => ({ text: s }))
        };
      }
      return {
        success: false,
        error: "No suggestions available"
      };
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return {
        success: false,
        error: "Failed to fetch suggestions"
      };
    }
  };

  const isAssistant = role === "assistant";

  function getEasterEggDescription(assistantName: string) {
    const settings = isDevelopment
      ? assistantDefaults.development
      : assistantDefaults.production;

    const randomNumber = Math.floor(Math.random() * 100);
    if (randomNumber > settings.easterEggPercentage) {
      return `${assistantName} is ${assistantSettings.status}`;
    }

    const messages = settings.loadingMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return randomMessage.text;
  }

  useEffect(() => {
    // Assistant settings are now handled by default values
    // No need to fetch from API since the endpoint was removed
  }, []);

  return (
    <>
      {isWidget ? (
        // Widget mode (floating bubble)
        <AnimatePresence>
          {isOpen && isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsFullscreen(false)}
            />
          )}
          <div
            ref={chatBubbleRef}
            className={`fixed z-50 ${isFullscreen
              ? "inset-0 p-4 flex items-center justify-center"
              : "bottom-4 right-4"
              }`}
          >
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "bg-white rounded-lg shadow-xl flex flex-col",
                    isFullscreen
                      ? "w-full max-w-4xl h-[80vh]"
                      : "w-[400px] h-[600px]"
                  )}
                >
                  <div className="p-4 border-b bg-gradient-to-r bg-background backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center shadow-lg">
                            <span className="text-foreground font-medium text-sm">
                              {assistantSettings.name[0]}
                            </span>
                          </div>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                            assistantSettings.status === "active" ? "bg-green-500" :
                              assistantSettings.status === "away" ? "bg-yellow-500" :
                                "bg-gray-500"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{assistantSettings.name}</span>
                          <span className="text-xs text-muted-foreground">{assistantSettings.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                          asChild
                        >
                          <Link href="/admin/settings">
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/90"
                  >
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                        <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center">
                          <MessageCircle className="h-8 w-8 text-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Welkom bij de chat!</h3>
                          <p className="text-muted-foreground text-sm">
                            Stel een vraag of kies een van de onderstaande suggesties om te beginnen.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {!isFetchingSuggestions && suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                          {isFetchingSuggestions && (
                            <div className="text-sm text-muted-foreground">
                              Suggesties laden...
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "flex w-full gap-4 p-4",
                              message.role === "user" ? "bg-muted/50" : "bg-background"
                            )}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              {message.role === "assistant" ? (
                                <>
                                  <AvatarImage src={assistantSettings.avatar} />
                                  <AvatarFallback>{assistantSettings.name[0]}</AvatarFallback>
                                </>
                              ) : (
                                <>
                                  <AvatarImage src={avatar} />
                                  <AvatarFallback>Y</AvatarFallback>
                                </>
                              )}
                            </Avatar>

                            <div className="flex flex-col gap-2 w-full overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {message.role === "assistant" ? assistantSettings.name : "You"}
                                </span>
                                {message.timestamp && (
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>

                              <Card className={cn(
                                "p-3 text-sm shadow-sm",
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-tl-none"
                                  : "bg-muted rounded-tr-none"
                              )}>
                                <div className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </div>
                              </Card>
                            </div>
                          </motion.div>
                        ))}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex w-full gap-4 p-4"
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src="/henk-avatar.png" />
                              <AvatarFallback>H</AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-2 w-full overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Henk</span>
                                <span className="text-xs text-muted-foreground">
                                  {getEasterEggDescription(assistantSettings.name)}
                                </span>
                              </div>

                              <Card className="p-3 text-sm shadow-sm bg-muted rounded-tr-none">
                                <div className="flex gap-1 py-2">
                                  <motion.div
                                    className="h-2 w-2 rounded-full bg-current opacity-60"
                                    animate={{ scale: [1, 0.8, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                  />
                                  <motion.div
                                    className="h-2 w-2 rounded-full bg-current opacity-60"
                                    animate={{ scale: [1, 0.8, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                  />
                                  <motion.div
                                    className="h-2 w-2 rounded-full bg-current opacity-60"
                                    animate={{ scale: [1, 0.8, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                  />
                                </div>
                              </Card>
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <AnimatePresence>
                    {showScrollButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 right-4"
                      >
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={scrollToBottom}
                          className="rounded-full shadow-lg"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-4 border-b bg-gradient-to-r bg-background backdrop-blur-sm">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ty pe je bericht..."
                        className="flex-1 bg-background/10 border-background/20 text-foreground placeholder:text-muted-foreground"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={() => setIsOpen(true)}
                  className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </AnimatePresence>
      ) : (
        // Traditional chat page mode
        <div className="h-screen flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex w-full gap-4 p-4",
                  message.role === "user" ? "bg-muted/50" : "bg-background"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={message.role === "assistant" ? "/henk-avatar.png" : undefined} />
                  <AvatarFallback>{message.role === "assistant" ? "H" : "Y"}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-2 w-full overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.role === "assistant" ? "Henk" : "You"}
                    </span>
                    {message.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    )}
                  </div>

                  <Card className={cn(
                    "p-3 text-sm shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tl-none"
                      : "bg-muted rounded-tr-none"
                  )}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {getEasterEggDescription(assistantSettings.name)}
                    </span>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type je bericht..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
