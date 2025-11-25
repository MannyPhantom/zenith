# Project Management Widgets - Quick Reference

## Overview
The Project Management dashboard uses a widget-based architecture for maximum flexibility and customization. All metric tiles and data visualizations are now modular, reusable components.

## Quick Start

### Import Widgets
```tsx
import {
  TotalProjectsWidget,
  UpcomingDeadlinesWidget,
  TeamMembersWidget,
  ActiveProjectsWidget,
  PortfolioHealthWidget,
  BudgetUtilizationWidget,
  TeamUtilizationWidget,
  OnTimeDeliveryWidget,
  RecentActivityWidget,
  WidgetGrid,
  WidgetContainer
} from '@/components/projects/widgets'
```

### Basic Usage
```tsx
<WidgetGrid columns={{ md: 2, lg: 3 }} gap={4}>
  <TotalProjectsWidget 
    totalProjects={12}
    activeProjects={8}
  />
  <UpcomingDeadlinesWidget 
    count={5}
    timeframe="Next 7 days"
  />
  <TeamMembersWidget 
    count={24}
  />
</WidgetGrid>
```

## Widget Catalog

### 📊 Metric Widgets

#### TotalProjectsWidget
```tsx
<TotalProjectsWidget 
  totalProjects={12}
  activeProjects={8}
  className="optional-class"
/>
```

#### UpcomingDeadlinesWidget
```tsx
<UpcomingDeadlinesWidget 
  count={5}
  timeframe="Next 7 days"
  className="optional-class"
/>
```

#### TeamMembersWidget
```tsx
<TeamMembersWidget 
  count={24}
  description="Across all projects"
  className="optional-class"
/>
```

#### ActiveProjectsWidget
```tsx
<ActiveProjectsWidget 
  activeProjects={8}
  totalProjects={12}
  className="optional-class"
/>
```

#### PortfolioHealthWidget
```tsx
<PortfolioHealthWidget 
  healthPercentage={85}
  className="optional-class"
/>
```

#### BudgetUtilizationWidget
```tsx
<BudgetUtilizationWidget 
  totalSpent={65000}
  totalBudget={100000}
  className="optional-class"
/>
```

#### TeamUtilizationWidget
```tsx
<TeamUtilizationWidget 
  utilizationPercentage={78}
  className="optional-class"
/>
```

#### OnTimeDeliveryWidget
```tsx
<OnTimeDeliveryWidget 
  percentage={92}
  trend={{ value: 5, label: "vs last month" }}
  className="optional-class"
/>
```

### 📋 Display Widgets

#### ProjectCardWidget
```tsx
<ProjectCardWidget 
  project={projectObject}
  className="optional-class"
/>
```

#### RecentActivityWidget
```tsx
<RecentActivityWidget 
  activities={[
    {
      id: "1",
      title: "Task name",
      projectName: "Project name",
      projectId: "proj-1",
      status: "in-progress", // "in-progress" | "done" | "pending"
      time: "2 hours ago",
      color: "bg-yellow-500"
    }
  ]}
  maxVisible={5}
  className="optional-class"
/>
```

### 📐 Layout Components

#### WidgetGrid
Responsive grid container for widgets.

```tsx
<WidgetGrid 
  columns={{ 
    sm: 1,  // 1 column on small screens
    md: 2,  // 2 columns on medium screens
    lg: 3,  // 3 columns on large screens
    xl: 4   // 4 columns on extra large screens
  }} 
  gap={4}
>
  {/* widgets here */}
</WidgetGrid>
```

#### WidgetContainer
Control individual widget spanning.

```tsx
<WidgetGrid columns={{ md: 2, lg: 4 }}>
  <WidgetContainer span={{ md: 2, lg: 2 }}>
    <RecentActivityWidget {...props} />
  </WidgetContainer>
  <TotalProjectsWidget {...props} />
  <TeamMembersWidget {...props} />
</WidgetGrid>
```

## Common Layouts

### 1. Standard Dashboard (3 columns)
```tsx
<WidgetGrid columns={{ md: 2, lg: 3 }} gap={4}>
  <TotalProjectsWidget {...} />
  <UpcomingDeadlinesWidget {...} />
  <TeamMembersWidget {...} />
</WidgetGrid>
```

### 2. Portfolio Dashboard (5 columns)
```tsx
<WidgetGrid columns={{ md: 2, lg: 5 }} gap={4}>
  <ActiveProjectsWidget {...} />
  <PortfolioHealthWidget {...} />
  <BudgetUtilizationWidget {...} />
  <TeamUtilizationWidget {...} />
  <OnTimeDeliveryWidget {...} />
</WidgetGrid>
```

### 3. Mixed Layout with Wide Widgets
```tsx
<WidgetGrid columns={{ md: 2, lg: 4 }} gap={6}>
  <WidgetContainer span={{ md: 2, lg: 2 }}>
    <RecentActivityWidget {...} />
  </WidgetContainer>
  <TotalProjectsWidget {...} />
  <UpcomingDeadlinesWidget {...} />
</WidgetGrid>
```

### 4. Vertical Stack (Mobile-First)
```tsx
<WidgetGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={4}>
  <TotalProjectsWidget {...} />
  <UpcomingDeadlinesWidget {...} />
  <TeamMembersWidget {...} />
</WidgetGrid>
```

## Custom Styling

All widgets accept a `className` prop for custom styling:

```tsx
<TotalProjectsWidget 
  totalProjects={10}
  activeProjects={7}
  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
/>
```

## Benefits

✅ **Modular** - Each widget is independent and reusable  
✅ **Customizable** - Easy to rearrange, style, and extend  
✅ **Maintainable** - Changes to one widget don't affect others  
✅ **Consistent** - All widgets follow the same design pattern  
✅ **Flexible** - Create custom layouts for different views  
✅ **Type-Safe** - Full TypeScript support  
✅ **Performance** - Optimize individual widgets independently  

## Files

```
src/components/projects/widgets/
├── TotalProjectsWidget.tsx
├── UpcomingDeadlinesWidget.tsx
├── TeamMembersWidget.tsx
├── ActiveProjectsWidget.tsx
├── PortfolioHealthWidget.tsx
├── BudgetUtilizationWidget.tsx
├── TeamUtilizationWidget.tsx
├── OnTimeDeliveryWidget.tsx
├── ProjectCardWidget.tsx
├── RecentActivityWidget.tsx
├── WidgetGrid.tsx
├── WidgetContainer.tsx
└── index.ts
```

## Migration

### Before (inline cards)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Projects</CardTitle>
  </CardHeader>
  <CardContent>
    <div>{metrics.totalProjects}</div>
  </CardContent>
</Card>
```

### After (widgets)
```tsx
<TotalProjectsWidget 
  totalProjects={metrics.totalProjects}
  activeProjects={metrics.activeProjects}
/>
```

## See Also

- `WIDGET_CUSTOMIZATION_GUIDE.md` - Detailed customization guide
- Widget source files in `src/components/projects/widgets/`



