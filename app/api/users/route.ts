import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get users from public.users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("[API] Error fetching users:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    })
  } catch (error) {
    console.error("[API] Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
