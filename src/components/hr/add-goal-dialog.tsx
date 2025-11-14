"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee } from "@/lib/hr-api"
import { createGoal } from "@/lib/hr-api"
import { useToast } from "@/hooks/use-toast"

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  onGoalAdded?: () => void
  preselectedEmployeeId?: string
}

export function AddGoalDialog({ 
  open, 
  onOpenChange, 
  employees, 
  onGoalAdded,
  preselectedEmployeeId 
}: AddGoalDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId || "",
    goal: "",
    category: "",
    due_date: "",
    description: "",
    progress: 0,
    status: "On Track" as "On Track" | "Behind" | "Complete" | "Cancelled",
    created_date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employee_id) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      })
      return
    }

    if (!formData.goal) {
      toast({
        title: "Error",
        description: "Please enter a goal title",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    if (!formData.due_date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createGoal({
        employee_id: formData.employee_id,
        goal: formData.goal,
        category: formData.category,
        due_date: formData.due_date,
        description: formData.description || null,
        progress: formData.progress,
        status: formData.status,
        created_date: formData.created_date,
      })

      if (result) {
        toast({
          title: "Success",
          description: "Goal added successfully",
        })
        onOpenChange(false)
        if (onGoalAdded) {
          onGoalAdded()
        }
        // Reset form
        setFormData({
          employee_id: preselectedEmployeeId || "",
          goal: "",
          category: "",
          due_date: "",
          description: "",
          progress: 0,
          status: "On Track",
          created_date: new Date().toISOString().split('T')[0],
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add goal",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Employee Goal</DialogTitle>
            <DialogDescription>
              Set a new goal for an employee to track their progress
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Employee Selection */}
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                disabled={!!preselectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goal Title */}
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal Title *</Label>
              <Input
                id="goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g., Complete React certification"
                required
              />
            </div>

            {/* Category and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional Development">Professional Development</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Sales Target">Sales Target</SelectItem>
                    <SelectItem value="Mentorship">Mentorship</SelectItem>
                    <SelectItem value="Process Improvement">Process Improvement</SelectItem>
                    <SelectItem value="Team Building">Team Building</SelectItem>
                    <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Initial Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="Behind">Behind</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the goal and success criteria..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
