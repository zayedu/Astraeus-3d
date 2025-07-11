import MarkdownIt from "markdown-it"

// Initialize markdown-it with security-focused settings
const markdown = new MarkdownIt({
  html: false, // Disable HTML for security (as mentioned in the Vue example)
  linkify: true,
  typographer: true,
  breaks: true,
})

// RBC-branded styling for markdown elements
markdown.renderer.rules.heading_open = (tokens, idx) => {
  const level = tokens[idx].markup.length
  const classes = {
    1: "text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 border-b border-gray-200 pb-2",
    2: "text-xl font-semibold text-gray-800 mb-3 mt-5 first:mt-0",
    3: "text-lg font-semibold text-gray-800 mb-3 mt-4 first:mt-0",
    4: "text-base font-semibold text-gray-700 mb-2 mt-3 first:mt-0",
    5: "text-sm font-semibold text-gray-700 mb-2 mt-3 first:mt-0",
    6: "text-sm font-medium text-gray-600 mb-2 mt-2 first:mt-0",
  }
  return `<h${level} class="${classes[level as keyof typeof classes] || classes[6]}">`
}

markdown.renderer.rules.heading_close = (tokens, idx) => {
  const level = tokens[idx].markup.length
  return `</h${level}>`
}

markdown.renderer.rules.paragraph_open = () => {
  return '<p class="mb-4 text-gray-700 leading-relaxed">'
}

markdown.renderer.rules.code_inline = (tokens, idx) => {
  return `<code class="px-2 py-1 bg-blue-50 text-rbc-blue rounded-md text-sm font-mono border border-blue-100">${tokens[idx].content}</code>`
}

markdown.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const lang = token.info ? ` data-language="${token.info}"` : ""
  return `<pre class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 overflow-x-auto"${lang}><code class="text-gray-800 text-sm font-mono">${token.content}</code></pre>`
}

markdown.renderer.rules.bullet_list_open = () => {
  return '<ul class="list-disc list-inside mb-4 space-y-2 text-gray-700 ml-4">'
}

markdown.renderer.rules.ordered_list_open = () => {
  return '<ol class="list-decimal list-inside mb-4 space-y-2 text-gray-700 ml-4">'
}

markdown.renderer.rules.list_item_open = () => {
  return '<li class="leading-relaxed">'
}

markdown.renderer.rules.strong_open = () => {
  return '<strong class="font-semibold text-gray-900">'
}

markdown.renderer.rules.em_open = () => {
  return '<em class="italic text-gray-600">'
}

markdown.renderer.rules.blockquote_open = () => {
  return '<blockquote class="border-l-4 border-rbc-blue pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic rounded-r-lg">'
}

markdown.renderer.rules.table_open = () => {
  return '<div class="overflow-x-auto mb-4"><table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">'
}

markdown.renderer.rules.table_close = () => {
  return "</table></div>"
}

markdown.renderer.rules.thead_open = () => {
  return '<thead class="bg-rbc-blue text-white">'
}

markdown.renderer.rules.th_open = () => {
  return '<th class="px-4 py-3 text-left text-sm font-semibold border-r border-blue-600 last:border-r-0">'
}

markdown.renderer.rules.td_open = () => {
  return '<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 border-r border-gray-200 last:border-r-0">'
}

markdown.renderer.rules.tr_open = (tokens, idx, options, env, renderer) => {
  return '<tr class="hover:bg-gray-50 transition-colors">'
}

// Custom link rendering with RBC styling
markdown.renderer.rules.link_open = (tokens, idx) => {
  const token = tokens[idx]
  const href = token.attrGet("href")
  return `<a href="${href}" class="text-rbc-blue hover:text-blue-700 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">`
}

// Enhanced error handling for streaming markdown
export function renderMarkdown(content: string): string {
  if (!content) return ""

  try {
    // Re-render entire content on each call (streaming approach from Vue example)
    // This is computationally inefficient but provides smooth visual experience
    return markdown.render(content)
  } catch (error) {
    console.error("Markdown rendering error:", error)
    // Fallback to plain text with basic HTML escaping
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }
}

// Utility function for sanitizing partial markdown during streaming
export function sanitizePartialMarkdown(content: string): string {
  // Basic sanitization for partial content during streaming
  // This helps prevent rendering issues when markdown spans multiple chunks
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
}
