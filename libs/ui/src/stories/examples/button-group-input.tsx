import { SearchIcon } from "lucide-react"

import { Button } from "@backoffice/ui/button"
import { ButtonGroup } from "@backoffice/ui/button-group"
import { Input } from "@backoffice/ui/input"

export default function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}
