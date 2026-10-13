import { Button } from "@backoffice/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@backoffice/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  )
}
