import { describe, expect, it } from 'vitest'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'

describe('getYouTubeEmbedUrl (U-09)', () => {
  it('convierte URLs de shorts', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/shorts/ggCogna9mPw'))
      .toBe('https://www.youtube.com/embed/ggCogna9mPw?autoplay=1')
  })

  it('convierte URLs de watch', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=pD0ECeS_frM'))
      .toBe('https://www.youtube.com/embed/pD0ECeS_frM?autoplay=1')
  })

  it('ignora parámetros extra en URLs de watch', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=pD0ECeS_frM&t=5s'))
      .toBe('https://www.youtube.com/embed/pD0ECeS_frM?autoplay=1')
  })

  it('deja pasar URLs no reconocidas sin tocar', () => {
    const other = 'https://vimeo.com/12345'
    expect(getYouTubeEmbedUrl(other)).toBe(other)
  })
})

describe('getYouTubeThumbnail (U-10)', () => {
  it('extrae el id correcto para shorts y watch', () => {
    expect(getYouTubeThumbnail('https://www.youtube.com/shorts/z66hPvBAvCU'))
      .toBe('https://img.youtube.com/vi/z66hPvBAvCU/mqdefault.jpg')
    expect(getYouTubeThumbnail('https://www.youtube.com/watch?v=f0nBjDBS9yc'))
      .toBe('https://img.youtube.com/vi/f0nBjDBS9yc/mqdefault.jpg')
  })

  it('retorna string vacío para URLs no reconocidas', () => {
    expect(getYouTubeThumbnail('https://example.com/video')).toBe('')
  })
})
