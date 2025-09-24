export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  skills: string[]
  interests: string[]
  experience_level: "beginner" | "intermediate" | "advanced"
  preferred_location?: string
  resume_url?: string
  bio?: string
  github_url?: string
  linkedin_url?: string
  portfolio_url?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  logo_url?: string
  industry?: string
  size: "startup" | "small" | "medium" | "large" | "enterprise"
  location?: string
  created_at: string
  updated_at: string
}

export interface Internship {
  id: string
  company_id: string
  company?: Company
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  location?: string
  remote: boolean
  duration_months?: number
  stipend_amount?: number
  stipend_currency: string
  application_deadline?: string
  start_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  internship_id: string
  internship?: Internship
  status: "pending" | "reviewed" | "accepted" | "rejected"
  cover_letter?: string
  applied_at: string
  updated_at: string
}

export interface UserRecommendation {
  id: string
  user_id: string
  internship_id: string
  internship?: Internship
  match_score: number
  reasoning?: string
  created_at: string
}
