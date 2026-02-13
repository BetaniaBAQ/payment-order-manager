import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type BillingInterval = 'monthly' | 'annual'

type PricingToggleProps = {
  interval: BillingInterval
  onChange: (interval: BillingInterval) => void
}

export function PricingToggle({ interval, onChange }: PricingToggleProps) {
  const { t } = useTranslation('billing')

  return (
    <div className="bg-muted rounded-lg p-1">
      <ToggleGroup
        value={[interval]}
        onValueChange={(values) => {
          const next = values.find((v) => v !== interval)
          if (next) onChange(next as BillingInterval)
        }}
        className="inline-flex"
      >
        <ToggleGroupItem
          value="monthly"
          className="px-6 py-2 text-sm font-medium"
        >
          {t('toggle.monthly')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="annual"
          className="gap-2 px-6 py-2 text-sm font-medium"
        >
          {t('toggle.annual')}
          <Badge variant="secondary" className="text-xs">
            {t('pricing.save20')}
          </Badge>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
