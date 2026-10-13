import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@backoffice/ui/card"
import { Progress } from "@backoffice/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@backoffice/ui/tabs"

const tanks = [
  { name: "Tank 1 · Unleaded", level: 72, litres: "21,600 / 30,000 L" },
  { name: "Tank 2 · Diesel", level: 38, litres: "11,400 / 30,000 L" },
  { name: "Tank 3 · Super unleaded", level: 15, litres: "2,250 / 15,000 L" },
]

export function FuelPage() {
  return (
    <Tabs defaultValue="tanks">
      <TabsList>
        <TabsTrigger value="tanks">Tank levels</TabsTrigger>
        <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
      </TabsList>
      <TabsContent value="tanks" className="grid gap-4 md:grid-cols-3">
        {tanks.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.litres}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={t.level} />
            </CardContent>
          </Card>
        ))}
      </TabsContent>
      <TabsContent value="deliveries">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
            <CardDescription>Two deliveries are booked for today.</CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
