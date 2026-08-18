import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = searchParams.get('role') || user?.user_metadata?.role

      let redirectUrl = next
      const isCreator = role === 'creator'
      const isSeller = role === 'seller'
      const isRental = role === 'rental'
      const isServicePro = role === 'service_pro'

      if (isCreator || isSeller || isRental || isServicePro) {
        const metadata = user?.user_metadata || {}
        let hasDetails = false
        
        if (isCreator) {
          hasDetails = !!(metadata.social_handle && metadata.social_platform && metadata.followers)
        } else if (isSeller) {
          hasDetails = !!(metadata.phone && metadata.city)
        } else if (isRental) {
          hasDetails = !!(metadata.phone && metadata.city && metadata.business_name)
        } else if (isServicePro) {
          hasDetails = !!(metadata.phone && metadata.city && metadata.business_name && metadata.service_types)
        }

        if (!hasDetails) {
          let redirectNext = next
          if (next === '/dashboard') {
            if (isCreator) redirectNext = '/dashboard/creator'
            else if (isSeller) redirectNext = '/seller'
            else if (isRental) redirectNext = '/rent'
            else if (isServicePro) redirectNext = '/services'
          }
          redirectUrl = `/auth/creator-setup?next=${encodeURIComponent(redirectNext)}`
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // Hello, Vercel
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that origin is localhost
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
