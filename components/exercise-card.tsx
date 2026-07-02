'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, CheckCircle2, XCircle, Lightbulb, TrendingUp, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface ExerciseCardProps {
  name: string
  objective: string
  howTo: string
  dosage: string
  shouldFeel: string
  shouldNotHappen: string
  tip?: string
  whenToUse?: string
  videoUrl?: string
  imageUrl?: string
  progression?: string
  onToggleDone?: (done: boolean) => void
  isDone?: boolean
}

function getYouTubeEmbedUrl(url: string): string {
  const shortMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1`
  }
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`
  }
  return url
}

function getYouTubeThumbnail(url: string): string {
  const shortMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  
  const videoId = shortMatch?.[1] || watchMatch?.[1]
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }
  return ''
}

export function ExerciseCard({
  name,
  objective,
  howTo,
  dosage,
  shouldFeel,
  shouldNotHappen,
  tip,
  whenToUse,
  videoUrl,
  imageUrl,
  progression,
  onToggleDone,
  isDone = false,
}: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const thumbnailUrl = videoUrl ? getYouTubeThumbnail(videoUrl) : imageUrl

  const handlePlayClick = () => {
    setShowVideo(true)
  }

  return (
    <Card className={`overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all ${isDone ? 'opacity-70 border-success/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground leading-tight text-balance">
              {name}
            </CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed mt-1">
              {objective}
            </p>
          </div>
          {onToggleDone && (
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <Checkbox
                checked={isDone}
                onCheckedChange={(checked) => onToggleDone(checked as boolean)}
                className="h-6 w-6"
              />
              <span className="text-sm text-muted-foreground">Hecho</span>
            </label>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video/Image - Inline embed on click */}
        {thumbnailUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
            {showVideo && videoUrl ? (
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                title={name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <>
                <Image
                  src={thumbnailUrl}
                  alt={`Imagen del ejercicio: ${name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {videoUrl && (
                  <button 
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
                    aria-label={`Ver video de ${name}`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                      <Play className="h-7 w-7 ml-1" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* How to */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Cómo hacerlo
          </h4>
          <p className="text-foreground text-base leading-relaxed">
            {howTo}
          </p>
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">
            Dosis
          </h4>
          <p className="text-foreground text-base leading-relaxed">
            {dosage}
          </p>
        </div>

        {/* Should feel / Should not happen */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-success/10 p-4 border border-success/20">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-success mb-1">
                  Debe sentirse
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {shouldFeel}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-danger/10 p-4 border border-danger/20">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-danger mb-1">
                  No debe pasar
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {shouldNotHappen}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable details */}
        {(tip || whenToUse || progression) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span>Ver más detalles</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showDetails && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Tip */}
                {tip && (
                  <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">
                          Tip
                        </h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* When to use */}
                {whenToUse && (
                  <div className="rounded-lg bg-secondary/50 p-4 border border-border/50">
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          Cuándo usarlo
                        </h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {whenToUse}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progression */}
                {progression && (
                  <div className="rounded-lg bg-warning/10 p-4 border border-warning/20">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-warning mb-1">
                          Progreso
                        </h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {progression}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
