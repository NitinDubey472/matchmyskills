"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface ResumeUploadProps {
  currentResumeUrl?: string
  onUploadSuccess?: (data: any) => void
}

export function ResumeUpload({ currentResumeUrl, onUploadSuccess }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [parsedData, setParsedData] = useState<{
    skills: string[]
    experience: string[]
    education: string[]
  } | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)
      setUploadStatus({ type: null, message: "" })

      try {
        const formData = new FormData()
        formData.append("resume", file)

        const response = await fetch("/api/upload/resume", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          setUploadStatus({
            type: "success",
            message: "Resume uploaded successfully!",
          })
          setParsedData(data.parsed_data)
          onUploadSuccess?.(data)
        } else {
          setUploadStatus({
            type: "error",
            message: data.error || "Failed to upload resume",
          })
        }
      } catch (error) {
        setUploadStatus({
          type: "error",
          message: "An error occurred while uploading",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadSuccess],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Upload
          </CardTitle>
          <CardDescription>
            Upload your resume to automatically extract skills and experience for better matching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentResumeUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Resume uploaded</p>
                    <p className="text-sm text-green-600">Your resume is ready for matching</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(currentResumeUrl, "_blank")}>
                  View
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Upload a new resume to replace the current one.</p>
            </div>
          ) : null}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">{isDragActive ? "Drop your resume here" : "Upload your resume"}</p>
                <p className="text-sm text-muted-foreground">Drag and drop your resume, or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX files up to 5MB</p>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-sm">Uploading and parsing resume...</span>
            </div>
          )}

          {uploadStatus.type && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                uploadStatus.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm ${uploadStatus.type === "success" ? "text-green-700" : "text-red-700"}`}>
                {uploadStatus.message}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
            <CardDescription>
              We found the following information in your resume. You can add these to your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Skills Found:</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedData.experience.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Experience Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.experience.map((exp) => (
                    <Badge key={exp} variant="outline">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedData.education.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Education Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.education.map((edu) => (
                    <Badge key={edu} variant="outline">
                      {edu}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                // In a real implementation, this would auto-populate the profile form
                alert("Skills and information would be automatically added to your profile!")
              }}
              className="w-full"
            >
              Add to Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
