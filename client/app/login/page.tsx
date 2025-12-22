'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import LiquidEther from '@/components/LiquidEther'
import ThemeToggler from '@/components/ThemeToggler'

export default function LoginPage() {
    const router = useRouter()
    const { isAuthenticated, setUser, setToken } = useAuthStore()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // If already authenticated, redirect to dashboard
        if (isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [isAuthenticated, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        // Basic validation
        if (!email || !password) {
            toast.error('Please fill in all fields')
            setLoading(false)
            return
        }

        if (!isLogin && !name) {
            toast.error('Please enter your name')
            setLoading(false)
            return
        }

        try {
            if (isLogin) {
                // Login
                try {
                    const data = await api.login({ email, password })
                    setToken(data.access_token)

                    // Get user info
                    const user = await api.getCurrentUser()
                    setUser(user)

                    toast.success(`Welcome back, ${user.name}!`)
                    router.push('/dashboard')
                } catch (loginError: any) {
                    console.error('Login error:', loginError)
                    const errorMsg = loginError.response?.data?.detail || loginError.message || 'Login failed'

                    if (loginError.response?.status === 401) {
                        toast.error('Incorrect email or password')
                    } else if (loginError.response?.status === 500) {
                        toast.error('Server error. Please try again later.')
                    } else if (loginError.code === 'ERR_NETWORK') {
                        toast.error('Cannot connect to server. Please check if backend is running.')
                    } else {
                        toast.error(errorMsg)
                    }
                    throw loginError
                }
            } else {
                // Register
                try {
                    const user = await api.register({ email, name, password })
                    toast.success(`Account created for ${user.name}! Please login.`)
                    setIsLogin(true)
                    // Clear form - safely handle form reset
                    const form = e.currentTarget
                    if (form && typeof form.reset === 'function') {
                        setTimeout(() => form.reset(), 100)
                    }
                } catch (registerError: any) {
                    console.error('Registration error:', registerError)
                    const errorMsg = registerError.response?.data?.detail || registerError.message || 'Registration failed'

                    if (registerError.response?.status === 400) {
                        if (errorMsg.includes('already registered')) {
                            toast.error('This email is already registered. Please login instead.')
                        } else {
                            toast.error(errorMsg)
                        }
                    } else if (registerError.response?.status === 500) {
                        toast.error('Server error. Please try again later.')
                    } else if (registerError.code === 'ERR_NETWORK') {
                        toast.error('Cannot connect to server. Please check if backend is running.')
                    } else {
                        toast.error(errorMsg)
                    }
                    throw registerError
                }
            }
        } catch (error: any) {
            // Error already handled above
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            toast.info('Redirecting to Google...')
            // Redirect to Google OAuth
            window.location.href = `${apiUrl}/auth/google/login`
        } catch (error) {
            console.error('Google login error:', error)
            toast.error('Failed to initiate Google login. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative p-4">
            {/* Theme Toggler - Top Right - Only render after mount */}
            {mounted && (
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                    <ThemeToggler variant="switch" />
                </div>
            )}

            {/* Animated WhatsApp-themed liquid background */}
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={['#075E54', '#128C7E', '#25D366', '#DCF8C6']}
                    mouseForce={25}
                    cursorSize={120}
                    autoDemo={true}
                    autoSpeed={0.6}
                    autoIntensity={2.5}
                />
            </div>

            {/* Login Card with enhanced glassmorphism effect - Always Light Theme */}
            {/* Force light theme by preventing dark class propagation */}
            <div className="w-full max-w-md relative z-10 [&_.dark]:!hidden">
                <Card className="backdrop-blur-xl !bg-white/70 shadow-2xl !border-white/50 overflow-hidden">
                    {/* Shine overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>

                    {/* Content wrapper */}
                    <div className="relative z-10">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">W</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold !text-gray-900">WhatsHub Enterprise</h1>
                                    <p className="text-sm !text-gray-600">Marketing Dashboard</p>
                                </div>
                            </div>
                            <CardTitle className="!text-gray-900">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
                            <CardDescription className="!text-gray-600">
                                {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mb-4 !bg-white !text-gray-900 !border-gray-300 hover:!bg-gray-50"
                                onClick={handleGoogleLogin}
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative mb-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t !border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="px-2 !text-gray-600" style={{ backgroundColor: '#ffffff' }}>Or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="!text-gray-900">Name</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required className="!bg-white !text-gray-900 !border-gray-300" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="!text-gray-900">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="you@example.com" required className="!bg-white !text-gray-900 !border-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="!text-gray-900">Password</Label>
                                    <Input id="password" name="password" type="password" placeholder="••••••••" required className="!bg-white !text-gray-900 !border-gray-300" />
                                </div>
                                <Button type="submit" className="w-full !bg-green-600 hover:!bg-green-700 !text-white" disabled={loading}>
                                    {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
                                </Button>
                            </form>
                            <div className="mt-4 text-center text-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="!text-green-600 hover:underline font-medium"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                                </button>
                            </div>
                        </CardContent>
                    </div> {/* Close content wrapper */}
                </Card>
            </div> {/* Close light theme wrapper */}
        </div>
    )
}
