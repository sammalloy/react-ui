import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@backoffice/ui/badge"
import { Button } from "@backoffice/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@backoffice/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@backoffice/ui/dialog"
import { Input } from "@backoffice/ui/input"
import { Label } from "@backoffice/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@backoffice/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@backoffice/ui/table"

type CashUp = { till: string; operator: string; expected: number; counted: number }

const initial: CashUp[] = [
  { till: "Till 1", operator: "J. Patel", expected: 1840.5, counted: 1840.5 },
  { till: "Till 2", operator: "S. Okafor", expected: 2210.0, counted: 2195.0 },
  { till: "Till 3", operator: "M. Novak", expected: 960.25, counted: 960.25 },
  { till: "Kiosk", operator: "A. Brown", expected: 3120.75, counted: 3125.75 },
]

const money = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP" })

export function CashPage() {
  const [rows, setRows] = useState(initial)
  const [open, setOpen] = useState(false)

  function addCashUp(form: FormData) {
    const row: CashUp = {
      till: String(form.get("till")),
      operator: String(form.get("operator")),
      expected: Number(form.get("expected")),
      counted: Number(form.get("counted")),
    }
    setRows((r) => [...r, row])
    setOpen(false)
    toast.success(`Cash-up recorded for ${row.till}`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle>Cash-ups</CardTitle>
          <CardDescription>Today's till counts against expected takings.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus /> New cash-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={addCashUp} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>New cash-up</DialogTitle>
                <DialogDescription>Record a till count.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="till">Till</Label>
                <Select name="till" defaultValue="Till 1">
                  <SelectTrigger id="till" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Till 1", "Till 2", "Till 3", "Kiosk"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="operator">Operator</Label>
                <Input id="operator" name="operator" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expected">Expected</Label>
                  <Input id="expected" name="expected" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="counted">Counted</Label>
                  <Input id="counted" name="counted" type="number" step="0.01" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Till</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Counted</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const variance = r.counted - r.expected
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.till}</TableCell>
                  <TableCell>{r.operator}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(r.expected)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(r.counted)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={variance === 0 ? "secondary" : "destructive"}>
                      {variance === 0 ? "Balanced" : money(variance)}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
