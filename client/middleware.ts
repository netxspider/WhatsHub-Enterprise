import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get token from cookies or header
    const authStorage = request.cookies.get('auth-storage')?.value

    let isAuthenticated = false
    if (authStorage) {
        try {
            const parsed = JSON.parse(authStorage)
            isAuthenticated = parsed.state?.isAuthenticated || !!parsed.state?.token
        } catch (e) {
            // Invalid storage, ignore
        }
    }

    // Redirect root to dashboard if authenticated, otherwise to login
    if (pathname === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*'],
}
