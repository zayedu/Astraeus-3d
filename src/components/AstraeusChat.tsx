"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Send, Database, Sparkles, Activity, Brain, Cpu, TrendingUp, PieChart } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-inter relative overflow-hidden">
      {/* Sophisticated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orb */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-rbc-blue/8 via-blue-400/6 to-indigo-400/4 rounded-full blur-3xl animate-float opacity-60"></div>

        {/* Secondary orbs */}
        <div className="absolute bottom-1/3 left-1/5 w-[400px] h-[400px] bg-gradient-to-tr from-rbc-yellow/6 via-amber-300/4 to-orange-300/3 rounded-full blur-3xl animate-float-delayed opacity-50"></div>

        {/* Subtle accent orb */}
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-bl from-purple-400/4 via-blue-300/3 to-cyan-300/2 rounded-full blur-3xl animate-float-slow opacity-40"></div>

        {/* Floating particles */}
        <div className="absolute top-1/6 left-1/3 w-1 h-1 bg-rbc-blue/30 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 right-1/5 w-0.5 h-0.5 bg-rbc-yellow/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-2/5 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-bounce"></div>
      </div>

      {/* Refined header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue to-blue-600 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-rbc-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-rbc-blue to-blue-700 bg-clip-text text-transparent tracking-tight">
                Astraeus
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-3 h-3 text-rbc-yellow" />
                <span className="text-sm font-medium">RBC Analytics Intelligence</span>
              </div>
            </div>
          </div>

          {/* Elegant model selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Dataset:</span>
            </div>
            <div className="relative">
              <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/60 shadow-sm">
                {["PAR", "DFR"].map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model as ModelType)}
                    className={cn(
                      "relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300",
                      selectedModel === model
                        ? "bg-gradient-to-r from-rbc-blue to-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    <span className="relative flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      {model}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto relative z-10 min-h-[calc(100vh-140px)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue/10 to-blue-600/5 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-gray-200/50">
                  <Database className="w-10 h-10 text-rbc-blue" />
                </div>
              </div>

              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rbc-blue to-blue-700 bg-clip-text text-transparent mb-4 tracking-tight">
                Analytics Intelligence
              </h2>
              <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                Connect to your <span className="text-rbc-blue font-semibold">{selectedModel}</span> dataset and unlock
                insights through natural language processing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  {
                    icon: TrendingUp,
                    text: "Analyze revenue trends and performance metrics across quarters",
                    gradient: "from-blue-50 to-indigo-50/50",
                    border: "border-blue-100/60",
                    iconBg: "from-rbc-blue/10 to-blue-500/5",
                  },
                  {
                    icon: PieChart,
                    text: "Generate comprehensive reports with predictive analytics",
                    gradient: "from-purple-50/50 to-pink-50/30",
                    border: "border-purple-100/60",
                    iconBg: "from-purple-500/10 to-pink-500/5",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "group p-8 bg-gradient-to-br backdrop-blur-sm border rounded-2xl hover:shadow-lg transition-all duration-500 cursor-pointer hover:scale-[1.02]",
                      item.gradient,
                      item.border,
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 bg-gradient-to-br rounded-xl group-hover:scale-110 transition-transform",
                          item.iconBg,
                        )}
                      >
                        <item.icon className="w-6 h-6 text-rbc-blue" />
                      </div>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {renderedMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn("flex animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={cn(
                      "max-w-4xl px-8 py-6 rounded-3xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01] group",
                      message.role === "user"
                        ? "bg-gradient-to-br from-rbc-blue to-blue-600 text-white border-blue-200/30 shadow-lg"
                        : "bg-white/80 text-gray-800 border-gray-200/60 hover:bg-white/90 shadow-sm hover:shadow-md",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {message.role === "assistant" && (
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-rbc-yellow to-amber-400 rounded-xl flex items-center justify-center shadow-md">
                            <Brain className="w-4 h-4 text-gray-900" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {message.role === "assistant" ? (
                          <div
                            className="prose prose-gray max-w-none"
                            dangerouslySetInnerHTML={{ __html: message.renderedContent }}
                          />
                        ) : (
                          <div className="leading-relaxed">{message.content}</div>
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
                            <span className="text-xs text-gray-500">Processing...</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 text-xs opacity-60">
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

      {/* Refined input area */}
      <div className="relative z-10 backdrop-blur-xl bg-white/70 border-t border-gray-200/50 px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue/5 to-blue-600/3 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a question about ${selectedModel} data...`}
                  className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rbc-blue/30 focus:border-rbc-blue/30 text-gray-800 placeholder-gray-500 transition-all duration-300 hover:border-gray-300/80 shadow-sm"
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
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="relative group p-4 bg-gradient-to-r from-rbc-blue to-blue-600 hover:from-rbc-blue/90 hover:to-blue-600/90 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Send className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-rbc-blue rounded-full animate-pulse"></div>
              <span>Press Enter to send • Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  selectedModel === "PAR" ? "bg-green-500" : "bg-blue-500",
                )}
              ></div>
              <span>Connected to {selectedModel}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
