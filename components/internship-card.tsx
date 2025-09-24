import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Clock, Star } from "lucide-react"
import type { Internship } from "@/lib/types"
import Link from "next/link"

interface InternshipCardProps {
  internship: Internship
  matchScore?: number
  showMatchScore?: boolean
}

const gradientClasses = ["gradient-emerald", "gradient-blue", "gradient-orange", "gradient-pink", "gradient-teal"]

export function InternshipCard({ internship, matchScore, showMatchScore = false }: InternshipCardProps) {
  const gradientClass = gradientClasses[Math.floor(Math.random() * gradientClasses.length)]

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <div className={`${gradientClass} h-2`}></div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${gradientClass} rounded-xl flex items-center justify-center`}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg line-clamp-1">{internship.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{internship.company?.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {internship.stipend_amount && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ${internship.stipend_amount.toLocaleString()}/mo
              </Badge>
            )}
            {showMatchScore && matchScore && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="font-medium">{matchScore}% match</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{internship.description}</p>
        <div className="flex flex-wrap gap-2">
          {internship.skills_required.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {internship.skills_required.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{internship.skills_required.length - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {internship.remote ? "Remote" : internship.location || "Location TBD"}
            </div>
            {internship.duration_months && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {internship.duration_months} months
              </div>
            )}
          </div>
        </div>
        <Link href={`/internships/${internship.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
