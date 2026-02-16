interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string | number
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary rounded-lg p-2.5">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-serif text-2xl tabular-nums">{value}</p>
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
      </div>
    </div>
  )
}
