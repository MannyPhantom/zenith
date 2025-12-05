# Task Movement Test Guide

## 🧪 How to Test Task Auto-Movement

### Setup
1. Open your browser's **Developer Console** (F12)
2. Navigate to a project in the PM module
3. Make sure you have at least one task in the "To Do" column

### Test Procedure

#### Test 1: Move from "To Do" to "In Progress"
1. **Switch to Table View**
2. Find a task with 0% progress (should be in "To Do" status)
3. **Change progress to 50%** in the progress input field
4. **Watch the console** - you should see:
   ```
   [TableView] Updating task progress: <id> to 50%
   [updateTask] Auto-updating task status from "todo" to "in-progress" based on 50% progress
   [updateTask] Dispatching projectDataUpdated event for project: <projectId>
   [ProjectDetail] ✨ Project data updated event received, refreshing...
   [ProjectDetail] Loading project data...
   [ProjectDetail] Project loaded with X tasks
   [KanbanBoard] 📋 Project tasks updated: X tasks
   [KanbanBoard] 📊 Task status distribution: {...}
   ```
5. **Switch to Kanban View**
6. **Expected Result:** Task should now be in the "In Progress" column ✅

#### Test 2: Move from "In Progress" to "Review"
1. In Table View, find a task at 50% progress
2. Change progress to **80%**
3. Watch console logs
4. Switch to Kanban View
5. **Expected Result:** Task should be in "Review" column ✅

#### Test 3: Complete a Task
1. In Table View, find a task at 75% progress
2. Change progress to **100%**
3. Watch console logs
4. Switch to Kanban View
5. **Expected Result:** Task should be in "Done" column ✅

### Console Log Checklist

When you update task progress, you MUST see these logs in this order:

- [ ] `[TableView] Updating task progress: <id> to X%`
- [ ] `[updateTask] Auto-updating task status from "<old>" to "<new>"`
- [ ] `[updateTask] Dispatching projectDataUpdated event`
- [ ] `[ProjectDetail] ✨ Project data updated event received, refreshing...`
- [ ] `[ProjectDetail] Loading project data...`
- [ ] `[ProjectDetail] Project loaded with X tasks`
- [ ] `[KanbanBoard] 📋 Project tasks updated: X tasks`
- [ ] `[KanbanBoard] 📊 Task status distribution:`

### Troubleshooting

#### ❌ If you DON'T see the logs:

**Problem 1: No `[updateTask]` logs**
- Check if you're using Supabase (not mock data)
- Verify `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Problem 2: See `[updateTask]` but no `[ProjectDetail]` logs**
- The event isn't firing properly
- Try hard refresh (Ctrl+Shift+R)
- Check if `projectDataUpdated` event listener is attached

**Problem 3: See all logs but task doesn't move**
- Check the status distribution log - does it show the updated counts?
- Try clicking away and back to Kanban view
- Verify the database actually updated (check Supabase dashboard)

**Problem 4: "Auto-updating task status" says same status**
- This means the new status matches the old status
- Progress change might not have crossed a threshold
- Example: 30% → 40% both result in "in-progress"

### Expected Status Distribution Changes

#### Before: Task at 0% in "To Do"
```javascript
{
  todo: 5,        // ← Task is here
  'in-progress': 2,
  review: 1,
  done: 3
}
```

#### After: Changed to 50%
```javascript
{
  todo: 4,        // ← One less
  'in-progress': 3,  // ← One more (task moved here)
  review: 1,
  done: 3
}
```

### Quick Debug Commands

Run these in the browser console:

```javascript
// Check if event listener exists
window.addEventListener('projectDataUpdated', (e) => {
  console.log('✅ Event received:', e.detail)
})

// Manually trigger event (for testing)
window.dispatchEvent(new CustomEvent('projectDataUpdated', { 
  detail: { projectId: 'your-project-id-here' } 
}))

// Check current view
console.log('Current location:', window.location.pathname)
```

### What Fixed the Movement Issue

**The Problem:**
- `loadProject` function wasn't properly memoized with `useCallback`
- Event listener dependencies were missing
- Parent component wasn't reliably refreshing

**The Solution:**
1. ✅ Wrapped `loadProject` in `useCallback` with `projectId` dependency
2. ✅ Added `loadProject` to event listener dependencies
3. ✅ Added comprehensive console logging at every step
4. ✅ Kanban board logs task status distribution on every update

### Files Updated
- `src/components/projects/project-detail.tsx` - Fixed event handling
- `src/components/projects/kanban-board.tsx` - Added status distribution logging
- `src/lib/project-data-supabase.ts` - Added detailed update logging
- `src/components/projects/table-view.tsx` - Added progress change logging

---

## 🎯 Success Criteria

✅ Console shows all expected logs in order
✅ Status distribution changes correctly
✅ Task appears in new column when switching views
✅ Progress bar reflects new percentage
✅ Project overall progress updates

**If ALL these are true, the feature is working correctly!** 🎉







