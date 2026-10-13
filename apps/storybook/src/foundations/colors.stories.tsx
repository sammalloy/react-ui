import type { Meta, StoryObj } from "@storybook/react-vite"
import { tokens } from "@backoffice/tokens"

const meta = {
  title: "Foundations/Colors",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const semantic = Object.keys(tokens.semantic.light)

function Swatch({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-10 shrink-0 rounded-md border"
        style={{ background: `var(--${name})` }}
      />
      <code className="text-sm">--{name}</code>
    </div>
  )
}

/** Semantic colours for the current theme. Components only use these. */
export const Semantic: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {semantic.map((name) => (
        <Swatch key={name} name={name} />
      ))}
    </div>
  ),
}

/** Raw palette the semantic tokens point at. */
export const Primitives: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(tokens.primitive)
        .filter(([key]) => key.startsWith("color."))
        .map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-md border" style={{ background: value }} />
            <div className="text-sm">
              <code>{key}</code>
              <div className="text-muted-foreground">{value}</div>
            </div>
          </div>
        ))}
    </div>
  ),
}

export const Radius: Story = {
  render: () => (
    <div className="flex gap-6">
      {["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"].map((c) => (
        <div key={c} className="flex flex-col items-center gap-2">
          <div className={`bg-primary size-16 ${c}`} />
          <code className="text-sm">{c}</code>
        </div>
      ))}
    </div>
  ),
}
