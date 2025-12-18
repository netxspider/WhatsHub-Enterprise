'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const { isAuthenticated, setUser, setToken } = useAuthStore()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        try {
            if (isLogin) {
                // Login
                const data = await api.login({ email, password })
                setToken(data.access_token)

                // Get user info
                const user = await api.getCurrentUser()
                setUser(user)

                toast.success('Welcome back!')
                router.push('/')
            } else {
                // Register
                await api.register({ email, name, password })
                toast.success('Account created! Please login.')
                setIsLogin(true)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">W</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">WhatsHub Enterprise</h1>
                            <p className="text-sm text-muted-foreground">Marketing Dashboard</p>
                        </div>
                    </div>
                    <CardTitle>{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••••" required />
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-green-600 hover:underline"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
