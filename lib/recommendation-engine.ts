import type { UserProfile, Internship } from "./types"

export interface RecommendationResult {
  user_id: string
  internship_id: string
  match_score: number
  reasoning: string
}

export class RecommendationEngine {
  static calculateRecommendations(profile: UserProfile, internships: Internship[]): RecommendationResult[] {
    const recommendations: RecommendationResult[] = []

    for (const internship of internships) {
      const score = this.calculateMatchScore(profile, internship)
      const reasoning = this.generateReasoning(profile, internship, score)

      // Only include recommendations with score > 30%
      if (score.total > 0.3) {
        recommendations.push({
          user_id: profile.user_id,
          internship_id: internship.id,
          match_score: Math.round(score.total * 100),
          reasoning: reasoning.join(", ") || "Good overall match",
        })
      }
    }

    return recommendations.sort((a, b) => b.match_score - a.match_score)
  }

  private static calculateMatchScore(profile: UserProfile, internship: Internship) {
    const weights = {
      skills: 0.4,
      experience: 0.2,
      location: 0.2,
      interests: 0.2,
    }

    const skillsScore = this.calculateSkillsMatch(profile.skills || [], internship.skills_required || [])
    const experienceScore = this.calculateExperienceMatch(profile.experience_level, internship.requirements || [])
    const locationScore = this.calculateLocationMatch(
      profile.preferred_location,
      internship.location,
      internship.remote,
    )
    const interestsScore = this.calculateInterestsMatch(
      profile.interests || [],
      internship.description,
      internship.title,
    )

    const total =
      skillsScore * weights.skills +
      experienceScore * weights.experience +
      locationScore * weights.location +
      interestsScore * weights.interests

    return {
      total,
      skills: skillsScore,
      experience: experienceScore,
      location: locationScore,
      interests: interestsScore,
    }
  }

  private static calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5

    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase())
    const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase())

    const matches = normalizedRequiredSkills.filter((skill) =>
      normalizedUserSkills.some(
        (userSkill) =>
          userSkill.includes(skill) || skill.includes(userSkill) || this.areSkillsSimilar(userSkill, skill),
      ),
    )

    return matches.length / normalizedRequiredSkills.length
  }

  private static areSkillsSimilar(skill1: string, skill2: string): boolean {
    const synonyms = {
      javascript: ["js", "node.js", "nodejs"],
      typescript: ["ts"],
      python: ["py"],
      "machine learning": ["ml", "ai", "artificial intelligence"],
      "user interface": ["ui", "frontend"],
      "user experience": ["ux", "design"],
      database: ["sql", "postgresql", "mysql"],
      "web development": ["frontend", "backend", "fullstack"],
    }

    for (const [key, values] of Object.entries(synonyms)) {
      if ((key === skill1 && values.includes(skill2)) || (key === skill2 && values.includes(skill1))) {
        return true
      }
    }

    return false
  }

  private static calculateExperienceMatch(userLevel: string, requirements: string[]): number {
    if (!userLevel) return 0.5

    const requirementsText = requirements.join(" ").toLowerCase()
    const level = userLevel.toLowerCase()

    // Perfect matches
    if (
      level === "beginner" &&
      (requirementsText.includes("entry") ||
        requirementsText.includes("beginner") ||
        requirementsText.includes("no experience"))
    ) {
      return 1.0
    }
    if (
      level === "intermediate" &&
      (requirementsText.includes("intermediate") || requirementsText.includes("some experience"))
    ) {
      return 1.0
    }
    if (
      level === "advanced" &&
      (requirementsText.includes("advanced") ||
        requirementsText.includes("senior") ||
        requirementsText.includes("experienced"))
    ) {
      return 1.0
    }

    // Partial matches - advanced users can do intermediate/beginner work
    if (level === "advanced" && (requirementsText.includes("intermediate") || requirementsText.includes("beginner"))) {
      return 0.8
    }
    if (level === "intermediate" && requirementsText.includes("beginner")) {
      return 0.8
    }

    return 0.6 // Default moderate match
  }

  private static calculateLocationMatch(userLocation: string, internshipLocation: string, isRemote: boolean): number {
    if (isRemote) return 1.0
    if (!userLocation || !internshipLocation) return 0.5

    const userLoc = userLocation.toLowerCase()
    const internLoc = internshipLocation.toLowerCase()

    // Exact match
    if (userLoc === internLoc) return 1.0

    // City/state matches
    if (userLoc.includes(internLoc) || internLoc.includes(userLoc)) return 0.8

    // Same state (rough approximation)
    const userState = this.extractState(userLoc)
    const internState = this.extractState(internLoc)
    if (userState && internState && userState === internState) return 0.6

    // Remote preference
    if (userLoc.includes("remote")) return isRemote ? 1.0 : 0.3

    return 0.3
  }

  private static extractState(location: string): string | null {
    const stateAbbreviations = [
      "ca",
      "ny",
      "tx",
      "fl",
      "wa",
      "ma",
      "il",
      "pa",
      "oh",
      "ga",
      "nc",
      "mi",
      "nj",
      "va",
      "tn",
      "in",
      "az",
      "mo",
      "md",
      "wi",
      "mn",
      "co",
      "al",
      "sc",
      "la",
      "ky",
      "or",
      "ok",
      "ct",
      "ia",
      "ms",
      "ar",
      "ks",
      "ut",
      "nv",
      "nm",
      "ne",
      "wv",
      "id",
      "hi",
      "nh",
      "me",
      "ri",
      "mt",
      "de",
      "sd",
      "nd",
      "ak",
      "vt",
      "wy",
    ]

    for (const state of stateAbbreviations) {
      if (location.includes(state)) return state
    }

    return null
  }

  private static calculateInterestsMatch(userInterests: string[], description: string, title: string): number {
    if (userInterests.length === 0) return 0.5

    const content = (description + " " + title).toLowerCase()
    const matches = userInterests.filter((interest) => {
      const normalizedInterest = interest.toLowerCase()
      return content.includes(normalizedInterest) || this.isInterestRelated(normalizedInterest, content)
    })

    return matches.length / userInterests.length
  }

  private static isInterestRelated(interest: string, content: string): boolean {
    const relatedTerms = {
      "artificial intelligence": ["ai", "machine learning", "ml", "neural", "deep learning"],
      "web development": ["frontend", "backend", "fullstack", "web", "javascript", "react"],
      "mobile development": ["mobile", "ios", "android", "app", "react native"],
      "data science": ["data", "analytics", "statistics", "python", "sql"],
      fintech: ["finance", "banking", "payment", "trading", "financial"],
      "healthcare tech": ["health", "medical", "patient", "clinical"],
      cybersecurity: ["security", "cyber", "encryption", "privacy"],
    }

    const terms = relatedTerms[interest as keyof typeof relatedTerms]
    if (terms) {
      return terms.some((term) => content.includes(term))
    }

    return false
  }

  private static generateReasoning(profile: UserProfile, internship: Internship, scores: any): string[] {
    const reasoning: string[] = []

    if (scores.skills > 0.7) {
      reasoning.push(`Excellent skills match (${Math.round(scores.skills * 100)}%)`)
    } else if (scores.skills > 0.5) {
      reasoning.push(`Good skills match (${Math.round(scores.skills * 100)}%)`)
    }

    if (scores.experience > 0.8) {
      reasoning.push("Perfect experience level fit")
    } else if (scores.experience > 0.6) {
      reasoning.push("Experience level aligns well")
    }

    if (scores.location > 0.8) {
      reasoning.push("Great location match")
    } else if (internship.remote) {
      reasoning.push("Remote work available")
    }

    if (scores.interests > 0.6) {
      reasoning.push("Aligns with your interests")
    }

    if (internship.stipend_amount && internship.stipend_amount >= 4000) {
      reasoning.push("Competitive compensation")
    }

    return reasoning
  }
}
