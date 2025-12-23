'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setToken, setUser } = useAuthStore()
    const processedRef = useRef(false)

    useEffect(() => {
        // Prevent multiple executions
        if (processedRef.current) {
            return
        }

        const handleCallback = async () => {
            const token = searchParams.get('token')

            if (!token) {
                toast.error('Authentication failed - no token received')
                router.push('/login')
                return
            }

            try {
                // Mark as processed before async operations
                processedRef.current = true

                // Set token
                setToken(token)

                // Get user info
                const user = await api.getCurrentUser()
                setUser(user)

                toast.success(`Welcome, ${user.name}!`)

                // Redirect to dashboard
                router.replace('/dashboard')
            } catch (error: any) {
                console.error('OAuth callback error:', error)
                processedRef.current = false // Reset on error
                toast.error('Failed to complete authentication. Please try again.')
                router.push('/login')
            }
        }

        handleCallback()
    }, []) // Empty dependency array - only run once on mount

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Completing sign-in...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
