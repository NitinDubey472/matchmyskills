import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: recommendations, error } = await supabase
      .from("user_recommendations")
      .select(`
        *,
        internship:internships(
          *,
          company:companies(*)
        )
      `)
      .eq("user_id", user.id)
      .order("match_score", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found. Please complete your profile first." },
        { status: 400 },
      )
    }

    // Get all active internships
    const { data: internships, error: internshipsError } = await supabase
      .from("internships")
      .select("*")
      .eq("is_active", true)

    if (internshipsError) {
      return NextResponse.json({ error: internshipsError.message }, { status: 400 })
    }

    // Calculate recommendations using the recommendation engine
    const recommendations = await calculateRecommendations(profile, internships)

    // Clear existing recommendations for this user
    await supabase.from("user_recommendations").delete().eq("user_id", user.id)

    // Insert new recommendations
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase.from("user_recommendations").insert(recommendations)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      message: "Recommendations generated successfully",
      count: recommendations.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Recommendation engine logic
async function calculateRecommendations(profile: any, internships: any[]) {
  const recommendations = []

  for (const internship of internships) {
    let score = 0
    const reasoning = []

    // Skills matching (40% weight)
    const skillsMatch = calculateSkillsMatch(profile.skills || [], internship.skills_required || [])
    score += skillsMatch * 0.4
    if (skillsMatch > 0.5) {
      reasoning.push(`Strong skills match (${Math.round(skillsMatch * 100)}%)`)
    }

    // Experience level matching (20% weight)
    const experienceMatch = calculateExperienceMatch(profile.experience_level, internship.requirements || [])
    score += experienceMatch * 0.2
    if (experienceMatch > 0.5) {
      reasoning.push("Experience level aligns well")
    }

    // Location preference (20% weight)
    const locationMatch = calculateLocationMatch(profile.preferred_location, internship.location, internship.remote)
    score += locationMatch * 0.2
    if (locationMatch > 0.7) {
      reasoning.push("Great location match")
    }

    // Interest alignment (20% weight)
    const interestMatch = calculateInterestMatch(profile.interests || [], internship.description, internship.title)
    score += interestMatch * 0.2
    if (interestMatch > 0.5) {
      reasoning.push("Aligns with your interests")
    }

    // Only include recommendations with score > 30%
    if (score > 0.3) {
      recommendations.push({
        user_id: profile.user_id,
        internship_id: internship.id,
        match_score: Math.round(score * 100),
        reasoning: reasoning.join(", ") || "Good overall match",
      })
    }
  }

  return recommendations.sort((a, b) => b.match_score - a.match_score)
}

function calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0.5

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase())
  const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase())

  const matches = normalizedRequiredSkills.filter((skill) =>
    normalizedUserSkills.some((userSkill) => userSkill.includes(skill) || skill.includes(userSkill)),
  )

  return matches.length / normalizedRequiredSkills.length
}

function calculateExperienceMatch(userLevel: string, requirements: string[]): number {
  if (!userLevel) return 0.5

  const requirementsText = requirements.join(" ").toLowerCase()
  const level = userLevel.toLowerCase()

  if (level === "beginner" && (requirementsText.includes("entry") || requirementsText.includes("beginner"))) {
    return 1.0
  } else if (
    level === "intermediate" &&
    (requirementsText.includes("intermediate") || requirementsText.includes("some experience"))
  ) {
    return 1.0
  } else if (level === "advanced" && (requirementsText.includes("advanced") || requirementsText.includes("senior"))) {
    return 1.0
  }

  return 0.6 // Default moderate match
}

function calculateLocationMatch(userLocation: string, internshipLocation: string, isRemote: boolean): number {
  if (isRemote) return 1.0
  if (!userLocation || !internshipLocation) return 0.5

  const userLoc = userLocation.toLowerCase()
  const internLoc = internshipLocation.toLowerCase()

  if (userLoc === internLoc) return 1.0
  if (userLoc.includes(internLoc) || internLoc.includes(userLoc)) return 0.8

  return 0.3
}

function calculateInterestMatch(userInterests: string[], description: string, title: string): number {
  if (userInterests.length === 0) return 0.5

  const content = (description + " " + title).toLowerCase()
  const matches = userInterests.filter((interest) => content.includes(interest.toLowerCase()))

  return matches.length / userInterests.length
}
