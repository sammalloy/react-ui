import { Button } from "@backoffice/ui/button"
import { ButtonGroup } from "@backoffice/ui/button-group"
import { Kbd, KbdGroup } from "@backoffice/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@backoffice/ui/tooltip"

export default function KbdTooltip() {
  return (
    <div className="flex flex-wrap gap-4">
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Save Changes <Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Print
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Print Document{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>P</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
