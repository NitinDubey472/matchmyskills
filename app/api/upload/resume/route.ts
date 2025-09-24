import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("resume") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or Word document." }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Please upload a file smaller than 5MB." }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${user.id}/resume_${Date.now()}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("resumes").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(fileName)

    // Update user profile with resume URL
    const { error: updateError } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      resume_url: publicUrl,
    })

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Parse resume content (basic text extraction)
    const resumeText = await extractTextFromFile(file)
    const parsedData = parseResumeText(resumeText)

    return NextResponse.json({
      message: "Resume uploaded successfully",
      resume_url: publicUrl,
      parsed_data: parsedData,
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    // For PDF files, we would typically use a library like pdf-parse
    // For Word files, we would use mammoth or similar
    // For this demo, we'll simulate text extraction

    if (file.type === "application/pdf") {
      // In a real implementation, you would use pdf-parse or similar
      return "Sample extracted text from PDF resume..."
    } else if (file.type.includes("word")) {
      // In a real implementation, you would use mammoth or similar
      return "Sample extracted text from Word resume..."
    }

    return ""
  } catch (error) {
    console.error("Text extraction error:", error)
    return ""
  }
}

function parseResumeText(text: string): {
  skills: string[]
  experience: string[]
  education: string[]
} {
  // Basic resume parsing logic
  // In a real implementation, you would use more sophisticated NLP

  const commonSkills = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "TypeScript",
    "SQL",
    "HTML",
    "CSS",
    "Git",
    "Docker",
    "AWS",
    "Machine Learning",
    "Data Analysis",
    "UI/UX",
    "Mobile Development",
    "API Development",
  ]

  const foundSkills = commonSkills.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))

  // Extract experience (simplified)
  const experienceKeywords = ["intern", "developer", "engineer", "analyst", "designer"]
  const experience = experienceKeywords.filter((keyword) => text.toLowerCase().includes(keyword))

  // Extract education (simplified)
  const educationKeywords = ["university", "college", "bachelor", "master", "degree"]
  const education = educationKeywords.filter((keyword) => text.toLowerCase().includes(keyword))

  return {
    skills: foundSkills,
    experience,
    education,
  }
}
