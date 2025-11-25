# Auto-Status Update & Task Movement Guide

## How It Works

When you update a task's progress percentage, the system now:

1. **Automatically updates the task status** based on progress
2. **Triggers a project reload** to refresh all views
3. **Moves the task visually** to the correct Kanban column

## Status Mapping Rules

| Progress | Auto-Status |
|----------|-------------|
| 0% | `todo` |
| 1-74% | `in-progress` |
| 75-99% | `review` |
| 100% | `done` |

**Exception:** Tasks marked as `blocked` or `backlog` will NOT auto-update (manual control preserved)

## Technical Flow

### Step-by-Step Process

```
User changes progress in Table View
    ↓
handleProgressChange() updates local state (instant UI feedback)
    ↓
updateTask() in project-data-supabase.ts
    ↓
Check if task status should auto-update
    ↓
Update database with new progress + auto-calculated status
    ↓
Clear cache & dispatch 'projectDataUpdated' event
    ↓
ProjectDetail component receives event
    ↓
loadProject() fetches fresh data from database
    ↓
New project state passed to all child views
    ↓
Kanban board receives updated tasks via props
    ↓
Task appears in new status column 🎉
```

## Console Logs for Debugging

When you update progress, you should see these logs:

```
[TableView] Updating task progress: <taskId> to <X>%
[updateTask] Auto-updating task status from "todo" to "in-progress" based on 50% progress
[updateTask] Dispatching projectDataUpdated event for project: <projectId>
[ProjectDetail] Project data updated, refreshing...
[KanbanBoard] Project tasks updated: <N> tasks
```

## Where Status Auto-Updates

✅ **Works in these views:**
- **Table View** - inline progress input
- **Task Details Dialog** - progress slider or number input
- **Any component** using `updateTask()` with progress changes

❌ **Does NOT auto-update when:**
- Task status is `blocked` (user wants manual control)
- Task status is `backlog` (not yet started)
- Status is explicitly provided alongside progress update
- User manually changes status without touching progress

## UI Update Flow

### Immediate (Optimistic Update)
- Local state updates instantly for responsive feel
- Progress bar reflects new value immediately

### After Database Save (~100-500ms)
- Event fires to all listening components
- ProjectDetail reloads full project data
- All views receive fresh task list via props
- Kanban board re-renders with tasks in correct columns
- Table view updates with any backend changes

## Testing Scenarios

### Scenario 1: Move task from "To Do" to "In Progress"
1. Open a project in Kanban view
2. Switch to Table view
3. Find a task at 0% progress in "To Do"
4. Change progress to 50%
5. Check console for status update log
6. Switch back to Kanban view
7. **Expected:** Task should now be in "In Progress" column

### Scenario 2: Complete a task
1. In Table view, find a task at 75% in "Review"
2. Update progress to 100%
3. Switch to Kanban view
4. **Expected:** Task should be in "Done" column

### Scenario 3: Blocked task stays blocked
1. In Kanban, move a task to "Blocked"
2. Switch to Table view
3. Change that task's progress to 50%
4. Switch back to Kanban
5. **Expected:** Task should STILL be in "Blocked" column

## Troubleshooting

### Task status updates but doesn't move in Kanban

**Possible causes:**
1. Browser cache - hard refresh (Ctrl+F5)
2. Event listener not attached - check console for logs
3. Database not updating - check Network tab

**Solution:**
```javascript
// Check if event is firing:
window.addEventListener('projectDataUpdated', (e) => {
  console.log('Event received:', e.detail)
})
```

### Status doesn't update at all

**Check:**
1. Is task status `blocked` or `backlog`? (intentionally skipped)
2. Are you using mock data? (Supabase must be configured)
3. Check console for error messages

### UI updates but reverts back

**Likely cause:** Database update failed but local state updated

**Solution:** Check Network tab for failed API calls to Supabase

## Code References

### Main Update Function
**File:** `src/lib/project-data-supabase.ts`

```typescript
export async function updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  // Auto-update status based on progress
  if (updates.progress !== undefined && updates.status === undefined) {
    const project = await api.getProjectById(projectId)
    const task = project?.tasks.find((t) => t.id === taskId)
    
    if (task && task.status !== 'blocked' && task.status !== 'backlog') {
      const newStatus = getStatusFromProgress(updates.progress)
      if (newStatus !== task.status) {
        updates.status = newStatus
        console.log(`Auto-updating status from "${task.status}" to "${newStatus}"`)
      }
    }
  }
  
  await api.updateTask(taskId, updates)
  projectsCache = null
  window.dispatchEvent(new CustomEvent('projectDataUpdated', { detail: { projectId } }))
}
```

### Status Calculation
**File:** `src/lib/project-data-supabase.ts`

```typescript
export function getStatusFromProgress(progress: number): Task['status'] {
  if (progress === 0) return 'todo'
  if (progress === 100) return 'done'
  if (progress >= 75) return 'review'
  if (progress >= 1) return 'in-progress'
  return 'todo'
}
```

### Event Listener (Parent Component)
**File:** `src/components/projects/project-detail.tsx`

```typescript
useEffect(() => {
  const handleProjectUpdate = (event: CustomEvent) => {
    if (event.detail.projectId === projectId) {
      console.log('Project data updated, refreshing...')
      loadProject() // Fetches fresh data and updates state
    }
  }
  
  window.addEventListener('projectDataUpdated', handleProjectUpdate)
  return () => window.removeEventListener('projectDataUpdated', handleProjectUpdate)
}, [projectId])
```

## Performance Notes

- **Debouncing:** Consider adding debouncing if users rapidly change progress
- **Caching:** 5-second cache prevents excessive database queries
- **Optimistic Updates:** Local state updates first for smooth UX
- **Event Propagation:** Single event refreshes all views simultaneously

## Best Practices

1. **Always use the provided `updateTask()` function** - don't bypass it
2. **Let the system handle status** - don't manually set status when changing progress
3. **Check console logs** when debugging - they're very detailed
4. **Test in both views** (Table and Kanban) to verify movement
5. **Use blocked/backlog** when you need manual status control

---

**Status:** ✅ Fully Implemented  
**Last Updated:** November 24, 2025



