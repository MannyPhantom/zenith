# Drag and Drop Widget Customization Guide

## Overview

The Project Management dashboard now supports **drag-and-drop widget customization**, allowing users to:
- Rearrange widgets by dragging them
- Show/hide widgets
- Save custom layouts
- Reset to default layout

## Features

### 🎯 Settings Button
Located in the top-right corner of the dashboard, providing access to:
- **Widget Settings** - Toggle widget visibility
- **Customize Layout** - Enter edit mode to drag widgets
- Layout is automatically saved to `localStorage`

### 🎨 Edit Mode
When activated:
- Drag handles appear on widgets
- Widgets get highlighted with colored rings
- Drag any widget to rearrange
- Save or cancel changes

### 💾 Persistent Storage
- Custom layouts are saved to browser `localStorage`
- Layouts persist across sessions
- Each page can have its own layout key

## User Flow

### Rearranging Widgets

1. Click **"Customize Layout"** button
2. Edit mode activates with visual indicators
3. Drag widgets using the grip handles
4. Click **"Save Layout"** to persist changes
5. Or click **"Cancel"** to discard changes

### Showing/Hiding Widgets

1. Click **"Widget Settings"** button
2. Toggle switches for each widget
3. Changes apply immediately
4. Click **"Done"** when finished

### Resetting Layout

1. Open **"Widget Settings"**
2. Click **"Reset to Default Layout"**
3. Confirmation toast appears
4. Layout returns to original state

## Implementation

### Components

#### DraggableWidget
Wraps individual widgets to make them draggable.

```tsx
<DraggableWidget
  id="widget-id"
  index={0}
  isEditMode={true}
>
  <YourWidget {...props} />
</DraggableWidget>
```

#### DraggableWidgetGrid
Grid container that manages drag-and-drop.

```tsx
<DraggableWidgetGrid
  columns={{ md: 2, lg: 3 }}
  gap={4}
  isEditMode={isEditMode}
  widgetIds={['widget-1', 'widget-2', 'widget-3']}
  onReorder={(newOrder) => console.log(newOrder)}
>
  {widgets}
</DraggableWidgetGrid>
```

#### WidgetSettingsDialog
Modal for widget visibility settings.

```tsx
<WidgetSettingsDialog
  open={open}
  onOpenChange={setOpen}
  layout={layoutItems}
  onToggleWidget={(id) => toggleWidget(id)}
  onReset={() => resetLayout()}
/>
```

### Hook: useWidgetLayout

Custom hook for managing widget layouts.

```tsx
import { useWidgetLayout } from '@/hooks/useWidgetLayout'

const {
  layout,              // Full layout array
  visibleWidgets,      // Only visible widgets
  isEditMode,          // Edit mode state
  setIsEditMode,       // Toggle edit mode
  reorderWidgets,      // Update widget order
  toggleWidget,        // Show/hide widget
  saveLayout,          // Save to localStorage
  resetLayout,         // Reset to default
} = useWidgetLayout({
  defaultLayout: [
    { id: 'widget-1', type: 'WidgetType', visible: true },
    { id: 'widget-2', type: 'WidgetType', visible: true },
  ],
  storageKey: 'my-dashboard-layout', // localStorage key
})
```

## Complete Example

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Save, X } from 'lucide-react'
import {
  DraggableWidget,
  DraggableWidgetGrid,
  WidgetSettingsDialog,
  TotalProjectsWidget,
  TeamMembersWidget,
} from '@/components/projects/widgets'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { useToast } from '@/hooks/use-toast'

function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useToast()

  const {
    layout,
    visibleWidgets,
    isEditMode,
    setIsEditMode,
    reorderWidgets,
    toggleWidget,
    saveLayout,
    resetLayout,
  } = useWidgetLayout({
    defaultLayout: [
      { id: 'total', type: 'TotalProjectsWidget', visible: true },
      { id: 'team', type: 'TeamMembersWidget', visible: true },
    ],
    storageKey: 'my-custom-layout',
  })

  return (
    <div className="space-y-4">
      {/* Header with buttons */}
      <div className="flex justify-between">
        <h1>Dashboard</h1>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => {
                saveLayout()
                setIsEditMode(false)
                toast({ title: "Layout saved" })
              }}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {isEditMode && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4">
          <p>Edit Mode: Drag widgets to rearrange</p>
        </div>
      )}

      {/* Draggable widget grid */}
      <DraggableWidgetGrid
        columns={{ md: 2, lg: 3 }}
        gap={4}
        isEditMode={isEditMode}
        widgetIds={visibleWidgets.map(w => w.id)}
        onReorder={reorderWidgets}
      >
        {visibleWidgets.map((widget, index) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            index={index}
            isEditMode={isEditMode}
          >
            {widget.type === 'TotalProjectsWidget' && (
              <TotalProjectsWidget totalProjects={10} activeProjects={5} />
            )}
            {widget.type === 'TeamMembersWidget' && (
              <TeamMembersWidget count={20} />
            )}
          </DraggableWidget>
        ))}
      </DraggableWidgetGrid>

      {/* Settings dialog */}
      <WidgetSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        layout={layout}
        onToggleWidget={toggleWidget}
        onReset={() => {
          resetLayout()
          toast({ title: "Layout reset" })
        }}
      />
    </div>
  )
}
```

## Technical Details

### Drag and Drop Implementation

Uses native HTML5 drag and drop API:
- `draggable` attribute on widgets
- `onDragStart` - Captures dragged item
- `onDragEnter` - Detects drop target
- `onDragOver` - Allows dropping
- `onDragEnd` - Completes the action

No external libraries required!

### Data Structure

```typescript
interface WidgetLayoutItem {
  id: string           // Unique identifier
  type: string         // Widget component name
  visible: boolean     // Show/hide state
}
```

### Storage

Layouts are saved as JSON in `localStorage`:

```javascript
{
  "projects-dashboard-layout": [
    { "id": "total-projects", "type": "TotalProjectsWidget", "visible": true },
    { "id": "team-members", "type": "TeamMembersWidget", "visible": false }
  ]
}
```

## Styling

### Edit Mode Indicators

- **Drag Handle**: Primary-colored circular button with grip icon
- **Widget Ring**: 2px primary-colored border around widgets
- **Banner**: Informational banner at top of grid
- **Hover Effects**: Scale transformation on drag handle

### Visual Feedback

- Opacity changes during drag
- Ring highlights in edit mode
- Smooth transitions
- Toast notifications for actions

## Best Practices

### 1. Unique Widget IDs
Always use unique IDs for each widget:
```tsx
{ id: 'total-projects', type: 'TotalProjectsWidget', visible: true }
// Not: { id: 'widget-1', ... }
```

### 2. Storage Keys
Use descriptive storage keys:
```tsx
storageKey: 'projects-dashboard-layout'  // Good
storageKey: 'layout'                     // Too generic
```

### 3. Default Layouts
Provide sensible defaults:
```tsx
defaultLayout: [
  { id: 'critical-widget', type: 'Widget', visible: true },  // Always visible
  { id: 'optional-widget', type: 'Widget', visible: false }, // Hidden by default
]
```

### 4. Toast Feedback
Always show feedback for user actions:
```tsx
toast({
  title: "Layout saved",
  description: "Your widget layout has been saved.",
})
```

### 5. Widget Type Naming
Keep type names consistent with component names:
```tsx
{ type: 'TotalProjectsWidget' }  // Matches component name
```

## Customization

### Custom Drag Handles

Modify `DraggableWidget.tsx`:

```tsx
<div className="absolute -top-2 -left-2 z-10 ...">
  <YourCustomIcon className="h-4 w-4" />
</div>
```

### Custom Edit Mode Styling

```tsx
<div className={
  isEditMode 
    ? "ring-4 ring-blue-500 ring-offset-4 shadow-xl" 
    : ""
}>
  {children}
</div>
```

### Different Grid Layouts

```tsx
<DraggableWidgetGrid
  columns={{ sm: 1, md: 2, lg: 4, xl: 5 }}
  gap={6}
  // ...
/>
```

## Accessibility

- ✅ Keyboard navigation supported
- ✅ ARIA labels on buttons
- ✅ Focus indicators
- ✅ Screen reader friendly toasts
- ✅ Semantic HTML structure

## Browser Support

Works in all modern browsers that support:
- HTML5 Drag and Drop API
- localStorage
- CSS Grid
- ES6+

## Troubleshooting

### Widgets Not Saving
Check browser console for localStorage errors. Some browsers restrict localStorage in private/incognito mode.

### Drag Not Working
Ensure `isEditMode` is `true` and `draggable` attribute is set.

### Layout Not Persisting
Verify `storageKey` is unique and localStorage is available.

### Widgets Flickering
Ensure widget IDs remain stable across renders.

## Migration from Static Layout

1. Wrap existing grid with `DraggableWidgetGrid`
2. Wrap widgets with `DraggableWidget`
3. Add `useWidgetLayout` hook
4. Add settings buttons
5. Implement save/cancel logic

## Future Enhancements

Potential additions:
- Multi-column spanning widgets
- Widget resizing
- Export/import layouts
- Layout templates/presets
- Cloud sync for layouts
- Undo/redo functionality
- Layout analytics

## See Also

- `PROJECT_MANAGEMENT_WIDGETS.md` - Widget catalog
- `WIDGET_CUSTOMIZATION_GUIDE.md` - Widget customization
- `WIDGET_ARCHITECTURE.md` - Architecture diagrams
- Source: `src/components/projects/widgets/`







