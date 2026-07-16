import { marked } from 'marked'

export interface Blog {
  slug: string
  title: string
  date: string
  dateFormatted: string
  html: string
  excerpt: string
  readingMinutes: number
}

const files = import.meta.glob<string>('../blogs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Parses the two-tag header at the top of each markdown file:
 *   Title: xyz
 *   Date: YYYY-MM-DD
 * Everything after the tags is treated as markdown content.
 */
function parseBlog(path: string, raw: string): Blog {
  const slug = path
    .split('/')
    .pop()!
    .replace(/\.md$/, '')

  const lines = raw.split(/\r?\n/)
  let title = slug
  let date = '1970-01-01'
  let bodyStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') {
      if (bodyStart > 0) {
        bodyStart = i + 1
        break
      }
      continue
    }
    const match = line.match(/^(Title|Date)\s*:\s*(.+)$/i)
    if (match) {
      const key = match[1].toLowerCase()
      if (key === 'title') title = match[2].trim()
      if (key === 'date') date = match[2].trim()
      bodyStart = i + 1
    } else {
      break
    }
  }

  const body = lines.slice(bodyStart).join('\n').trim()
  const html = marked.parse(body, { async: false }) as string

  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = plain.split(' ').filter(Boolean)
  const excerpt =
    words.slice(0, 32).join(' ') + (words.length > 32 ? '…' : '')
  const readingMinutes = Math.max(1, Math.round(words.length / 200))

  return {
    slug,
    title,
    date,
    dateFormatted: formatDate(date),
    html,
    excerpt,
    readingMinutes,
  }
}

let cache: Blog[] | null = null

export function getAllBlogs(): Blog[] {
  if (!cache) {
    cache = Object.entries(files)
      .map(([path, raw]) => parseBlog(path, raw))
      .sort((a, b) => b.date.localeCompare(a.date))
  }
  return cache
}
