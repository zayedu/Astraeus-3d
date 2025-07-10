"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, BarChart3, Database, Sparkles, Zap, Activity, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

    // Create assistant message for streaming
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

        // Mark streaming as complete
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005DAA] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFD200] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-50' />

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#005DAA] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD200] rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Astraeus
              </h1>
              <p className="text-sm text-blue-200/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                RBC Internal Analytics Assistant
              </p>
            </div>
          </div>

          {/* Enhanced Model Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-200/80">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Dataset:</span>
            </div>
            <div className="relative">
              <div className="flex bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setSelectedModel("PAR")}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    selectedModel === "PAR"
                      ? "bg-gradient-to-r from-[#005DAA] to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-blue-200/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {selectedModel === "PAR" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#005DAA] to-blue-600 rounded-lg animate-pulse opacity-50"></div>
                  )}
                  <span className="relative">PAR</span>
                </button>
                <button
                  onClick={() => setSelectedModel("DFR")}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    selectedModel === "DFR"
                      ? "bg-gradient-to-r from-[#005DAA] to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-blue-200/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {selectedModel === "DFR" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#005DAA] to-blue-600 rounded-lg animate-pulse opacity-50"></div>
                  )}
                  <span className="relative">DFR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#005DAA] to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD200] rounded-full animate-bounce"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Welcome to Astraeus
              </h2>
              <p className="text-blue-200/80 mb-8 text-lg">
                Ask questions about your <span className="text-[#FFD200] font-semibold">{selectedModel}</span> dataset
                using natural language.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-[#FFD200] mt-1 group-hover:scale-110 transition-transform" />
                    <p className="text-blue-100 group-hover:text-white transition-colors">
                      "Show me the top 10 customers by revenue this quarter"
                    </p>
                  </div>
                </Card>
                <Card className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#FFD200] mt-1 group-hover:scale-110 transition-transform" />
                    <p className="text-blue-100 group-hover:text-white transition-colors">
                      "What's the trend in loan applications over the past 6 months?"
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`max-w-4xl px-6 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-[#005DAA] to-blue-600 text-white border-blue-400/30 shadow-lg shadow-blue-500/25"
                        : "bg-white/10 text-blue-50 border-white/20 hover:bg-white/15"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FFD200] to-yellow-500 rounded-lg flex items-center justify-center mt-1 shadow-lg">
                          <Brain className="w-4 h-4 text-gray-900" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse rounded-sm" />
                          )}
                        </div>
                        <div
                          className={`text-xs mt-3 flex items-center gap-1 ${
                            message.role === "user" ? "text-blue-100" : "text-blue-300"
                          }`}
                        >
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          {message.timestamp.toLocaleTimeString()}
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

      {/* Enhanced Input Area */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border-t border-white/20 px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#005DAA]/20 to-blue-600/20 rounded-2xl blur-sm group-focus-within:blur-md transition-all"></div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask a question about ${selectedModel} data...`}
                className="relative w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#005DAA]/50 focus:border-[#005DAA]/50 text-white placeholder-blue-200/60 transition-all duration-300"
                rows={1}
                style={{
                  minHeight: "56px",
                  maxHeight: "140px",
                  height: "auto",
                }}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="relative bg-gradient-to-r from-[#005DAA] to-blue-600 hover:from-[#004A8A] hover:to-blue-700 text-white px-6 py-4 h-14 rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:hover:scale-100 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-blue-200/60">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-[#FFD200] rounded-full animate-pulse"></div>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${selectedModel === "PAR" ? "bg-green-400" : "bg-blue-400"} animate-pulse`}
              ></div>
              <span>Connected to {selectedModel} dataset</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
