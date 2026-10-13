
import { AspectRatio } from "@backoffice/ui/aspect-ratio"

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo by Drew Beamer"
       
        className="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </AspectRatio>
  )
}
