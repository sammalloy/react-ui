import type { Preview } from "@storybook/react-vite"
import { Toaster } from "@backoffice/ui/sonner"
import { TooltipProvider } from "@backoffice/ui/tooltip"

import "../src/storybook.css"

const preview: Preview = {
  // Lookout captures every story in each theme by setting this global
  // (?globals=theme:dark), so keep the name and values in sync with .lookout.yml.
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "padded",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ["Introduction", "Foundations", "Components", "Patterns", "Blocks", "Charts"],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light"
      // Set before the story renders so the first paint is already themed.
      document.documentElement.classList.toggle("dark", theme === "dark")
      document.documentElement.style.colorScheme = theme
      return (
        <TooltipProvider>
          <Story />
          <Toaster />
        </TooltipProvider>
      )
    },
  ],
}

export default preview
