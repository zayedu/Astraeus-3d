import MarkdownIt from "markdown-it"

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// Configure markdown-it for better styling
markdown.renderer.rules.heading_open = (tokens, idx) => {
  const level = tokens[idx].markup.length
  return `<h${level} class="text-lg font-semibold text-blue-100 mb-3 mt-6 first:mt-0">`
}

markdown.renderer.rules.heading_close = (tokens, idx) => {
  const level = tokens[idx].markup.length
  return `</h${level}>`
}

markdown.renderer.rules.paragraph_open = () => {
  return '<p class="mb-4 text-blue-50/90 leading-relaxed">'
}

markdown.renderer.rules.code_inline = (tokens, idx) => {
  return `<code class="px-2 py-1 bg-rbc-blue/20 text-rbc-yellow rounded-md text-sm font-mono">${tokens[idx].content}</code>`
}

markdown.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const lang = token.info.trim()
  return `<pre class="bg-black/30 border border-white/10 rounded-xl p-4 mb-4 overflow-x-auto"><code class="text-blue-100 text-sm font-mono">${token.content}</code></pre>`
}

markdown.renderer.rules.bullet_list_open = () => {
  return '<ul class="list-disc list-inside mb-4 space-y-2 text-blue-50/90">'
}

markdown.renderer.rules.ordered_list_open = () => {
  return '<ol class="list-decimal list-inside mb-4 space-y-2 text-blue-50/90">'
}

markdown.renderer.rules.strong_open = () => {
  return '<strong class="font-semibold text-white">'
}

markdown.renderer.rules.em_open = () => {
  return '<em class="italic text-blue-200">'
}

export function renderMarkdown(content: string): string {
  if (!content) return ""
  return markdown.render(content)
}
