"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date?: Date | undefined
    onDateChange: (date: Date | undefined) => void
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    className?: string
}

export function DatePicker({ 
    date, 
    onDateChange, 
    label, 
    placeholder = "Select date",
    error,
    disabled = false,
    className
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const selectedDate = new Date(value)
      onDateChange(selectedDate)
    } else {
      onDateChange(undefined)
    }
  }, [onDateChange])

  const handleInputClick = React.useCallback(() => {
    // Focus the input to trigger the native date picker
    if (inputRef.current && !disabled) {
      inputRef.current.focus()
      inputRef.current.showPicker?.()
    }
  }, [disabled])

  // Format date for input value (YYYY-MM-DD format)
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="date"
          value={formatDateForInput(date)}
          onChange={handleDateChange}
          onClick={handleInputClick}
          className={cn(
            "w-full cursor-pointer",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
          placeholder={placeholder}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
