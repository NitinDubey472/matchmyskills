import { render, screen } from "@testing-library/react"
import { InternshipCard } from "@/components/internship-card"
import type { Internship } from "@/lib/types"

const mockInternship: Internship = {
  id: "1",
  company_id: "1",
  title: "Software Engineering Intern",
  description: "Join our engineering team to work on cutting-edge projects.",
  requirements: ["Computer Science degree", "Programming experience"],
  skills_required: ["JavaScript", "React", "Node.js"],
  location: "San Francisco, CA",
  remote: false,
  duration_months: 3,
  stipend_amount: 5000,
  stipend_currency: "USD",
  application_deadline: "2025-03-15",
  start_date: "2025-06-01",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  company: {
    id: "1",
    name: "TechCorp",
    description: "Leading technology company",
    website: "https://techcorp.com",
    logo_url: null,
    industry: "Technology",
    size: "large",
    location: "San Francisco, CA",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
}

describe("InternshipCard", () => {
  it("renders internship information correctly", () => {
    render(<InternshipCard internship={mockInternship} />)

    expect(screen.getByText("Software Engineering Intern")).toBeInTheDocument()
    expect(screen.getByText("TechCorp")).toBeInTheDocument()
    expect(screen.getByText("$5,000/mo")).toBeInTheDocument()
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument()
    expect(screen.getByText("3 months")).toBeInTheDocument()
    expect(screen.getByText("JavaScript")).toBeInTheDocument()
    expect(screen.getByText("React")).toBeInTheDocument()
    expect(screen.getByText("Node.js")).toBeInTheDocument()
  })

  it("shows match score when provided", () => {
    render(<InternshipCard internship={mockInternship} matchScore={85} showMatchScore={true} />)

    expect(screen.getByText("85% match")).toBeInTheDocument()
  })

  it("shows remote badge for remote internships", () => {
    const remoteInternship = { ...mockInternship, remote: true }
    render(<InternshipCard internship={remoteInternship} />)

    expect(screen.getByText("Remote")).toBeInTheDocument()
  })
})
