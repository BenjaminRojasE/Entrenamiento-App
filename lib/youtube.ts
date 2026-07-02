// Helpers puros para embeber videos de YouTube (usados por ExerciseCard).

const SHORTS_RE = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
const WATCH_RE = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/

function extractVideoId(url: string): string | null {
  const shortMatch = url.match(SHORTS_RE)
  const watchMatch = url.match(WATCH_RE)
  return shortMatch?.[1] ?? watchMatch?.[1] ?? null
}

export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractVideoId(url)
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  }
  return url
}

export function getYouTubeThumbnail(url: string): string {
  const videoId = extractVideoId(url)
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }
  return ''
}
