# Widget Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Project Management Page                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                        WidgetGrid                           │ │
│  │  (Responsive Grid Container with configurable columns)     │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │   Widget 1   │  │   Widget 2   │  │   Widget 3   │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────┐                  │ │
│  │  │      WidgetContainer (span 3)       │                  │ │
│  │  │  ┌──────────────────────────────┐   │                  │ │
│  │  │  │      Wide Widget             │   │                  │ │
│  │  │  └──────────────────────────────┘   │                  │ │
│  │  └─────────────────────────────────────┘                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Widget Hierarchy

```
Page Component (ProjectsPage.tsx)
│
├── WidgetGrid (Layout Container)
│   │
│   ├── Widget 1 (Direct Child)
│   │   └── Card Component
│   │       ├── CardHeader
│   │       └── CardContent
│   │
│   ├── Widget 2 (Direct Child)
│   │   └── Card Component
│   │
│   └── WidgetContainer (Custom Spanning)
│       └── Widget 3 (Wide Widget)
│           └── Card Component
```

## Component Types

### 1. Metric Widgets (Data Display)
```
┌─────────────────────────┐
│  TotalProjectsWidget    │
├─────────────────────────┤
│  Title: Total Projects  │
│  Value: 12              │
│  Info: 8 active         │
└─────────────────────────┘

┌─────────────────────────┐
│ PortfolioHealthWidget   │
├─────────────────────────┤
│  Title: Portfolio Health│
│  Value: 85%             │
│  [Progress Bar]         │
└─────────────────────────┘
```

### 2. Display Widgets (Complex Content)
```
┌─────────────────────────────────┐
│    RecentActivityWidget         │
├─────────────────────────────────┤
│  • Task 1 - In Progress         │
│  • Task 2 - Done                │
│  • Task 3 - Pending             │
│  ...                            │
│  [Show More Button]             │
└─────────────────────────────────┘
```

### 3. Layout Components (Structure)
```
┌────────────────────────────────────────┐
│           WidgetGrid                   │
│  (columns={{ md: 2, lg: 3 }})         │
│                                        │
│  Auto-responsive grid layout           │
│  with configurable breakpoints         │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│         WidgetContainer                │
│  (span={{ md: 2, lg: 1 }})            │
│                                        │
│  Controls individual widget spanning   │
└────────────────────────────────────────┘
```

## Data Flow

```
Page Component (ProjectsPage.tsx)
    │
    │ Fetch/Calculate Data
    ▼
┌──────────────────┐
│   Metrics        │
│   - total: 12    │
│   - active: 8    │
│   - deadlines: 5 │
└──────────────────┘
    │
    │ Pass as Props
    ▼
┌──────────────────────────────────────┐
│            Widgets                   │
│                                      │
│  TotalProjectsWidget({ total, ... }) │
│  UpcomingDeadlinesWidget({ ... })   │
│  TeamMembersWidget({ ... })         │
└──────────────────────────────────────┘
    │
    │ Render
    ▼
┌──────────────────────────────────────┐
│         UI Card Components           │
│    (Card, CardHeader, CardContent)   │
└──────────────────────────────────────┘
```

## Responsive Behavior

```
Mobile (sm)          Tablet (md)         Desktop (lg)
┌────────┐          ┌─────┬─────┐       ┌────┬────┬────┐
│Widget 1│          │Wdgt1│Wdgt2│       │Wgt1│Wgt2│Wgt3│
├────────┤          ├─────┴─────┤       ├────┴────┴────┤
│Widget 2│          │  Widget 3 │       │   Widget 4   │
├────────┤          └───────────┘       └──────────────┘
│Widget 3│
├────────┤
│Widget 4│
└────────┘

Columns: 1          Columns: 2          Columns: 3-5
```

## Widget Lifecycle

```
1. Import Widget
   ↓
2. Render in WidgetGrid
   ↓
3. Pass Props (data, className, etc.)
   ↓
4. Widget Renders Card Component
   ↓
5. Display Data with Styling
   ↓
6. Optional: User Interaction
   ↓
7. Update Props (re-render)
```

## Layout Configuration Flow

```
┌─────────────────────────────────────────┐
│   Layout Config (Optional)              │
│   - columns: { md: 2, lg: 3 }          │
│   - gap: 4                             │
│   - widgets: [...]                     │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          WidgetGrid                     │
│   applies layout configuration          │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│     Individual Widgets Rendered         │
│     with proper spacing & alignment     │
└─────────────────────────────────────────┘
```

## Widget Props Pattern

All widgets follow this consistent pattern:

```typescript
interface WidgetProps {
  // Required data props
  data: DataType
  
  // Optional customization
  description?: string
  timeframe?: string
  
  // Always optional className for custom styling
  className?: string
}
```

## Integration Points

```
┌─────────────────────────────────────────────┐
│           Application Layer                 │
│                                             │
│  ┌─────────────┐         ┌──────────────┐  │
│  │ ProjectsPage│◄────────┤ Supabase     │  │
│  │             │  Data   │ Data Source  │  │
│  └──────┬──────┘         └──────────────┘  │
│         │                                   │
│         │ Props                             │
│         ▼                                   │
│  ┌─────────────────────────────┐           │
│  │    Widget Components        │           │
│  │  (Presentation Layer)       │           │
│  └─────────────────────────────┘           │
│         │                                   │
│         │ Styled Cards                      │
│         ▼                                   │
│  ┌─────────────────────────────┐           │
│  │    UI Components            │           │
│  │  (Card, Progress, Badge)    │           │
│  └─────────────────────────────┘           │
└─────────────────────────────────────────────┘
```

## File Organization

```
src/components/projects/widgets/
├── Metric Widgets
│   ├── TotalProjectsWidget.tsx
│   ├── UpcomingDeadlinesWidget.tsx
│   ├── TeamMembersWidget.tsx
│   ├── ActiveProjectsWidget.tsx
│   ├── PortfolioHealthWidget.tsx
│   ├── BudgetUtilizationWidget.tsx
│   ├── TeamUtilizationWidget.tsx
│   └── OnTimeDeliveryWidget.tsx
│
├── Display Widgets
│   ├── ProjectCardWidget.tsx
│   └── RecentActivityWidget.tsx
│
├── Layout Components
│   ├── WidgetGrid.tsx
│   └── WidgetContainer.tsx
│
├── Configuration
│   └── index.ts (exports)
│
└── Documentation
    └── README.md
```

## Benefits of This Architecture

1. **Separation of Concerns**
   - Layout (WidgetGrid)
   - Content (Individual Widgets)
   - Data (Page Component)

2. **Reusability**
   - Use same widget in multiple pages
   - Mix and match widgets
   - Create custom layouts easily

3. **Maintainability**
   - Change one widget without affecting others
   - Clear component boundaries
   - Easy to test

4. **Flexibility**
   - Rearrange widgets via props
   - Customize styling per instance
   - Responsive by default

5. **Scalability**
   - Add new widgets without refactoring
   - Support multiple layouts
   - Easy to extend

## Extension Points

Want to add more functionality?

```
┌─────────────────────────────────────┐
│   New Widget                        │
│   1. Create component file          │
│   2. Export from index.ts           │
│   3. Use in any page                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   New Layout                        │
│   1. Configure WidgetGrid           │
│   2. Arrange widgets                │
│   3. Save as template (optional)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Custom Styling                    │
│   1. Pass className prop            │
│   2. Apply Tailwind classes         │
│   3. Widget updates automatically   │
└─────────────────────────────────────┘
```

## See Also

- `PROJECT_MANAGEMENT_WIDGETS.md` - Widget catalog
- `WIDGET_CUSTOMIZATION_GUIDE.md` - Detailed guide
- `WIDGET_REFACTORING_SUMMARY.md` - Implementation summary
- `src/config/widget-layouts.example.ts` - Layout examples







