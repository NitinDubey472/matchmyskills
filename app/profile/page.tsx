"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ResumeUpload } from "@/components/resume-upload"
import { Target, Plus, X, Save, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const COMMON_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "Java",
  "C++",
  "SQL",
  "HTML",
  "CSS",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Mobile Development",
  "Cloud Computing",
  "DevOps",
  "API Development",
  "Database Design",
  "Git",
  "Docker",
  "AWS",
  "Figma",
  "Photoshop",
]

const COMMON_INTERESTS = [
  "Artificial Intelligence",
  "Web Development",
  "Mobile Apps",
  "Data Science",
  "Cybersecurity",
  "Fintech",
  "Healthcare Tech",
  "E-commerce",
  "Gaming",
  "Social Media",
  "EdTech",
  "CleanTech",
  "Blockchain",
  "IoT",
  "Robotics",
  "AR/VR",
  "Cloud Computing",
  "DevOps",
  "UI/UX Design",
]

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    skills: [] as string[],
    interests: [] as string[],
    experience_level: "",
    preferred_location: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
  })
  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setMessage("Profile saved successfully!")
        // Generate recommendations after profile update
        await fetch("/api/recommendations", { method: "POST" })
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        const data = await response.json()
        setMessage(data.error || "Error saving profile")
      }
    } catch (error) {
      setMessage("Error saving profile")
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addInterest = (interest: string) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleResumeUploadSuccess = (data: any) => {
    if (data.parsed_data) {
      // Auto-populate skills from parsed resume
      const newSkills = data.parsed_data.skills.filter((skill: string) => !profile.skills.includes(skill))

      if (newSkills.length > 0) {
        setProfile((prev) => ({
          ...prev,
          skills: [...prev.skills, ...newSkills],
          resume_url: data.resume_url,
        }))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MatchMySkills</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/internships" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
              Applications
            </Link>
            <Link href="/profile" className="text-foreground font-medium">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <User className="w-8 h-8" />
            Your Profile
          </h1>
          <p className="text-muted-foreground">Complete your profile to get personalized internship recommendations.</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Resume Upload Section */}
          <ResumeUpload currentResumeUrl={profile.resume_url} onUploadSuccess={handleResumeUploadSuccess} />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add your technical and soft skills to help us match you with relevant internships.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill(newSkill)}
                  />
                  <Button onClick={() => addSkill(newSkill)} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Popular Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.filter((skill) => !profile.skills.includes(skill))
                      .slice(0, 8)
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} className="flex items-center gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>What areas of technology and industries interest you most?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addInterest(newInterest)}
                  />
                  <Button onClick={() => addInterest(newInterest)} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Popular Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INTERESTS.filter((interest) => !profile.interests.includes(interest))
                      .slice(0, 8)
                      .map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addInterest(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} className="flex items-center gap-1">
                        {interest}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience & Location */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Experience & Location</CardTitle>
                <CardDescription>Help us understand your experience level and location preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={profile.experience_level}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, experience_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={profile.preferred_location}
                    onChange={(e) => setProfile((prev) => ({ ...prev, preferred_location: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bio & Links */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>About & Links</CardTitle>
                <CardDescription>Tell us about yourself and share your professional profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your goals, and what you're passionate about..."
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/yourusername"
                    value={profile.github_url}
                    onChange={(e) => setProfile((prev) => ({ ...prev, github_url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile((prev) => ({ ...prev, linkedin_url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    placeholder="https://yourportfolio.com"
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile((prev) => ({ ...prev, portfolio_url: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
