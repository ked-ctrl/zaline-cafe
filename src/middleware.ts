import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH, ROUTES } from "@/config/constants"

/**
 * Authentication middleware
 * Handles route protection and redirects based on user authentication status
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Get sessions from cookies
  const adminSession = req.cookies.get(AUTH.COOKIES.ADMIN_SESSION)?.value
  const userSession = req.cookies.get(AUTH.COOKIES.USER_SESSION)?.value
  
  // Parse session data
  const admin = adminSession ? JSON.parse(adminSession) : null
  const user = userSession ? JSON.parse(userSession) : null

  // Define page types
  const isAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].includes(req.nextUrl.pathname)
  const isAdminAuthPage = req.nextUrl.pathname === ROUTES.ADMIN_LOGIN
  const isProtectedPage = req.nextUrl.pathname.startsWith(ROUTES.ADMIN_DASHBOARD)
  const isUserProtectedPage = req.nextUrl.pathname.startsWith(ROUTES.CUSTOMER_MENU)

  // Handle admin routes
  if (!adminSession && isProtectedPage) {
    // Redirect to admin login if trying to access protected admin pages without admin session
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = ROUTES.ADMIN_LOGIN
    redirectUrl.searchParams.set(AUTH.REDIRECT_QUERY_PARAM, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (adminSession && isAdminAuthPage) {
    // Redirect to admin dashboard if admin is already logged in
    return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, req.url))
  }

  // Handle user routes
  if (!userSession && !adminSession && isUserProtectedPage) {
    // Redirect to login if trying to access user protected pages without any session
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = ROUTES.LOGIN
    redirectUrl.searchParams.set(AUTH.REDIRECT_QUERY_PARAM, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (userSession && isAuthPage) {
    // Redirect to customer menu if user is already logged in
    return NextResponse.redirect(new URL(ROUTES.CUSTOMER_MENU, req.url))
  }

  if (adminSession && isAuthPage) {
    // Redirect to admin dashboard if admin is trying to access auth pages
    return NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, req.url))
  }

  // Handle redirects from login
  if ((userSession || adminSession) && req.nextUrl.searchParams.has(AUTH.REDIRECT_QUERY_PARAM)) {
    const redirectPath = req.nextUrl.searchParams.get(AUTH.REDIRECT_QUERY_PARAM) || ROUTES.CUSTOMER_MENU
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
