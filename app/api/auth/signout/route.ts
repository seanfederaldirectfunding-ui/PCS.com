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

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[API] Signout error:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log("[API] User signed out successfully")

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })
  } catch (error) {
    console.error("[API] Signout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sign out",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
