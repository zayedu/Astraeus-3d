"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, BarChart3, Database, Sparkles, Zap, Activity, Brain, Cpu, Network } from "lucide-react"
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
                content: "Sorry, I encountered an error while processing your request. Please try again.",
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden font-inter">
      {/* Ultra-modern animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rbc-blue/30 to-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rbc-yellow/20 to-amber-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float-delayed"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-bl from-purple-500/15 to-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float-slow"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-rbc-yellow/60 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/80 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-rbc-blue/40 rounded-full animate-bounce"></div>
      </div>

      {/* Neural network grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      {/* Futuristic header */}
      <header className="relative z-10 backdrop-blur-2xl bg-white/[0.02] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-rbc-blue via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                <Brain className="w-7 h-7 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rbc-yellow to-amber-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent tracking-tight">
                Astraeus
              </h1>
              <div className="flex items-center gap-2 text-blue-200/70">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rbc-yellow" />
                  <span className="text-sm font-medium">RBC Analytics Intelligence</span>
                </div>
                <div className="w-1 h-1 bg-blue-400/60 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <Network className="w-3 h-3 text-green-400" />
                  <span className="text-xs">Neural Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ultra-modern model selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-blue-200/70">
              <Activity className="w-4 h-4 text-rbc-yellow" />
              <span className="text-sm font-medium tracking-wide">Dataset Neural Link:</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue/20 to-blue-600/20 rounded-2xl blur-xl"></div>
              <div className="relative flex bg-black/30 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                {["PAR", "DFR"].map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model as ModelType)}
                    className={cn(
                      "relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-500 group",
                      selectedModel === model
                        ? "bg-gradient-to-r from-rbc-blue to-blue-600 text-white shadow-xl shadow-rbc-blue/25"
                        : "text-blue-200/70 hover:text-white hover:bg-white/5",
                    )}
                  >
                    {selectedModel === model && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue to-blue-600 rounded-xl animate-pulse opacity-50"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                      </>
                    )}
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
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue/30 to-blue-600/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-rbc-blue via-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                  <Database className="w-12 h-12 text-white drop-shadow-lg" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rbc-yellow to-amber-400 rounded-full animate-bounce shadow-lg"></div>
                </div>
              </div>

              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent mb-4 tracking-tight">
                Neural Analytics Interface
              </h2>
              <p className="text-blue-200/80 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                Connect to your <span className="text-rbc-yellow font-semibold">{selectedModel}</span> neural dataset
                and unlock insights through natural language processing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: BarChart3,
                    text: "Analyze top 10 revenue performers this quarter with predictive modeling",
                    gradient: "from-rbc-blue/10 to-blue-600/5",
                  },
                  {
                    icon: Zap,
                    text: "Generate trend analysis for loan applications with ML insights",
                    gradient: "from-purple-500/10 to-indigo-600/5",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "group p-8 bg-gradient-to-br backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl",
                      item.gradient,
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-rbc-yellow/20 to-amber-400/10 rounded-xl group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-rbc-yellow" />
                      </div>
                      <p className="text-blue-100/90 group-hover:text-white transition-colors leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn("flex animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={cn(
                      "max-w-4xl px-8 py-6 rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-[1.01] group",
                      message.role === "user"
                        ? "bg-gradient-to-br from-rbc-blue/90 to-blue-600/80 text-white border-rbc-blue/30 shadow-2xl shadow-rbc-blue/20"
                        : "bg-gradient-to-br from-white/[0.03] to-white/[0.01] text-blue-50 border-white/10 hover:border-white/20 hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {message.role === "assistant" && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-rbc-yellow to-amber-400 rounded-xl blur-lg opacity-75"></div>
                          <div className="relative w-10 h-10 bg-gradient-to-br from-rbc-yellow to-amber-400 rounded-xl flex items-center justify-center shadow-xl">
                            <Brain className="w-5 h-5 text-gray-900" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className="prose prose-invert max-w-none leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: message.role === "assistant" ? renderMarkdown(message.content) : message.content,
                          }}
                        />
                        {message.isStreaming && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 bg-rbc-yellow rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.1}s` }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-blue-300/70">Neural processing...</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-4 text-xs opacity-70">
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.role === "assistant" && (
                            <>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <span>{selectedModel} Neural Network</span>
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

      {/* Futuristic input area */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/[0.02] border-t border-white/10 px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-rbc-blue/10 to-blue-600/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Connect to ${selectedModel} neural network...`}
                  className="w-full px-8 py-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-rbc-blue/50 focus:border-rbc-blue/30 text-white placeholder-blue-200/50 transition-all duration-300 hover:border-white/20"
                  rows={1}
                  style={{
                    minHeight: "72px",
                    maxHeight: "200px",
                  }}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-rbc-yellow rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-blue-300/70">Processing...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="relative group p-6 bg-gradient-to-r from-rbc-blue to-blue-600 hover:from-rbc-blue/90 hover:to-blue-600/90 text-white rounded-3xl shadow-2xl shadow-rbc-blue/25 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-rbc-blue/40 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Send className="w-6 h-6 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 text-xs text-blue-200/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-rbc-yellow rounded-full animate-pulse"></div>
                <span>Neural interface active • Press Enter to transmit</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    selectedModel === "PAR" ? "bg-green-400" : "bg-blue-400",
                  )}
                ></div>
                <span>Connected to {selectedModel} dataset</span>
              </div>
              <div className="w-1 h-1 bg-blue-400/60 rounded-full"></div>
              <span>Latency: ~45ms</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
