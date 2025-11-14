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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import type { Employee } from "@/lib/hr-api"
import { createPerformanceReview } from "@/lib/hr-api"
import { useToast } from "@/hooks/use-toast"

interface AddReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  onReviewAdded?: () => void
  preselectedEmployeeId?: string
}

export function AddReviewDialog({ 
  open, 
  onOpenChange, 
  employees = [], 
  onReviewAdded,
  preselectedEmployeeId 
}: AddReviewDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId || "",
    review_type: "quarterly" as "quarterly" | "annual" | "probation" | "promotion",
    review_period: "",
    review_date: new Date().toISOString().split('T')[0],
    collaboration: 3,
    accountability: 3,
    trustworthy: 3,
    leadership: 3,
    strengths: "",
    improvements: "",
    goals: "",
    trend: "stable" as "up" | "down" | "stable",
    status: "on-time" as "on-time" | "overdue" | "upcoming",
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

    if (!formData.review_period) {
      toast({
        title: "Error",
        description: "Please enter a review period",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createPerformanceReview({
        employee_id: formData.employee_id,
        review_type: formData.review_type,
        review_period: formData.review_period,
        review_date: formData.review_date,
        collaboration: formData.collaboration,
        accountability: formData.accountability,
        trustworthy: formData.trustworthy,
        leadership: formData.leadership,
        strengths: formData.strengths || null,
        improvements: formData.improvements || null,
        goals: formData.goals || null,
        trend: formData.trend,
        status: formData.status,
        reviewer_id: null,
      })

      if (result) {
        toast({
          title: "Success",
          description: "Performance review added successfully",
        })
        onOpenChange(false)
        if (onReviewAdded) {
          onReviewAdded()
        }
        // Reset form
        setFormData({
          employee_id: preselectedEmployeeId || "",
          review_type: "quarterly",
          review_period: "",
          review_date: new Date().toISOString().split('T')[0],
          collaboration: 3,
          accountability: 3,
          trustworthy: 3,
          leadership: 3,
          strengths: "",
          improvements: "",
          goals: "",
          trend: "stable",
          status: "on-time",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add performance review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding review:", error)
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
            <DialogDescription>
              Complete a comprehensive performance review for an employee
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
                  {employees && employees.length > 0 ? (
                    employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No employees available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Review Type and Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="review_type">Review Type *</Label>
                <Select
                  value={formData.review_type}
                  onValueChange={(value: any) => setFormData({ ...formData, review_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="review_period">Review Period *</Label>
                <Input
                  id="review_period"
                  placeholder="e.g., Q4 2024"
                  value={formData.review_period}
                  onChange={(e) => setFormData({ ...formData, review_period: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Review Date */}
            <div className="grid gap-2">
              <Label htmlFor="review_date">Review Date *</Label>
              <Input
                id="review_date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                required
              />
            </div>

            {/* Rating Sliders */}
            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label>Collaboration: {formData.collaboration}/5</Label>
                <Slider
                  value={[formData.collaboration]}
                  onValueChange={(value) => setFormData({ ...formData, collaboration: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="grid gap-2">
                <Label>Accountability: {formData.accountability}/5</Label>
                <Slider
                  value={[formData.accountability]}
                  onValueChange={(value) => setFormData({ ...formData, accountability: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="grid gap-2">
                <Label>Trustworthy: {formData.trustworthy}/5</Label>
                <Slider
                  value={[formData.trustworthy]}
                  onValueChange={(value) => setFormData({ ...formData, trustworthy: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="grid gap-2">
                <Label>Leadership: {formData.leadership}/5</Label>
                <Slider
                  value={[formData.leadership]}
                  onValueChange={(value) => setFormData({ ...formData, leadership: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            {/* Trend and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="trend">Performance Trend</Label>
                <Select
                  value={formData.trend}
                  onValueChange={(value: any) => setFormData({ ...formData, trend: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Improving</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="down">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Review Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-time">On Time</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Fields */}
            <div className="grid gap-2">
              <Label htmlFor="strengths">Strengths</Label>
              <Textarea
                id="strengths"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="Key strengths demonstrated during this period..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="improvements">Areas for Improvement</Label>
              <Textarea
                id="improvements"
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                placeholder="Areas where the employee can improve..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goals">Goals for Next Period</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="Goals and objectives for the next review period..."
                rows={3}
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
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
