import { Button } from "@backoffice/ui/button"
import { Spinner } from "@backoffice/ui/spinner"

export default function ButtonLoading() {
  return (
    <Button size="sm" variant="outline" disabled>
      <Spinner />
      Submit
    </Button>
  )
}
