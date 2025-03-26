import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Debugging: Log the request path
  console.log('Middleware triggered for path:', req.nextUrl.pathname)

  // Get admin session from cookies
  const adminSession = req.cookies.get('admin-session')?.value
  const admin = adminSession ? JSON.parse(adminSession) : null

  // Get user session from cookies
  const userSession = req.cookies.get('user-session')?.value
  const user = userSession ? JSON.parse(userSession) : null

  // Debugging: Log sessions
  console.log('Admin session:', admin)
  console.log('User session:', user)

  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup'
  const isAdminAuthPage = req.nextUrl.pathname === '/admin-login'
  const isProtectedPage = req.nextUrl.pathname.startsWith('/admin-dashboard')
  const isUserProtectedPage = req.nextUrl.pathname.startsWith('/customer-menu')

  // ✅ If there's no admin session & trying to access a protected admin page → redirect to admin login
  if (!adminSession && isProtectedPage) {
    console.log('Redirecting to admin login') // Debugging
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/admin-login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ If admin is logged in & trying to access admin auth pages → redirect to admin dashboard
  if (adminSession && isAdminAuthPage) {
    console.log('Redirecting to admin dashboard') // Debugging
    return NextResponse.redirect(new URL('/admin-dashboard', req.url))
  }

  // ✅ If there's no user session & no admin session & trying to access a user protected page → redirect to login
  if (!userSession && !adminSession && isUserProtectedPage) {
    console.log('Redirecting to login') // Debugging
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ If user is logged in & trying to access auth pages → redirect to customer menu
  if (userSession && isAuthPage) {
    console.log('Redirecting to customer menu') // Debugging
    return NextResponse.redirect(new URL('/customer-menu', req.url))
  }

  // ✅ If admin is logged in & trying to access auth pages → redirect to admin dashboard
  if (adminSession && isAuthPage) {
    console.log('Redirecting to admin dashboard') // Debugging
    return NextResponse.redirect(new URL('/admin-dashboard', req.url))
  }

  // ✅ If logged in & has a "redirectedFrom" param, send them there
  if ((userSession || adminSession) && req.nextUrl.searchParams.has('redirectedFrom')) {
    console.log('Redirecting to redirectedFrom path') // Debugging
    const redirectPath = req.nextUrl.searchParams.get('redirectedFrom') || '/customer-menu'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}