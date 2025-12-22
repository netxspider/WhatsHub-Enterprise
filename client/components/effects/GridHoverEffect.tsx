'use client'

import { useEffect, useRef, useState } from 'react'

interface GridHoverEffectProps {
    className?: string
}

export default function GridHoverEffect({ className = '' }: GridHoverEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)

        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = dimensions.width
        canvas.height = dimensions.height

        const gridSize = 50
        const cols = Math.ceil(dimensions.width / gridSize)
        const rows = Math.ceil(dimensions.height / gridSize)

        const grid: number[][] = []
        for (let i = 0; i < rows; i++) {
            grid[i] = []
            for (let j = 0; j < cols; j++) {
                grid[i][j] = 0
            }
        }

        let mouseX = -1000
        let mouseY = -1000

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY
        }

        window.addEventListener('mousemove', handleMouseMove)

        const animate = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height)

            // Draw grid
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)'
            ctx.lineWidth = 1

            for (let i = 0; i <= rows; i++) {
                ctx.beginPath()
                ctx.moveTo(0, i * gridSize)
                ctx.lineTo(dimensions.width, i * gridSize)
                ctx.stroke()
            }

            for (let j = 0; j <= cols; j++) {
                ctx.beginPath()
                ctx.moveTo(j * gridSize, 0)
                ctx.lineTo(j * gridSize, dimensions.height)
                ctx.stroke()
            }

            // Calculate hover effects
            const mouseCol = Math.floor(mouseX / gridSize)
            const mouseRow = Math.floor(mouseY / gridSize)

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const distance = Math.sqrt(
                        Math.pow(i - mouseRow, 2) + Math.pow(j - mouseCol, 2)
                    )

                    if (distance < 5) {
                        grid[i][j] = Math.max(grid[i][j], (5 - distance) / 5)
                    }

                    // Fade out
                    grid[i][j] *= 0.95

                    if (grid[i][j] > 0.01) {
                        const opacity = grid[i][j] * 0.3
                        const gradient = ctx.createRadialGradient(
                            j * gridSize + gridSize / 2,
                            i * gridSize + gridSize / 2,
                            0,
                            j * gridSize + gridSize / 2,
                            i * gridSize + gridSize / 2,
                            gridSize
                        )

                        gradient.addColorStop(0, `rgba(34, 197, 94, ${opacity})`)
                        gradient.addColorStop(1, `rgba(34, 197, 94, 0)`)

                        ctx.fillStyle = gradient
                        ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize)
                    }
                }
            }

            requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [dimensions])

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            style={{ opacity: 0.6 }}
        />
    )
}
