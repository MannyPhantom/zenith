# Project Management Widgets

Modular, reusable widget components for the Project Management dashboard.

## Quick Start

```tsx
import {
  TotalProjectsWidget,
  UpcomingDeadlinesWidget,
  TeamMembersWidget,
  WidgetGrid
} from '@/components/projects/widgets'

function Dashboard() {
  return (
    <WidgetGrid columns={{ md: 2, lg: 3 }} gap={4}>
      <TotalProjectsWidget totalProjects={12} activeProjects={8} />
      <UpcomingDeadlinesWidget count={5} />
      <TeamMembersWidget count={24} />
    </WidgetGrid>
  )
}
```

## Available Widgets

### Metric Widgets
- `TotalProjectsWidget` - Total and active project counts
- `UpcomingDeadlinesWidget` - Upcoming deadline count
- `TeamMembersWidget` - Team member count
- `ActiveProjectsWidget` - Active projects display
- `PortfolioHealthWidget` - Portfolio health metric
- `BudgetUtilizationWidget` - Budget utilization
- `TeamUtilizationWidget` - Team utilization metric
- `OnTimeDeliveryWidget` - On-time delivery metric

### Display Widgets
- `ProjectCardWidget` - Project card display
- `RecentActivityWidget` - Activity feed

### Layout Components
- `WidgetGrid` - Responsive grid container
- `WidgetContainer` - Widget wrapper with spanning

## Documentation

- **Quick Reference**: `PROJECT_MANAGEMENT_WIDGETS.md` (root)
- **Detailed Guide**: `WIDGET_CUSTOMIZATION_GUIDE.md` (root)
- **Summary**: `WIDGET_REFACTORING_SUMMARY.md` (root)

## Features

✅ Fully typed with TypeScript  
✅ Responsive design  
✅ Dark mode support  
✅ Customizable with className prop  
✅ Consistent API across all widgets  
✅ Zero linting errors  

## Example Layout

```tsx
<WidgetGrid columns={{ md: 2, lg: 5 }} gap={4}>
  <ActiveProjectsWidget activeProjects={8} totalProjects={12} />
  <PortfolioHealthWidget healthPercentage={85} />
  <BudgetUtilizationWidget totalSpent={65000} totalBudget={100000} />
  <TeamUtilizationWidget utilizationPercentage={78} />
  <OnTimeDeliveryWidget percentage={92} trend={{ value: 5, label: "vs last month" }} />
</WidgetGrid>
```

## Creating Custom Widgets

Follow the pattern in existing widgets:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MyWidgetProps {
  data: string
  className?: string
}

export function MyWidget({ data, className = "" }: MyWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>My Widget</CardTitle>
      </CardHeader>
      <CardContent>
        <div>{data}</div>
      </CardContent>
    </Card>
  )
}
```

Then export from `index.ts` and use it!



