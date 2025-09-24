import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InternshipCard } from "@/components/internship-card"
import { Target, Users, FileText, Star, TrendingUp, Briefcase } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  // Get user's applications
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      internship:internships(
        *,
        company:companies(*)
      )
    `)
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false })
    .limit(5)

  // Get recommendations
  const { data: recommendations } = await supabase
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
    .limit(6)

  const stats = {
    applications: applications?.length || 0,
    recommendations: recommendations?.length || 0,
    profileComplete: profile ? 85 : 0,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MatchMySkills</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-foreground font-medium">
              Dashboard
            </Link>
            <Link href="/internships" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
              Applications
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's your personalized dashboard with recommendations and application updates.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">Active applications</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recommendations}</div>
              <p className="text-xs text-muted-foreground">Personalized matches</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileComplete}%</div>
              <p className="text-xs text-muted-foreground">Profile complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Alert */}
        {!profile && (
          <Card className="border-orange-200 bg-orange-50 mb-8">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Complete your profile to get personalized internship recommendations based on your skills and interests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="bg-orange-600 hover:bg-orange-700">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recommendations Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Recommended for You</h2>
                <p className="text-muted-foreground">Internships that match your skills and interests</p>
              </div>
              {profile && (
                <form action="/api/recommendations" method="POST">
                  <Button type="submit" variant="outline" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </form>
              )}
            </div>

            {recommendations && recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <InternshipCard
                    key={rec.id}
                    internship={rec.internship}
                    matchScore={rec.match_score}
                    showMatchScore={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {profile
                      ? "We're generating personalized recommendations for you. Check back soon!"
                      : "Complete your profile to get personalized internship recommendations."}
                  </p>
                  {!profile ? (
                    <Link href="/profile">
                      <Button>Complete Profile</Button>
                    </Link>
                  ) : (
                    <form action="/api/recommendations" method="POST">
                      <Button type="submit">Generate Recommendations</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{app.internship?.title}</p>
                          <p className="text-xs text-muted-foreground">{app.internship?.company?.name}</p>
                        </div>
                        <Badge
                          variant={
                            app.status === "accepted"
                              ? "default"
                              : app.status === "rejected"
                                ? "destructive"
                                : app.status === "reviewed"
                                  ? "secondary"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                    <Link href="/applications">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View All Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                    <Link href="/internships">
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        Browse Internships
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/internships">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Internships
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Track Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
