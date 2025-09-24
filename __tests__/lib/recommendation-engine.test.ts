import { RecommendationEngine } from "@/lib/recommendation-engine"
import type { UserProfile, Internship } from "@/lib/types"

const mockProfile: UserProfile = {
  id: "1",
  user_id: "user-1",
  skills: ["JavaScript", "React", "Node.js"],
  interests: ["Web Development", "Fintech"],
  experience_level: "intermediate",
  preferred_location: "San Francisco, CA",
  resume_url: null,
  bio: null,
  github_url: null,
  linkedin_url: null,
  portfolio_url: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
}

const mockInternships: Internship[] = [
  {
    id: "1",
    company_id: "1",
    title: "Frontend Developer Intern",
    description: "Work on web development projects using React and JavaScript",
    requirements: ["Intermediate programming skills"],
    skills_required: ["JavaScript", "React", "CSS"],
    location: "San Francisco, CA",
    remote: false,
    duration_months: 3,
    stipend_amount: 4500,
    stipend_currency: "USD",
    application_deadline: "2025-03-15",
    start_date: "2025-06-01",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    company_id: "2",
    title: "Data Science Intern",
    description: "Analyze data using Python and machine learning",
    requirements: ["Python experience", "Statistics background"],
    skills_required: ["Python", "Machine Learning", "SQL"],
    location: "New York, NY",
    remote: true,
    duration_months: 4,
    stipend_amount: 5000,
    stipend_currency: "USD",
    application_deadline: "2025-03-15",
    start_date: "2025-06-01",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
]

describe("RecommendationEngine", () => {
  it("calculates recommendations correctly", () => {
    const recommendations = RecommendationEngine.calculateRecommendations(mockProfile, mockInternships)

    expect(recommendations).toHaveLength(2)
    expect(recommendations[0].match_score).toBeGreaterThan(recommendations[1].match_score)
  })

  it("filters out low-scoring matches", () => {
    const lowMatchInternship: Internship = {
      ...mockInternships[0],
      id: "3",
      skills_required: ["COBOL", "Fortran", "Assembly"],
      description: "Legacy system maintenance",
      location: "Remote Location",
    }

    const recommendations = RecommendationEngine.calculateRecommendations(mockProfile, [lowMatchInternship])

    // Should filter out very low matches
    expect(recommendations.length).toBeLessThanOrEqual(1)
  })

  it("prioritizes skill matches", () => {
    const recommendations = RecommendationEngine.calculateRecommendations(mockProfile, mockInternships)
    const frontendMatch = recommendations.find((r) => r.internship_id === "1")

    expect(frontendMatch).toBeDefined()
    expect(frontendMatch!.match_score).toBeGreaterThan(50)
  })
})
