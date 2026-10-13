import { ChartAreaInteractive, ChartBarMultiple } from "@backoffice/blocks/charts"
import { Badge } from "@backoffice/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@backoffice/ui/card"

const stats = [
  { label: "Takings today", value: "£12,480.20", change: "+4.1%" },
  { label: "Fuel sold", value: "18,204 L", change: "+1.8%" },
  { label: "Open variances", value: "3", change: "-2" },
  { label: "Deliveries due", value: "2", change: "Today" },
]

export function OverviewPage() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="flex items-center justify-between text-2xl tabular-nums">
                {s.value}
                <Badge variant="outline">{s.change}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <ChartAreaInteractive />
      <div className="max-w-xl">
        <ChartBarMultiple />
      </div>
    </>
  )
}
