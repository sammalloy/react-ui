import { Label } from "@backoffice/ui/label"
import { Textarea } from "@backoffice/ui/textarea"

export default function TextareaWithLabel() {
  return (
    <div className="grid w-full gap-3">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  )
}
