import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Supabase is not configured",
        users: [],
      })
    }

    const supabase = createServerSupabaseClient()
    
    // List users from Supabase Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        users: [],
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        phone: user.user_metadata?.phone,
        role: user.user_metadata?.role,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      })),
    })
  } catch (error) {
    console.error("[v0] List users error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to list users",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
