"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Send, Sparkles, Brain, Settings, Plus, MessageSquare } from "lucide-react"
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
    <div className="flex h-screen bg-gradient-to-br from-rbc-blue via-blue-700 to-blue-800 font-inter">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-rbc-yellow/10 to-yellow-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-rbc-yellow/8 to-orange-400/4 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rbc-yellow rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-rbc-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Astraeus</h1>
              <p className="text-sm text-white/70">RBC Analytics AI</p>
            </div>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white">
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Recent Chats</div>
          {[
            "Revenue Analysis Q4 2024",
            "Customer Segmentation Insights",
            "Risk Assessment Report",
            "Market Trends Analysis",
          ].map((chat, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors truncate"
            >
              <MessageSquare className="w-3 h-3 inline mr-2" />
              {chat}
            </button>
          ))}
        </div>

        {/* Model Selector */}
        <div className="p-4 border-t border-white/20">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Dataset</div>
          <div className="space-y-2">
            {["PAR", "DFR"].map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model as ModelType)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  selectedModel === model
                    ? "bg-rbc-yellow text-rbc-blue font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {model} Analytics
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-white/20">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rbc-yellow rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-rbc-blue" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Analytics Assistant</h2>
                <p className="text-sm text-white/70">Connected to {selectedModel} dataset</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white/70">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-rbc-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 text-rbc-blue" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Your idea of <span className="text-rbc-yellow italic font-script">building insights</span> happens
                  here
                </h3>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Ask questions about your {selectedModel} data using natural language. Get instant insights, generate
                  reports, and discover patterns in your financial data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  {[
                    "Show me revenue trends for Q4",
                    "Analyze customer segments by region",
                    "What are the top risk factors?",
                    "Generate a performance summary",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white/90 hover:text-white transition-colors text-left border border-white/20 hover:border-white/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
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
                    <div className="w-8 h-8 bg-rbc-yellow rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-rbc-blue" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-3xl rounded-2xl px-6 py-4 shadow-lg",
                      message.role === "user"
                        ? "bg-rbc-blue text-white ml-12"
                        : "bg-white text-gray-900 border border-gray-200",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div
                        className="prose prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.renderedContent }}
                      />
                    ) : (
                      <div className="leading-relaxed">{message.content}</div>
                    )}

                    {message.isStreaming && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-rbc-blue rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">Analyzing data...</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex items-center gap-2 mt-3 text-xs",
                        message.role === "user" ? "text-white/70" : "text-gray-500",
                      )}
                    >
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-5 h-5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a question about ${selectedModel} data...`}
                  className="w-full px-6 py-4 bg-white rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rbc-yellow text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg border border-gray-200"
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
                className="p-4 bg-rbc-yellow hover:bg-yellow-400 text-rbc-blue rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-white/60">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span>Powered by RBC Analytics AI</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
