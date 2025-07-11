"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Send, Sparkles, Brain, Settings, Plus, MessageSquare, Zap, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { renderMarkdown } from "@/lib/markdown"

type ModelType = "PAR" | "DFR"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isStreaming?: boolean
}

export default function AstraeusChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelType>("PAR")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add this after the existing useEffect
  useEffect(() => {
    // Ensure we scroll to bottom when new messages are added
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100) // Small delay to ensure DOM is updated

    return () => clearTimeout(timer)
  }, [messages.length])

  // Streaming markdown rendering - re-render entire content on each chunk
  const renderedMessages = useMemo(() => {
    return messages.map((message) => ({
      ...message,
      // Re-render entire markdown content on each update (streaming approach)
      renderedContent: message.role === "assistant" ? renderMarkdown(message.content) : message.content,
    }))
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const endpoint = selectedModel === "PAR" ? "/par/stream-insights" : "/dfr/stream-insights"
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  // Accumulate content and trigger re-render of entire markdown
                  accumulatedContent += data.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg)),
                  )
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg)))
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "I apologize, but I encountered an error while processing your request. Please try again.",
                isStreaming: false,
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex h-screen bg-cosmic-void font-inter relative overflow-hidden">
      {/* Cosmic Background - Fixed position */}
      <div className="cosmic-background">
        {/* Starfield */}
        <div className="absolute inset-0 starfield"></div>

        {/* Nebula Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 via-rbc-blue/30 to-cyan-400/20 rounded-full blur-3xl animate-cosmic-drift"></div>
        <div className="absolute bottom-1/4 left-1/5 w-80 h-80 bg-gradient-to-r from-rbc-yellow/20 via-orange-400/15 to-pink-400/20 rounded-full blur-3xl animate-cosmic-drift-reverse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/15 via-purple-500/20 to-rbc-blue/25 rounded-full blur-3xl animate-cosmic-pulse"></div>

        {/* Orbital Rings */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-rbc-yellow/20 rounded-full animate-orbital-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border border-cyan-400/20 rounded-full animate-orbital-fast"></div>

        {/* Floating Particles */}
        <div className="cosmic-particles"></div>
      </div>

      {/* Sidebar - Fixed height with internal scrolling */}
      <div className="w-64 bg-cosmic-glass backdrop-blur-xl border-r border-cosmic-border flex flex-col relative z-10 h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cosmic-border flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-rbc-yellow to-orange-400 rounded-xl flex items-center justify-center shadow-lg cosmic-glow">
                <Brain className="w-6 h-6 text-rbc-blue" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-cosmic"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white cosmic-text-glow">Astraeus</h1>
              <p className="text-sm text-cosmic-text-secondary flex items-center gap-1">
                <Star className="w-3 h-3 text-rbc-yellow" />
                Cosmic Analytics AI
              </p>
            </div>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-cosmic-button hover:bg-cosmic-button-hover rounded-xl transition-all duration-300 text-white group cosmic-button-effect">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New Constellation</span>
          </button>
        </div>

        {/* Chat History - Scrollable */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto cosmic-scrollbar">
          <div className="text-xs font-semibold text-cosmic-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Recent Explorations
          </div>
          {[
            "Revenue Nebula Analysis Q4",
            "Customer Galaxy Mapping",
            "Risk Asteroid Assessment",
            "Market Constellation Trends",
            "Profit Star Formation Study",
            "Investment Black Hole Analysis",
            "Economic Supernova Predictions",
            "Financial Orbit Calculations",
            "Data Mining Expedition",
            "Cosmic Cash Flow Analysis",
          ].map((chat, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm text-cosmic-text-secondary hover:text-white hover:bg-cosmic-hover rounded-lg transition-all duration-300 truncate group cosmic-hover-effect"
            >
              <MessageSquare className="w-3 h-3 inline mr-2 group-hover:text-rbc-yellow transition-colors" />
              {chat}
            </button>
          ))}
        </div>

        {/* Model Selector */}
        <div className="p-4 border-t border-cosmic-border flex-shrink-0">
          <div className="text-xs font-semibold text-cosmic-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3" />
            Data Universe
          </div>
          <div className="space-y-2">
            {["PAR", "DFR"].map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model as ModelType)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-300 cosmic-button-effect",
                  selectedModel === model
                    ? "bg-gradient-to-r from-rbc-yellow to-orange-400 text-rbc-blue font-semibold cosmic-glow"
                    : "text-cosmic-text-secondary hover:text-white hover:bg-cosmic-hover",
                )}
              >
                {model} Constellation
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-cosmic-border flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-cosmic-text-secondary hover:text-white hover:bg-cosmic-hover rounded-lg transition-all duration-300 cosmic-hover-effect">
            <Settings className="w-4 h-4" />
            Cosmic Settings
          </button>
        </div>
      </div>

      {/* Main Chat Area - Proper flex layout */}
      <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* Top Bar - Fixed */}
        <div className="bg-cosmic-glass backdrop-blur-xl border-b border-cosmic-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-rbc-yellow to-orange-400 rounded-lg flex items-center justify-center cosmic-glow">
                  <Brain className="w-4 h-4 text-rbc-blue" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-cosmic"></div>
              </div>
              <div>
                <h2 className="font-semibold text-white cosmic-text-glow">Cosmic Analytics Assistant</h2>
                <p className="text-sm text-cosmic-text-secondary flex items-center gap-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse-cosmic"></div>
                  Connected to {selectedModel} constellation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-cosmic cosmic-glow-green"></div>
                <span className="text-sm text-cosmic-text-secondary">Orbital Status: Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scroll-smooth cosmic-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-rbc-yellow via-orange-400 to-rbc-yellow rounded-2xl flex items-center justify-center mx-auto shadow-2xl cosmic-glow">
                      <Sparkles className="w-10 h-10 text-rbc-blue" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-orbital-fast cosmic-glow-cyan"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse-cosmic"></div>
                  </div>

                  <h3 className="text-4xl font-bold text-white mb-4 cosmic-text-glow">
                    Your idea of{" "}
                    <span className="text-rbc-yellow italic font-script cosmic-text-glow-yellow">
                      exploring the cosmos
                    </span>{" "}
                    of data happens here
                  </h3>

                  <p className="text-lg text-cosmic-text-secondary mb-8 leading-relaxed">
                    Navigate through galaxies of {selectedModel} data using natural language. Discover stellar insights,
                    generate cosmic reports, and uncover hidden patterns in the financial universe.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    {[
                      { text: "Show me revenue constellations for Q4", icon: "🌟" },
                      { text: "Map customer galaxies by region", icon: "🌌" },
                      { text: "Scan for risk asteroids", icon: "☄️" },
                      { text: "Generate a cosmic performance summary", icon: "✨" },
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion.text)}
                        className="p-4 bg-cosmic-card hover:bg-cosmic-card-hover rounded-xl text-sm text-white transition-all duration-300 text-left border border-cosmic-border hover:border-rbc-yellow/50 cosmic-hover-effect group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{suggestion.icon}</span>
                          <div className="w-1 h-1 bg-rbc-yellow rounded-full group-hover:animate-pulse-cosmic"></div>
                        </div>
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6 min-h-full">
                {renderedMessages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 animate-fade-in",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === "assistant" && (
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-rbc-yellow to-orange-400 rounded-lg flex items-center justify-center mt-1 cosmic-glow">
                          <Brain className="w-4 h-4 text-rbc-blue" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-cosmic"></div>
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-3xl rounded-2xl px-6 py-4 shadow-2xl cosmic-message-glow break-words",
                        message.role === "user"
                          ? "bg-gradient-to-br from-rbc-blue to-blue-700 text-white ml-12 border border-rbc-blue/50"
                          : "bg-cosmic-card text-gray-100 border border-cosmic-border",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div
                          className="prose prose-cosmic max-w-none overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: message.renderedContent }}
                        />
                      ) : (
                        <div className="leading-relaxed whitespace-pre-wrap">{message.content}</div>
                      )}

                      {message.isStreaming && (
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-cosmic-border">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-rbc-yellow rounded-full animate-cosmic-bounce cosmic-glow-yellow"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-cosmic-text-secondary">Scanning cosmic data streams...</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex items-center gap-2 mt-3 text-xs",
                          message.role === "user" ? "text-white/70" : "text-cosmic-text-muted",
                        )}
                      >
                        <Star className="w-2 h-2" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-cosmic-user-avatar rounded-lg flex items-center justify-center mt-1 border border-cosmic-border">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rbc-yellow rounded-full animate-pulse-cosmic"></div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-cosmic-glass backdrop-blur-xl border-t border-cosmic-border p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask the cosmos about ${selectedModel} data...`}
                  className="w-full px-6 py-4 bg-cosmic-input rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rbc-yellow/50 text-white placeholder-cosmic-text-muted transition-all duration-300 shadow-lg border border-cosmic-border cosmic-input-glow"
                  rows={1}
                  style={{
                    minHeight: "56px",
                    maxHeight: "140px",
                  }}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-rbc-yellow rounded-full animate-cosmic-bounce cosmic-glow-yellow"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-cosmic-text-secondary">Processing cosmic signals...</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="relative p-4 bg-gradient-to-br from-rbc-yellow to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-rbc-blue rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cosmic-glow group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-cosmic-text-muted">
              <span className="flex items-center gap-2">
                <Star className="w-3 h-3" />
                Press Enter to launch • Shift+Enter for new orbit
              </span>
              <span className="flex items-center gap-2">
                Powered by Cosmic RBC Analytics
                <Sparkles className="w-3 h-3 text-rbc-yellow" />
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
