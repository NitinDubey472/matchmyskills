import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skills = searchParams.get("skills")?.split(",") || []
    const location = searchParams.get("location") || ""
    const remote = searchParams.get("remote")

    let query = supabase
      .from("internships")
      .select(`
        *,
        company:companies(*)
      `)
      .eq("is_active", true)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (skills.length > 0) {
      query = query.overlaps("skills_required", skills)
    }

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }

    if (remote === "true") {
      query = query.eq("remote", true)
    } else if (remote === "false") {
      query = query.eq("remote", false)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: internships, error, count } = await query.range(from, to).order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      internships,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
