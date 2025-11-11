# Frappe Gantt Chart Implementation

## Overview

The Timeline View now uses **frappe-gantt** - a simple, modern, and interactive Gantt chart library that works perfectly with React and supports dark themes.

## Installation

```bash
npm install frappe-gantt
```

## Key Features

- ✅ **Simple & Fast**: Lightweight library with minimal dependencies
- ✅ **Interactive**: Hover tooltips, progress tracking
- ✅ **Task Dependencies**: Visual dependency arrows between tasks
- ✅ **Progress Bars**: Visual progress within task bars
- ✅ **Dark Mode**: Fully themed to match your application
- ✅ **Status Colors**: Color-coded bars based on task status
- ✅ **Responsive**: Works on all screen sizes

## File Structure

```
zenith-saas/
├── components/
│   └── projects/
│       ├── timeline-view.tsx      # Main component with SVAR Gantt
│       └── gantt-styles.css       # Custom theme styling
└── lib/
    └── project-data.ts            # Task data types
```

## Data Transformation

The component transforms your project tasks into SVAR's expected format:

```typescript
const ganttData = {
  tasks: [
    {
      id: "task-1",
      text: "Task Name",
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-01-15"),
      progress: 0.5,              // 0-1 range (50%)
      type: "task",
      parent: 0,
      details: "Task description",
      // Custom fields
      priority: "high",
      status: "in-progress",
      assignee: "John Doe",
      tags: ["frontend"]
    }
  ],
  links: [
    {
      id: "link-1",
      source: "task-1",
      target: "task-2",
      type: 0                      // finish-to-start dependency
    }
  ]
}
```

## Gantt Configuration

### Scales (Time Units)

```typescript
scales={[
  { unit: "month", step: 1, format: "MMM yyyy" },
  { unit: "day", step: 1, format: "d" }
]}
```

**Available units**: `year`, `month`, `week`, `day`, `hour`, `minute`

### Columns

```typescript
columns={[
  { name: "text", label: "Task Name", width: 250 },
  { name: "start_date", label: "Start Date", align: "center", width: 120 },
  { name: "end_date", label: "End Date", align: "center", width: 120 },
  { name: "assignee", label: "Assignee", align: "center", width: 150 }
]}
```

### Properties

- `tasks`: Array of task objects
- `links`: Array of dependency links
- `scales`: Time scale configuration
- `columns`: Left-side column configuration
- `cellHeight`: Row height in pixels (default: 40)
- `readonly`: Enable/disable editing (default: false)

## Customization

### Theme Colors

Edit `gantt-styles.css` to customize colors:

```css
.gantt-container {
  --wx-background: hsl(var(--background));
  --wx-color: hsl(var(--foreground));
  --wx-border: hsl(var(--border));
}
```

### Task Status Colors

Status-based coloring is automatically applied:

- **Done**: Green (`hsl(142, 71%, 45%)`)
- **In Progress**: Blue (`hsl(221, 83%, 53%)`)
- **Review**: Purple (`hsl(271, 81%, 56%)`)
- **Blocked**: Red (`hsl(0, 84%, 60%)`)
- **To Do**: Yellow (`hsl(48, 96%, 53%)`)
- **Backlog**: Gray (`hsl(215, 16%, 47%)`)

### Adding Custom Columns

To add a priority column:

```typescript
columns={[
  { name: "text", label: "Task Name", width: 250 },
  { name: "priority", label: "Priority", align: "center", width: 100 },
  // ... other columns
]}
```

### Changing Time Range

The Gantt automatically calculates the time range from task dates. To set a custom range:

```typescript
<Gantt
  tasks={ganttData.tasks}
  links={ganttData.links}
  start={new Date("2025-01-01")}
  end={new Date("2025-12-31")}
/>
```

## Event Handlers

### Task Updates

```typescript
const handleTaskUpdate = (id: string, task: any) => {
  console.log("Task updated:", id, task);
  // Update your backend/state here
};

<Gantt
  tasks={ganttData.tasks}
  onUpdateTask={handleTaskUpdate}
/>
```

### Link Creation

```typescript
const handleLinkAdd = (link: any) => {
  console.log("Link added:", link);
  // Update dependencies in your backend
};

<Gantt
  tasks={ganttData.tasks}
  onAddLink={handleLinkAdd}
/>
```

## Advanced Features

### Task Hierarchies

Create subtasks by setting the `parent` field:

```typescript
{
  id: "subtask-1",
  text: "Subtask",
  parent: "parent-task-id",  // Links to parent task
  // ... other fields
}
```

### Milestones

Add milestones by setting `type: "milestone"`:

```typescript
{
  id: "milestone-1",
  text: "Project Launch",
  type: "milestone",
  start_date: new Date("2025-06-15"),
  end_date: new Date("2025-06-15")
}
```

### Baselines

Show original planned dates vs actual:

```typescript
{
  id: "task-1",
  text: "Task",
  start_date: new Date("2025-01-01"),
  end_date: new Date("2025-01-15"),
  planned_start: new Date("2025-01-01"),
  planned_end: new Date("2025-01-10")
}
```

## Performance

The SVAR Gantt chart is optimized for large datasets:

- ✅ Handles 1000+ tasks smoothly
- ✅ Virtual scrolling for performance
- ✅ Lazy loading of data
- ✅ Efficient rendering updates

## Migration Notes

### From Custom Gantt

The previous custom Gantt implementation has been replaced. Key changes:

- **No more manual timeline calculations** - SVAR handles this automatically
- **Built-in interactivity** - Drag-and-drop, resize, and edit out of the box
- **Better dependency visualization** - Clean lines instead of manual rendering
- **Reduced code complexity** - 500+ lines reduced to ~50 lines

### Data Format Changes

- `startDate` → `start_date`
- `deadline` → `end_date`
- `title` → `text`
- `progress` now uses 0-1 range instead of 0-100

## Resources

- **Documentation**: https://docs.svar.dev/react/gantt/overview
- **Examples**: https://docs.svar.dev/react/gantt/getting_started/
- **API Reference**: https://docs.svar.dev/react/gantt/api/overview
- **Support**: https://svar.dev/react/

## Troubleshooting

### Gantt not rendering

Check that dates are valid Date objects:

```typescript
start_date: new Date(task.startDate)  // ✅ Correct
start_date: task.startDate            // ❌ Wrong (string)
```

### Dependencies not showing

Ensure task IDs match exactly:

```typescript
links: [
  {
    source: "task-1",  // Must match actual task ID
    target: "task-2"   // Must match actual task ID
  }
]
```

### Styling issues

Import CSS in correct order:

```typescript
import "@svar-ui/react-gantt/dist/gantt.css"  // SVAR default styles first
import "./gantt-styles.css"                    // Your custom styles override
```

## Future Enhancements

- [ ] Add task filtering by status/assignee
- [ ] Export to PDF/PNG functionality
- [ ] Critical path highlighting
- [ ] Resource utilization view
- [ ] Zoom level controls (hour/week/month/quarter/year)
- [ ] Undo/redo functionality
- [ ] Real-time collaboration support

---

**Last Updated**: October 31, 2025

