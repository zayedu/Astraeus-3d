"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Send, Sparkles, Activity, Brain, TrendingUp } from "lucide-react"
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Memoized markdown rendering for performance
  const renderedMessages = useMemo(() => {
    return messages.map((message) => ({
      ...message,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-rbc-blue font-inter relative overflow-hidden">
      {/* Stripe-inspired vibrant background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-400/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/30 via-cyan-400/10 to-rbc-yellow/20"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-400/25 to-rbc-yellow/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/25 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header with Stripe-style navigation */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-rbc-blue" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold text-white tracking-tight">Astraeus</h1>
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-3 h-3 text-rbc-yellow" />
                <span className="text-sm font-medium">RBC Analytics</span>
              </div>
            </div>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Dataset:</span>
            </div>
            <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
              {["PAR", "DFR"].map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model as ModelType)}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300",
                    selectedModel === model
                      ? "bg-white text-rbc-blue shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                  )}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 relative z-10 min-h-[calc(100vh-140px)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {messages.length === 0 ? (
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
              {/* Left side - Hero content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="text-white">Financial</span>
                    <br />
                    <span className="text-white">intelligence</span>
                    <br />
                    <span className="bg-gradient-to-r from-rbc-yellow via-orange-300 to-pink-300 bg-clip-text text-transparent">
                      to grow your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                      insights
                    </span>
                  </h1>

                  <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                    Join the thousands of analysts that use Astraeus to unlock deep insights from {selectedModel} data,
                    power custom analytics models, and build more intelligent business decisions.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Ask about your data..."
                      className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <button className="px-6 py-3 bg-white text-rbc-blue font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg">
                    Start now →
                  </button>
                </div>
              </div>

              {/* Right side - Floating UI mockups */}
              <div className="relative">
                {/* Analytics Dashboard Mockup */}
                <div className="absolute top-0 right-0 w-80 h-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 transform rotate-3 hover:rotate-1 transition-transform duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue Growth</span>
                        <span className="text-sm font-semibold text-green-600">+32.4%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-rbc-blue to-blue-500 h-2 rounded-full w-3/4"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">$2.4M</div>
                          <div className="text-xs text-gray-500">This Quarter</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">847</div>
                          <div className="text-xs text-gray-500">Active Users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Query Interface Mockup */}
                <div className="absolute top-20 left-0 w-72 h-48 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-5 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-rbc-blue" />
                      <span className="font-semibold text-gray-900">AI Query</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">"Show me top performing products"</div>
                      <div className="bg-gray-50 rounded-lg p-3 text-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-1 bg-rbc-blue rounded-full"></div>
                          <span className="text-gray-700">Product A: $1.2M revenue</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Product B: $980K revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-700">Product C: $750K revenue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Mockup */}
                <div className="absolute bottom-0 right-12 w-64 h-40 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 transform rotate-1 hover:-rotate-1 transition-transform duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Trend Analysis</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-end justify-between h-16 gap-1">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-rbc-blue to-blue-400 rounded-sm flex-1"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {renderedMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn("flex animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={cn(
                      "max-w-3xl px-6 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01]",
                      message.role === "user"
                        ? "bg-white/95 text-gray-900 border-white/30 shadow-lg"
                        : "bg-white/90 text-gray-800 border-white/20 shadow-md",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-rbc-blue to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {message.role === "assistant" ? (
                          <div
                            className="prose prose-gray max-w-none"
                            dangerouslySetInnerHTML={{ __html: message.renderedContent }}
                          />
                        ) : (
                          <div className="leading-relaxed font-medium">{message.content}</div>
                        )}

                        {message.isStreaming && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="w-1.5 h-1.5 bg-rbc-blue rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.1}s` }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">Analyzing...</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.role === "assistant" && (
                            <>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <span>{selectedModel} Dataset</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {messages.length > 0 && (
        <div className="relative z-10 backdrop-blur-md bg-white/10 border-t border-white/20 px-6 py-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a question about ${selectedModel} data...`}
                  className="w-full px-6 py-4 bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                  rows={1}
                  style={{
                    minHeight: "56px",
                    maxHeight: "140px",
                  }}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-rbc-blue rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Processing...</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-4 bg-white text-rbc-blue rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
