"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, FileText, Building2, MapPin, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import type { Application } from "@/lib/types"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/applications")
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error("Error loading applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
    }
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
            <Link href="/applications" className="text-foreground font-medium">
              Applications
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            My Applications
          </h1>
          <p className="text-muted-foreground">Track the status of your internship applications.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            <span>Loading applications...</span>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{application.internship?.title}</CardTitle>
                        <CardDescription className="text-base">{application.internship?.company?.name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(application.status)} border`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-2">{application.internship?.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {application.internship?.skills_required.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {application.internship && application.internship.skills_required.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{application.internship.skills_required.length - 4} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {application.internship?.remote ? "Remote" : application.internship?.location || "Location TBD"}
                      </div>
                      {application.internship?.duration_months && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {application.internship.duration_months} months
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                    {application.internship?.stipend_amount && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ${application.internship.stipend_amount.toLocaleString()}/mo
                      </Badge>
                    )}
                  </div>

                  {application.cover_letter && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Cover Letter:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">{application.cover_letter}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/internships/${application.internship?.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start applying to internships to see your applications here.
              </p>
              <Link href="/internships">
                <Button>Browse Internships</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
