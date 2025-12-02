import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      )
    }

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error("[API] Get session error:", error)
      return NextResponse.json(
        { success: false, error: error.message, authenticated: false },
        { status: 401 }
      )
    }

    if (!session) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: "Not authenticated",
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username,
        role: session.user.user_metadata?.role,
        tenantId: session.user.user_metadata?.tenantId,
      },
    })
  } catch (error) {
    console.error("[API] Get session error:", error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Failed to get session",
      },
      { status: 500 }
    )
  }
}
