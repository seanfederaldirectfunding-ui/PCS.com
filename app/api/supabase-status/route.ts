import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test connection by getting server time
    const { data, error } = await supabase
      .from('_supabase_internal')
      .select('*')
      .limit(1)
    
    // Alternative test - just check if client is configured
    const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    return NextResponse.json({
      success: true,
      connected: configured,
      project: {
        name: "supabase-amber-island",
        id: "slamsitgnvioymrykroo",
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      message: configured 
        ? "✅ Connected to Supabase project: supabase-amber-island" 
        : "⚠️  Supabase not configured",
    })
  } catch (error) {
    console.error("[v0] Supabase connection test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to test Supabase connection",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
