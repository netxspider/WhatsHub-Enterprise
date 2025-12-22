'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'

interface ThemeTogglerProps {
    variant?: 'button' | 'toggle' | 'icon' | 'switch'
}

export default function ThemeToggler({ variant = 'button' }: ThemeTogglerProps) {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // Icon-only variant - circular button like profile icon
    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                ) : (
                    <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                )}
            </button>
        )
    }

    // Toggle variant - for compact display
    if (variant === 'toggle' || variant === 'switch') {
        return (
            <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                style={{
                    backgroundColor: theme === 'dark' ? '#10b981' : '#e5e7eb'
                }}
            >
                <span className="sr-only">Toggle theme</span>
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        )
    }

    // Toggle variant for sidebar
    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 0 : 1,
                    rotate: theme === 'dark' ? 90 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Sun className="h-5 w-5 text-amber-500" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : -90,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Moon className="h-5 w-5 text-blue-500" />
            </motion.div>
        </button>
    )
}
