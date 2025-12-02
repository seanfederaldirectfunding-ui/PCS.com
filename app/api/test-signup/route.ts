import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Supabase is not configured. Check your .env.local file.",
        supabaseConnected: false,
      })
    }

    // Test Supabase auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          test: true,
        },
      },
    })

    if (error) {
      console.error("[v0] Test signup error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        supabaseConnected: true,
        errorDetails: error,
      })
    }

    return NextResponse.json({
      success: true,
      message: "✅ Test user created successfully in Supabase!",
      userId: data.user?.id,
      email: data.user?.email,
      username: data.user?.user_metadata?.username,
      supabaseConnected: true,
      note: "Check your Supabase dashboard at: https://app.supabase.com/project/slamsitgnvioymrykroo/auth/users",
    })
  } catch (error) {
    console.error("[v0] Test signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test Supabase signup",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST to test Supabase user creation",
    example: {
      email: "test@example.com",
      password: "testpassword123",
    },
  })
}
