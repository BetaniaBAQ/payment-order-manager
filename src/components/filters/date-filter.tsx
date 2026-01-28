import { CalendarIcon } from '@phosphor-icons/react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateFilterProps {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  placeholder: string
  disabledDate?: (date: Date) => boolean
}

export function DateFilter({
  value,
  onChange,
  placeholder,
  disabledDate,
}: DateFilterProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'MMM d, yyyy') : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabledDate}
        />
      </PopoverContent>
    </Popover>
  )
}
