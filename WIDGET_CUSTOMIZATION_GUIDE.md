# Widget Customization Guide

## Overview

The Project Management dashboard has been refactored to use a widget-based architecture, allowing for better customization, reusability, and easier maintenance. All metric tiles and data displays are now modular widgets that can be easily rearranged, styled, or extended.

## Available Widgets

### 1. TotalProjectsWidget
Displays the total number of projects and how many are active.

```tsx
import { TotalProjectsWidget } from '@/components/projects/widgets'

<TotalProjectsWidget 
  totalProjects={12}
  activeProjects={8}
  className="custom-class" // optional
/>
```

### 2. UpcomingDeadlinesWidget
Shows the count of upcoming deadlines within a timeframe.

```tsx
import { UpcomingDeadlinesWidget } from '@/components/projects/widgets'

<UpcomingDeadlinesWidget 
  count={5}
  timeframe="Next 7 days" // optional, defaults to "Next 7 days"
  className="custom-class" // optional
/>
```

### 3. TeamMembersWidget
Displays the total number of team members.

```tsx
import { TeamMembersWidget } from '@/components/projects/widgets'

<TeamMembersWidget 
  count={24}
  description="Across all projects" // optional, defaults to "Across all projects"
  className="custom-class" // optional
/>
```

### 4. ProjectCardWidget
A reusable project card showing project status, progress, and basic info.

```tsx
import { ProjectCardWidget } from '@/components/projects/widgets'
import type { Project } from '@/lib/project-data'

<ProjectCardWidget 
  project={projectData}
  className="custom-class" // optional
/>
```

### 5. RecentActivityWidget
Displays recent activity across all projects with expandable list.

```tsx
import { RecentActivityWidget } from '@/components/projects/widgets'

<RecentActivityWidget 
  activities={[
    {
      id: "1",
      title: "Complete design mockups",
      projectName: "Website Redesign",
      projectId: "proj-1",
      status: "in-progress", // "in-progress" | "done" | "pending"
      time: "2 hours ago",
      color: "bg-yellow-500" // Tailwind color class
    },
    // ... more activities
  ]}
  maxVisible={5} // optional, defaults to 5
  className="custom-class" // optional
/>
```

## Layout Components

### WidgetGrid
A customizable grid container for organizing widgets.

```tsx
import { WidgetGrid } from '@/components/projects/widgets'

<WidgetGrid 
  columns={{ 
    sm: 1,  // optional
    md: 2,  // optional
    lg: 3,  // optional
    xl: 4   // optional
  }} 
  gap={4} // optional, defaults to 4
  className="custom-class" // optional
>
  <TotalProjectsWidget {...props} />
  <UpcomingDeadlinesWidget {...props} />
  <TeamMembersWidget {...props} />
</WidgetGrid>
```

### WidgetContainer
Controls individual widget grid spanning for custom layouts.

```tsx
import { WidgetContainer } from '@/components/projects/widgets'

<WidgetGrid columns={{ md: 2, lg: 4 }}>
  <WidgetContainer span={{ md: 2, lg: 2 }}>
    <TotalProjectsWidget {...props} />
  </WidgetContainer>
  <WidgetContainer span={{ md: 1, lg: 1 }}>
    <UpcomingDeadlinesWidget {...props} />
  </WidgetContainer>
  <WidgetContainer span={{ md: 1, lg: 1 }}>
    <TeamMembersWidget {...props} />
  </WidgetContainer>
</WidgetGrid>
```

## Customization Examples

### Example 1: Basic 3-Column Layout
```tsx
<WidgetGrid columns={{ md: 2, lg: 3 }} gap={4}>
  <TotalProjectsWidget 
    totalProjects={metrics.totalProjects}
    activeProjects={metrics.activeProjects}
  />
  <UpcomingDeadlinesWidget 
    count={metrics.upcomingDeadlines}
  />
  <TeamMembersWidget 
    count={metrics.teamMembers}
  />
</WidgetGrid>
```

### Example 2: Custom Layout with Spanning
```tsx
<WidgetGrid columns={{ md: 2, lg: 4 }} gap={6}>
  {/* Wide widget taking 2 columns */}
  <WidgetContainer span={{ md: 2, lg: 2 }}>
    <RecentActivityWidget activities={activities} />
  </WidgetContainer>
  
  {/* Standard widgets */}
  <TotalProjectsWidget {...props} />
  <UpcomingDeadlinesWidget {...props} />
  <TeamMembersWidget {...props} />
  
  {/* Another wide widget */}
  <WidgetContainer span={{ md: 2, lg: 1 }}>
    <CustomWidget {...props} />
  </WidgetContainer>
</WidgetGrid>
```

### Example 3: Vertical Stack on Mobile, Grid on Desktop
```tsx
<WidgetGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
  <TotalProjectsWidget {...props} />
  <UpcomingDeadlinesWidget {...props} />
  <TeamMembersWidget {...props} />
  <CustomWidget {...props} />
</WidgetGrid>
```

### Example 4: Custom Styling
```tsx
<TotalProjectsWidget 
  totalProjects={10}
  activeProjects={7}
  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
/>
```

## Creating Custom Widgets

To create a new widget that fits the system:

1. Create a new file in `src/components/projects/widgets/`
2. Follow this template:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { YourIcon } from "lucide-react"

interface YourWidgetProps {
  data: any
  className?: string
}

export function YourWidget({ data, className = "" }: YourWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Title</CardTitle>
        <YourIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data}</div>
        <p className="text-xs text-muted-foreground">
          Your description
        </p>
      </CardContent>
    </Card>
  )
}
```

3. Export it from `src/components/projects/widgets/index.ts`:

```tsx
export { YourWidget } from './YourWidget'
```

4. Use it in your pages:

```tsx
import { YourWidget } from '@/components/projects/widgets'

<YourWidget data={yourData} />
```

## Benefits of Widget Architecture

1. **Modularity**: Each widget is self-contained and reusable
2. **Customization**: Easy to style, rearrange, or extend widgets
3. **Maintainability**: Changes to one widget don't affect others
4. **Consistency**: All widgets follow the same pattern and styling
5. **Flexibility**: Can create custom layouts for different views/pages
6. **Testing**: Each widget can be tested independently
7. **Performance**: Can optimize individual widgets without affecting others

## File Structure

```
src/components/projects/widgets/
├── index.ts                          # Central export file
├── TotalProjectsWidget.tsx           # Total projects metric
├── UpcomingDeadlinesWidget.tsx       # Deadlines metric
├── TeamMembersWidget.tsx             # Team members metric
├── ProjectCardWidget.tsx             # Project card display
├── RecentActivityWidget.tsx          # Activity feed
├── WidgetGrid.tsx                    # Grid layout container
└── WidgetContainer.tsx               # Individual widget wrapper
```

## Best Practices

1. **Always provide a className prop** for custom styling flexibility
2. **Use optional props** for customization (descriptions, timeframes, etc.)
3. **Keep widgets focused** - each should have a single responsibility
4. **Use TypeScript** for type safety and better developer experience
5. **Follow the Card pattern** for consistency across all widgets
6. **Document prop interfaces** clearly for other developers
7. **Export from index.ts** for clean imports

## Migration Notes

The original dashboard used inline Card components. These have been replaced with dedicated widget components. The functionality remains the same, but now with better organization and customization options.

### Before:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
    <TrendingUp className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{metrics.totalProjects}</div>
    <p className="text-xs text-muted-foreground">{metrics.activeProjects} active</p>
  </CardContent>
</Card>
```

### After:
```tsx
<TotalProjectsWidget 
  totalProjects={metrics.totalProjects}
  activeProjects={metrics.activeProjects}
/>
```

## Future Enhancements

Potential additions to the widget system:

- **Widget Configuration System**: Save and load widget layouts per user
- **Drag & Drop**: Allow users to rearrange widgets
- **Widget Marketplace**: Share custom widgets across teams
- **Dashboard Templates**: Pre-configured layouts for different roles
- **Real-time Updates**: Live data updates for widgets
- **Widget Settings**: Per-widget configuration panels
- **Export/Import**: Save layouts to JSON for backup/sharing







