'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowUp, Heart, Activity, Shield, AlertTriangle, CheckSquare, Ban, Clock, TrendingUp, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExerciseCard } from '@/components/exercise-card'

// Exercise data with full content from specs
const phase1Exercises = [
  {
    name: 'Esfinge / Extensión suave',
    objective: 'Ayuda a soltar la espalda baja cuando cuesta levantarse o empezar a caminar.',
    howTo: 'Acostada boca abajo. Apoyarse en los codos y levantar suavemente el pecho.',
    dosage: '5 a 10 repeticiones o 30 a 45 segundos, 4 a 6 veces al día.',
    shouldFeel: 'Alivio o molestia tolerable local en espalda.',
    shouldNotHappen: 'Que el dolor baje fuerte por la pierna.',
    tip: 'Subir suave, sin apretar hombros ni contener la respiración.',
    whenToUse: 'Úsalo especialmente al levantarse de la cama o cuando la espalda se sienta tiesa.',
    progression: 'Si alivia y no deja peor después, mantenerlo como ejercicio base de la fase 1.',
    videoUrl: 'https://www.youtube.com/shorts/ggCogna9mPw',
  },
  {
    name: 'Basculación pélvica',
    objective: 'Ordena la pelvis y activa abdomen suave sin exigir la espalda.',
    howTo: 'Boca arriba, rodillas dobladas. Aplastar suave la espalda baja contra la cama o colchoneta.',
    dosage: '10 a 15 repeticiones, mantener 5 segundos, 2 a 3 veces al día.',
    shouldFeel: 'Activación suave en abdomen y control de pelvis.',
    shouldNotHappen: 'Dolor agudo lumbar o rigidez fuerte después.',
    tip: 'Hazlo lento y con respiración tranquila.',
    whenToUse: 'Bueno para empezar la rutina o cuando se sienta descontrol lumbar.',
    progression: 'Antes de hacer más repeticiones, mejorar control y lentitud.',
    videoUrl: 'https://www.youtube.com/watch?v=pD0ECeS_frM',
  },
  {
    name: 'Empuje de rodillas hacia afuera con banda',
    objective: 'Activar glúteos sin irritar la parte lateral de la cadera.',
    howTo: 'Boca arriba, rodillas dobladas, con banda o cinturón suave sobre las rodillas. Empujar apenas hacia afuera.',
    dosage: '3 a 5 repeticiones de 30 a 45 segundos, 2 veces al día.',
    shouldFeel: 'Trabajo en glúteos, no pinchazo fuerte lateral.',
    shouldNotHappen: 'Aumento claro del dolor lateral de cadera.',
    tip: 'Empujar suave; no buscar fuerza máxima.',
    whenToUse: 'Útil cuando se necesita activar sin moverse mucho.',
    progression: 'Primero aumentar segundos, después tensión.',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Empuje%20de%20rodillas%20hacia%20fuera%20con%20banda-tpJ4NkxEVzU51ClXIWqXMskHI6NA38.jpg',
  },
  {
    name: 'Posición de alivio tipo "4" / FABER',
    objective: 'Usar una postura que alivie y baje tensión.',
    howTo: 'Boca arriba. Tobillo derecho sobre rodilla izquierda. Dejar caer suave la rodilla hacia el lado.',
    dosage: '30 a 60 segundos, 3 a 4 veces al día.',
    shouldFeel: 'Alivio, apertura suave o disminución de tensión.',
    shouldNotHappen: 'Dolor punzante o estiramiento agresivo.',
    tip: 'No forzar la apertura; dejar que caiga suave.',
    whenToUse: 'Antes de levantarse, después de sentarse mucho rato o cuando ande más tensa.',
    progression: 'Mantener como recurso de alivio, no como ejercicio de fuerza.',
    videoUrl: 'https://www.youtube.com/watch?v=xc2uKzcWnsg',
  },
]

const phase2Exercises = [
  {
    name: 'Puente corto',
    objective: 'Empezar a recuperar fuerza en glúteos y cadera sin sobrecargar la espalda.',
    howTo: 'Boca arriba, rodillas dobladas. Levantar pelvis un poco, sin arquear la espalda.',
    dosage: '3 series de 8 a 10 repeticiones.',
    shouldFeel: 'Trabajo en glúteos y parte posterior, sin dolor fuerte lumbar.',
    shouldNotHappen: 'Pinchazo lumbar o aumento importante del dolor lateral.',
    tip: 'Subir poco y controlado; mejor corto y limpio que alto y desordenado.',
    whenToUse: 'Cuando la fase 1 ya se tolere bien y el dolor diario esté más bajo.',
    progression: 'Subir repeticiones antes que altura.',
    videoUrl: 'https://www.youtube.com/shorts/vRHav61cjVU',
  },
  {
    name: 'Bird-dog asistido',
    objective: 'Mejorar estabilidad y control lumbar.',
    howTo: 'En cuatro apoyos, deslizar una pierna hacia atrás sin torcer la pelvis.',
    dosage: '2 a 3 series de 6 a 8 por lado.',
    shouldFeel: 'Trabajo de control más que esfuerzo bruto.',
    shouldNotHappen: 'Perder equilibrio o torcer tronco.',
    tip: 'Mover poco, sin apurarse ni torcer la pelvis.',
    whenToUse: 'Cuando ya haya mejor control y menos irritación.',
    progression: 'Aumentar rango solo si sigue estable.',
    videoUrl: 'https://www.youtube.com/shorts/z66hPvBAvCU',
  },
  {
    name: 'Separar la pierna de lado (Abducción lateral)',
    objective: 'Fortalecer la cadera lateral con buena técnica.',
    howTo: 'Acostada sobre el lado sano, levantar la pierna de arriba unos 30 grados.',
    dosage: '3 series de 10 a 12.',
    shouldFeel: 'Trabajo lateral de glúteo.',
    shouldNotHappen: 'Pinchazo fuerte en la parte lateral de la cadera.',
    tip: 'Pie mirando al frente y tronco quieto.',
    whenToUse: 'Útil para recuperar soporte de cadera al caminar.',
    progression: 'Primero calidad del movimiento, después más repeticiones.',
    videoUrl: 'https://www.youtube.com/watch?v=f0nBjDBS9yc',
  },
  {
    name: 'Sentadilla parcial a silla alta',
    objective: 'Practicar sentarse y pararse con más control y seguridad.',
    howTo: 'Bajar hacia una silla alta usando cadera atrás y tronco levemente inclinado.',
    dosage: '3 series de 8 a 10.',
    shouldFeel: 'Trabajo de piernas y glúteos con control.',
    shouldNotHappen: 'Caerse a la silla o dolor fuerte al bajar.',
    tip: 'Llevar la cadera hacia atrás y usar brazos si hace falta.',
    whenToUse: 'Muy útil para baño, cama y silla.',
    progression: 'Ir usando menos apoyo de brazos con el tiempo.',
    videoUrl: 'https://www.youtube.com/watch?v=I63oel2pBKM',
  },
]

const phase3Exercises = [
  {
    name: 'Caminata progresiva',
    objective: 'Volver a moverse con más confianza y menos rigidez.',
    howTo: 'Caminar en superficie plana, a paso cómodo, con calzado adecuado.',
    dosage: '15 minutos e ir subiendo hasta 30.',
    shouldFeel: 'Cuerpo más suelto, no más rígido.',
    shouldNotHappen: 'Quedar claramente peor varias horas.',
    tip: 'Mejor varios minutos tolerables que una caminata que la deje peor.',
    whenToUse: 'Todos los días si se tolera.',
    progression: 'Subir minutos de a poco.',
  },
  {
    name: 'Mantención de core y glúteo',
    objective: 'Mantener avances y prevenir recaídas.',
    howTo: 'Elegir puente, bird-dog, abducción lateral y extensión lumbar según tolerancia.',
    dosage: '2 a 3 veces por semana.',
    shouldFeel: 'Trabajo muscular sin dolor.',
    shouldNotHappen: 'Volver a sentir los síntomas iniciales.',
    tip: 'Quedarse con pocos ejercicios, pero hacerlos constante.',
    whenToUse: 'Cuando ya esté más estable.',
    progression: '2 a 3 veces por semana como mantención.',
  },
]

const checklistItems = [
  'Hice mi calentamiento suave',
  'Hice 3 a 4 ejercicios de mi fase',
  'Evité sentarme en cosas muy bajas',
  'Caminé un poco durante el día',
  'Terminé sin quedar peor',
]

type PainMode = 'normal' | 'hurts-more' | 'feeling-better'

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [exercisesDone, setExercisesDone] = useState<Record<string, boolean>>({})
  const [painMode, setPainMode] = useState<PainMode>('normal')
  const [activePhase, setActivePhase] = useState('fase1')

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))
  }

  const toggleExerciseDone = (name: string, done: boolean) => {
    setExercisesDone(prev => ({ ...prev, [name]: done }))
  }

  const completedChecklistCount = Object.values(checkedItems).filter(Boolean).length

  const markAllComplete = () => {
    const allChecked: Record<string, boolean> = {}
    checklistItems.forEach(item => { allChecked[item] = true })
    setCheckedItems(allChecked)
  }

  const resetChecklist = () => {
    setCheckedItems({})
  }

  const handlePainMode = (mode: PainMode) => {
    setPainMode(mode)
    if (mode === 'hurts-more') {
      setActivePhase('fase1')
    } else if (mode === 'feeling-better') {
      setActivePhase('fase2')
    }
  }

  // Estimated duration based on phase
  const estimatedDuration = useMemo(() => {
    if (painMode === 'hurts-more' || activePhase === 'fase1') return '8-12 min'
    if (activePhase === 'fase2') return '15-20 min'
    return '20-30 min'
  }, [painMode, activePhase])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-4xl">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Entrenamiento Lisve
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Guía en casa para moverse con más seguridad
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Volver arriba</span>
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 mx-auto max-w-4xl">
        {/* Hero */}
        <section id="inicio" className="mb-8 text-center">
          <div className="mb-6">
            <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Moverse mejor, paso a paso.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Esta es tu guía personal para hacer ejercicios en casa de forma segura, clara y progresiva. 
              Sin apuro, sin forzar de más.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-base py-6 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => document.getElementById('fases')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Activity className="h-5 w-5 mr-2" />
              Empezar rutina
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base py-6 px-8 border-border text-foreground hover:bg-secondary"
              onClick={() => document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <CheckSquare className="h-5 w-5 mr-2" />
              Checklist diario
            </Button>
          </div>
        </section>

        {/* Status Bar - Pain Mode */}
        <section className="mb-8">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">Hoy: {estimatedDuration}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant={painMode === 'hurts-more' ? 'default' : 'outline'}
                    onClick={() => handlePainMode('hurts-more')}
                    className={`text-sm ${painMode === 'hurts-more' ? 'bg-danger hover:bg-danger/90 text-white' : 'border-danger/50 text-danger hover:bg-danger/10'}`}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Hoy me duele más
                  </Button>
                  <Button
                    size="sm"
                    variant={painMode === 'feeling-better' ? 'default' : 'outline'}
                    onClick={() => handlePainMode('feeling-better')}
                    className={`text-sm ${painMode === 'feeling-better' ? 'bg-success hover:bg-success/90 text-white' : 'border-success/50 text-success hover:bg-success/10'}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Hoy ando mejor
                  </Button>
                </div>
              </div>
              {painMode === 'hurts-more' && (
                <p className="text-sm text-danger mt-3 text-center">
                  Modo suave activado. Haz solo ejercicios de Fase 1 para aliviar.
                </p>
              )}
              {painMode === 'feeling-better' && (
                <p className="text-sm text-success mt-3 text-center">
                  ¡Bien! Puedes probar ejercicios de Fase 2 para fortalecer.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Before Starting */}
        <section className="mb-8">
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-warning">
                <Shield className="h-6 w-6" />
                Antes de empezar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Molestia tolerable puede ser aceptable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Si queda mucho peor después, bajar dosis.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Si aparece dolor eléctrico a la pierna, debilidad nueva, fiebre o síntomas raros, suspender y consultar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Mejor poquito todos los días que mucho de golpe.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Evitar sentarse en superficies muy bajas si eso te irrita.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Phases */}
        <section id="fases" className="mb-8 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            Fases del tratamiento
          </h2>
          
          <Tabs value={activePhase} onValueChange={setActivePhase} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-secondary/50">
              <TabsTrigger 
                value="fase1" 
                className="text-xs sm:text-sm py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">Fase 1: </span>Calmar
              </TabsTrigger>
              <TabsTrigger 
                value="fase2" 
                className="text-xs sm:text-sm py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={painMode === 'hurts-more'}
              >
                <span className="hidden sm:inline">Fase 2: </span>Fortalecer
              </TabsTrigger>
              <TabsTrigger 
                value="fase3" 
                className="text-xs sm:text-sm py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={painMode === 'hurts-more'}
              >
                <span className="hidden sm:inline">Fase 3: </span>Mantener
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fase1" className="mt-6">
              <div className="mb-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-1">Fase 1: Calmar, descargar y activar suave</h3>
                <p className="text-muted-foreground text-sm">
                  Objetivo: Reducir el dolor y empezar a mover sin irritar.
                </p>
              </div>
              <div className="grid gap-6">
                {phase1Exercises.map((exercise) => (
                  <ExerciseCard 
                    key={exercise.name} 
                    {...exercise} 
                    isDone={exercisesDone[exercise.name]}
                    onToggleDone={(done) => toggleExerciseDone(exercise.name, done)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fase2" className="mt-6">
              <div className="mb-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-1">Fase 2: Fortalecer sin irritar</h3>
                <p className="text-muted-foreground text-sm">
                  Objetivo: Ganar fuerza gradualmente cuando el dolor ya esté más controlado.
                </p>
              </div>
              <div className="grid gap-6">
                {phase2Exercises.map((exercise) => (
                  <ExerciseCard 
                    key={exercise.name} 
                    {...exercise} 
                    isDone={exercisesDone[exercise.name]}
                    onToggleDone={(done) => toggleExerciseDone(exercise.name, done)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fase3" className="mt-6">
              <div className="mb-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-1">Fase 3: Mantener y prevenir recaídas</h3>
                <p className="text-muted-foreground text-sm">
                  Objetivo: Consolidar lo ganado y evitar volver atrás.
                </p>
              </div>
              <div className="grid gap-6">
                {phase3Exercises.map((exercise) => (
                  <ExerciseCard 
                    key={exercise.name} 
                    {...exercise} 
                    isDone={exercisesDone[exercise.name]}
                    onToggleDone={(done) => toggleExerciseDone(exercise.name, done)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* When to advance */}
        <section className="mb-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <TrendingUp className="h-6 w-6" />
                Cuándo pasar de fase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Cuando levantarse de la silla o del baño sea más llevadero.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Cuando la caminata moleste menos al inicio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Cuando la fase actual no empeore el dolor después.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-lg leading-none mt-0.5">•</span>
                  <span className="text-base leading-relaxed">Cuando el cuerpo tolere mejor la carga diaria.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Checklist */}
        <section id="checklist" className="mb-8 scroll-mt-20">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <CheckSquare className="h-6 w-6" />
                Checklist diario
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Marca lo que hagas cada día para llevar tu registro.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {checklistItems.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50 cursor-pointer hover:bg-background/80 transition-colors"
                  >
                    <Checkbox
                      checked={checkedItems[item] || false}
                      onCheckedChange={() => toggleCheckItem(item)}
                      className="h-6 w-6"
                    />
                    <span className={`text-base ${checkedItems[item] ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>

              {/* Progress */}
              <div className="p-4 rounded-lg bg-secondary/30 mb-4">
                <p className="text-center text-foreground font-medium">
                  Hoy completaste {completedChecklistCount} de {checklistItems.length}
                </p>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedChecklistCount / checklistItems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={markAllComplete}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Marcar rutina completa
                </Button>
                <Button 
                  onClick={resetChecklist}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  Reiniciar checklist
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Traffic Light */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-6 w-6 text-warning" />
                Semáforo del dolor
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Usa esta guía para saber cómo reaccionar según cómo te sientas.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-success/10 p-4 border border-success/30">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-success mb-1">Verde: Todo bien</h4>
                    <p className="text-foreground/90 text-sm leading-relaxed">
                      Dolor tolerable, queda igual o mejor después del ejercicio. ¡Sigue así!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-warning/10 p-4 border border-warning/30">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-warning mb-1">Amarillo: Ojo, con cuidado</h4>
                    <p className="text-foreground/90 text-sm leading-relaxed">
                      Molesta más durante el ejercicio pero vuelve a lo normal en 12-24 horas. Puedes seguir, pero con calma.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-danger/10 p-4 border border-danger/30">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-danger mb-1">Rojo: Parar</h4>
                    <p className="text-foreground/90 text-sm leading-relaxed">
                      Dolor fuerte, nuevo, eléctrico hacia la pierna, debilidad nueva o empeoramiento importante. Descansa y consulta.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What to Avoid */}
        <section className="mb-8">
          <Card className="border-danger/30 bg-danger/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-danger">
                <Ban className="h-6 w-6" />
                Qué evitar por ahora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-danger text-lg leading-none mt-0.5">✕</span>
                  <span className="text-base leading-relaxed">Sentarse en baño muy bajo sin apoyo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-lg leading-none mt-0.5">✕</span>
                  <span className="text-base leading-relaxed">Cruzar piernas por mucho rato.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-lg leading-none mt-0.5">✕</span>
                  <span className="text-base leading-relaxed">Quedarse quieta todo el día por miedo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-lg leading-none mt-0.5">✕</span>
                  <span className="text-base leading-relaxed">Agacharse redondeando la espalda para todo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-danger text-lg leading-none mt-0.5">✕</span>
                  <span className="text-base leading-relaxed">Hacer estiramientos agresivos si ese día está muy sensible.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Activities and Regulation */}
        <section className="mb-8">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Activity className="h-6 w-6 text-primary" />
                Actividades y regulación
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                No es necesario dejar de moverse, pero por ahora conviene regular la carga.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity rows */}
              <div className="space-y-3">
                {/* Zumba */}
                <div className="rounded-lg bg-secondary/40 p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <span className="text-warning font-bold text-sm">Z</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Zumba</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Puede seguir si la hace suave, sin saltos, sin giros bruscos y sin obligarse a seguir todo el ritmo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Funcional */}
                <div className="rounded-lg bg-secondary/40 p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <span className="text-warning font-bold text-sm">F</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Funcional</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Solo si puede adaptar ejercicios; evitar impacto, sentadillas profundas, burpees, trote, step alto o cambios bruscos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corridas / trote */}
                <div className="rounded-lg bg-secondary/40 p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
                      <span className="text-danger font-bold text-sm">C</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Corridas / trote</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Mejor pausarlas por ahora si todavía duele al levantarse, caminar o después del ejercicio.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caminata */}
                <div className="rounded-lg bg-secondary/40 p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <span className="text-success font-bold text-sm">Ca</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Caminata</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Sí, suele ser la mejor base para volver a moverse.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple rule highlight */}
              <div className="rounded-lg bg-primary/10 p-5 border border-primary/30 mt-6">
                <h4 className="font-semibold text-primary mb-2 text-base">Regla simple</h4>
                <p className="text-foreground/90 text-sm leading-relaxed">
                  Si una actividad la deja igual o mejor al otro día, puede seguir.
                </p>
                <p className="text-foreground/90 text-sm leading-relaxed mt-2">
                  Si la deja más dolorida, más tiesa o más limitada por más de 12 a 24 horas, hay que bajarla, modificarla o pausarla.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final Message */}
        <section className="mb-8">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="text-lg text-foreground leading-relaxed mb-4 text-pretty">
                  Hazlo con calma. No se trata de hacerlo perfecto ni de aguantar dolor. 
                  Se trata de moverse mejor, con más confianza, paso a paso.
                </p>
                <p className="text-sm text-muted-foreground">
                  Hecho para acompañar a Lisve en casa, con lenguaje simple, apoyo visual y orden práctico.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/20 py-6">
        <div className="container px-4 mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            Hecho con cariño para Lisve
          </p>
        </div>
      </footer>
    </div>
  )
}
