import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Always allow auth pages through — never redirect them
  const isAuthPage =
    path === '/login' ||
    path === '/signup' ||
    path.startsWith('/auth')

  // Pass through static assets immediately
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Unauthenticated users trying to access app pages → send to login
    if (!user && !isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Authenticated users visiting auth pages → send to app
    if (user && isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/projects'
      return NextResponse.redirect(url)
    }
  } catch {
    // If Supabase is unavailable (e.g. missing env vars), allow auth pages through
    // and redirect everything else to login
    if (!isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

