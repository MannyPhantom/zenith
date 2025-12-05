import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChevronDown } from "lucide-react"
import { useState } from "react"

interface Activity {
  id: string
  title: string
  projectName: string
  projectId: string
  status: "in-progress" | "done" | "pending"
  time: string
  color: string
}

interface RecentActivityWidgetProps {
  activities: Activity[]
  maxVisible?: number
  className?: string
}

export function RecentActivityWidget({ 
  activities, 
  maxVisible = 5,
  className = "" 
}: RecentActivityWidgetProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleActivities = showAll ? activities : activities.slice(0, maxVisible)
  const hasMore = activities.length > maxVisible

  const getStatusBadge = (status: Activity["status"]) => {
    const variants = {
      "in-progress": "default",
      "done": "secondary",
      "pending": "outline"
    } as const

    const labels = {
      "in-progress": "In Progress",
      "done": "Done",
      "pending": "Pending"
    }

    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {labels[status]}
      </Badge>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <p className="text-xs text-muted-foreground">Latest updates across your projects</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.projectName}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show More (${activities.length - maxVisible} more)`}
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}







