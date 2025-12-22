'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRootPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to /dashboard to avoid duplicate pages
        router.replace('/dashboard')
    }, [router])

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
    )
}
