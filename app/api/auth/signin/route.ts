import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("[API] Signin error:", authError)
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { success: false, error: "Failed to sign in" },
        { status: 500 }
      )
    }

    console.log("[API] User signed in successfully:", authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.user_metadata?.username || email.split('@')[0],
        role: authData.user.user_metadata?.role || 'Tenant',
        tenantId: authData.user.user_metadata?.tenantId,
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
    })
  } catch (error) {
    console.error("[API] Signin error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sign in",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
