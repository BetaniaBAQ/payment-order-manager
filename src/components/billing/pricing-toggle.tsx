import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type BillingInterval = 'monthly' | 'annual'

type PricingToggleProps = {
  interval: BillingInterval
  onChange: (interval: BillingInterval) => void
}

export function PricingToggle({ interval, onChange }: PricingToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={interval}
      onValueChange={(value) => {
        onChange(value as BillingInterval)
      }}
      className="inline-flex"
    >
      <ToggleGroupItem value="monthly" className="px-4">
        Mensual
      </ToggleGroupItem>
      <ToggleGroupItem value="annual" className="gap-2 px-4">
        Anual
        <Badge variant="secondary" className="text-xs">
          Ahorra 20%
        </Badge>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
