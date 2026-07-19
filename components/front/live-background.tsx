'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import type { Engine } from 'tsparticles-engine'

const Particles = dynamic(() => import('react-tsparticles'), { ssr: false })

export default function LiveBackground() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Skip particles entirely on low-memory devices (< 4GB RAM)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory
    if (memory && memory < 4) return

    // Also skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setShouldRender(true)
  }, [])

  const particlesInit = useCallback(async (engine: Engine) => {
    const { loadSlim } = await import('tsparticles-slim')
    await loadSlim(engine)
  }, [])

  if (!shouldRender) return null

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 z-0 opacity-40 pointer-events-none"
      options={{
        fullScreen: { enable: false },
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 30,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab',
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
        particles: {
          color: {
            value: '#7c3aed',
          },
          links: {
            color: '#06b6d4',
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 30,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  )
}
