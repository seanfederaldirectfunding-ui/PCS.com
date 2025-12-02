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

    const { email, password, username, phone, role } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: "Email, password, and username are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone: phone || null,
          role: role || 'Tenant',
          tenantId: `tenant-${Date.now()}`,
        },
      },
    })

    if (authError) {
      console.error("[API] Signup error:", authError)
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      )
    }

    console.log("[API] User created successfully:", authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.user_metadata?.username,
        phone: authData.user.user_metadata?.phone,
        role: authData.user.user_metadata?.role,
      },
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("[API] Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create account",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
