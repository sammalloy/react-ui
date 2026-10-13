import { Button } from "@backoffice/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@backoffice/ui/item"
import { Progress } from "@backoffice/ui/progress"
import { Spinner } from "@backoffice/ui/spinner"

export default function SpinnerItem() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 [--radius:1rem]">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Downloading...</ItemTitle>
          <ItemDescription>129 MB / 1000 MB</ItemDescription>
        </ItemContent>
        <ItemActions className="hidden sm:flex">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
        </ItemActions>
        <ItemFooter>
          <Progress value={75} />
        </ItemFooter>
      </Item>
    </div>
  )
}
