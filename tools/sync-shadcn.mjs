#!/usr/bin/env node
// Copies shadcn/ui's "new-york-v4" registry into this workspace as owned source.
//
//   git clone --depth 1 https://github.com/shadcn-ui/ui.git /tmp/shadcn
//   npm run sync:shadcn -- /tmp/shadcn
//
// What it writes:
//   libs/ui/src/components/*.tsx       every registry:ui component
//   libs/ui/src/hooks/*.ts             registry hooks
//   libs/ui/src/stories/examples/*     shadcn's component demos, used as stories
//   libs/ui/src/stories/*.stories.tsx  one generated stories file per component
//   libs/blocks/src/<block>/**         every block (dashboard, sidebar, login, signup)
//   libs/blocks/src/charts/*.tsx       every chart
//   libs/blocks/src/**/*.stories.tsx   generated stories for blocks and charts
//
// Re-running overwrites those files, so local changes to synced components show
// up as a git diff against upstream. libs/ui/src/lib/utils.ts is ours and never touched.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const upstream = process.argv[2]
if (!upstream) {
  console.error("usage: sync-shadcn.mjs <path to a shadcn-ui/ui checkout>")
  process.exit(1)
}
const reg = path.join(upstream, "apps/v4/registry/new-york-v4")
if (!fs.existsSync(reg)) {
  console.error(`not a shadcn checkout: ${reg} is missing`)
  process.exit(1)
}

const PKG = "@backoffice/ui"
const UI_DIR = path.join(root, "libs/ui/src")
const BLOCKS_DIR = path.join(root, "libs/blocks/src")

// Modules examples and blocks may import. Anything else means the file needs a
// framework or package we don't ship (Next.js server actions, other form libs),
// so it is skipped and reported.
const ALLOWED = [
  /^react$/,
  /^react-dom$/,
  /^lucide-react$/,
  /^radix-ui$/,
  /^class-variance-authority$/,
  /^sonner$/,
  /^zod$/,
  /^react-hook-form$/,
  /^@hookform\/resolvers\/zod$/,
  /^recharts(\/.*)?$/,
  /^@tabler\/icons-react$/,
  /^@tanstack\/react-table$/,
  /^@dnd-kit\//,
  /^date-fns$/,
  /^react-day-picker$/,
  /^input-otp$/,
  /^embla-carousel-autoplay$/,
  /^next\/link$/,
  /^next\/image$/,
  /^cn$/,
  /^@\/registry\/new-york-v4\//,
  /^\.\/data\.json$/,
]

const read = (p) => fs.readFileSync(p, "utf8")
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, s)
}
const tsxFiles = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !f.startsWith("_"))
    : []
const importsOf = (src) => [...src.matchAll(/from "([^"]+)"/g)].map((m) => m[1])
const unsupported = (src) =>
  importsOf(src).filter((m) => !ALLOWED.some((re) => re.test(m)))
const title = (slug) =>
  slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
const pascal = (slug) => title(slug).replace(/ /g, "")

// next/link and next/image become plain elements so the code runs in any React app.
function dropNext(src) {
  if (src.includes(`from "next/link"`)) {
    src = src
      .replace(/^import Link from "next\/link"\n/m, "")
      .replace(/<Link(\s|>)/g, "<a$1")
      .replace(/<\/Link>/g, "</a>")
  }
  if (src.includes(`from "next/image"`)) {
    src = src
      .replace(/^import Image from "next\/image"\n/m, "")
      .replace(/<Image(\s[^>]*?)\s(priority|fill)(?=[\s/>])/g, "<Image$1")
      .replace(/<Image(\s[^>]*?)\s(priority|fill)(?=[\s/>])/g, "<Image$1")
      .replace(/<Image(\s)/g, "<img$1")
  }
  return src
}

// Imports as seen from outside the ui package (blocks, examples).
function toPackageImports(src) {
  return src
    .replace(/from "cn"/g, `from "${PKG}/lib/utils"`)
    .replace(/@\/registry\/new-york-v4\/ui\//g, `${PKG}/`)
    .replace(/@\/registry\/new-york-v4\/lib\/utils/g, `${PKG}/lib/utils`)
    .replace(/@\/registry\/new-york-v4\/hooks\//g, `${PKG}/hooks/`)
}

const report = { components: 0, hooks: 0, examples: 0, blocks: 0, charts: 0, skipped: [] }

// ---- components -----------------------------------------------------------
const components = tsxFiles(path.join(reg, "ui")).map((f) => f.replace(/\.tsx$/, ""))
for (const name of components) {
  let src = read(path.join(reg, "ui", `${name}.tsx`))
  src = src
    .replace(/from "cn"/g, `from "../lib/utils"`)
    .replace(/@\/registry\/new-york-v4\/ui\//g, "./")
    .replace(/@\/registry\/new-york-v4\/lib\/utils/g, "../lib/utils")
    .replace(/@\/registry\/new-york-v4\/hooks\//g, "../hooks/")
  write(path.join(UI_DIR, "components", `${name}.tsx`), src)
  report.components++
}
for (const f of tsxFiles(path.join(reg, "hooks"))) {
  write(path.join(UI_DIR, "hooks", f), read(path.join(reg, "hooks", f)))
  report.hooks++
}

// Barrel: export * from every component. Names that collide are left to the
// subpath imports (`@backoffice/ui/<component>`), which are the primary API.
const exported = new Map()
const barrel = []
for (const name of components) {
  const src = read(path.join(UI_DIR, "components", `${name}.tsx`))
  const names = [...src.matchAll(/^export\s*\{([^}]+)\}/gm)]
    .flatMap((m) => m[1].split(","))
    .map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop())
    .filter(Boolean)
  const clash = names.filter((n) => exported.has(n))
  if (clash.length) {
    barrel.push(`// ${name}: import from "${PKG}/${name}" (${clash.join(", ")} also exported by ${clash.map((n) => exported.get(n)).join(", ")})`)
    continue
  }
  names.forEach((n) => exported.set(n, name))
  barrel.push(`export * from "./components/${name}"`)
}
write(
  path.join(UI_DIR, "index.ts"),
  `// Generated by tools/sync-shadcn.mjs. Prefer subpath imports, e.g.\n// import { Button } from "${PKG}/button"\nexport { cn } from "./lib/utils"\n${barrel.join("\n")}\n`
)

// ---- examples -> component stories ----------------------------------------
const exampleSources = [
  ...tsxFiles(path.join(reg, "examples")).map((f) => path.join(reg, "examples", f)),
  ...tsxFiles(path.join(reg, "internal")).map((f) => path.join(reg, "internal", f)),
]
const EXTRA_GROUPS = {
  "data-table": "Patterns/Data Table",
  "date-picker": "Patterns/Date Picker",
  typography: "Foundations/Typography",
}
const byLength = [...components].sort((a, b) => b.length - a.length)
const groups = new Map()
fs.rmSync(path.join(UI_DIR, "stories"), { recursive: true, force: true })
for (const file of exampleSources) {
  const name = path.basename(file).replace(/\.tsx$/, "")
  let src = read(file)
  const bad = unsupported(src)
  if (bad.length) {
    report.skipped.push(`example ${name}: ${bad.join(", ")}`)
    continue
  }
  const component =
    byLength.find((c) => name === c || name.startsWith(`${c}-`)) ??
    Object.keys(EXTRA_GROUPS).find((g) => name === g || name.startsWith(`${g}-`))
  if (!component) {
    report.skipped.push(`example ${name}: no matching component`)
    continue
  }
  src = dropNext(toPackageImports(src))
  const def = src.match(/export default function (\w+)/)
  const named = src.match(/export function (\w+)/)
  const exportName = def ? "default" : named?.[1]
  if (!exportName) {
    report.skipped.push(`example ${name}: no exported component`)
    continue
  }
  write(path.join(UI_DIR, "stories/examples", `${name}.tsx`), src)
  if (!groups.has(component)) groups.set(component, [])
  groups.get(component).push({ name, exportName })
  report.examples++
}
for (const [component, examples] of groups) {
  const storyTitle = EXTRA_GROUPS[component] ?? `Components/${title(component)}`
  const imports = []
  const stories = []
  const used = new Set()
  examples.sort((a, b) => {
    const rank = (n) => (n.endsWith("-demo") ? 0 : 1)
    return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)
  })
  for (const ex of examples) {
    const local = `${pascal(ex.name)}Example`
    imports.push(
      ex.exportName === "default"
        ? `import ${local} from "./examples/${ex.name}"`
        : `import { ${ex.exportName} as ${local} } from "./examples/${ex.name}"`
    )
    let story = ex.name === component ? "Default" : pascal(ex.name.slice(component.length + 1) || "default")
    if (/^\d/.test(story)) story = `Example${story}`
    while (used.has(story)) story += "2"
    used.add(story)
    stories.push(`export const ${story}: Story = { render: () => <${local} /> }`)
  }
  const fullscreen = ["sidebar"].includes(component)
  write(
    path.join(UI_DIR, "stories", `${component}.stories.tsx`),
    `// Generated by tools/sync-shadcn.mjs from shadcn's examples.
import type { Meta, StoryObj } from "@storybook/react-vite"

${imports.join("\n")}

const meta = {
  title: "${storyTitle}",${
    fullscreen
      ? `\n  parameters: { layout: "fullscreen" },`
      : `\n  decorators: [(Story: React.ComponentType) => <div className="flex w-full justify-center"><Story /></div>],`
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

${stories.join("\n")}
`
  )
}

// ---- blocks ----------------------------------------------------------------
const blockIndex = []
const blockNames = fs
  .readdirSync(path.join(reg, "blocks"))
  .filter((d) => fs.statSync(path.join(reg, "blocks", d)).isDirectory())
  .sort()
for (const block of blockNames) {
  const srcDir = path.join(reg, "blocks", block)
  const outDir = path.join(BLOCKS_DIR, block)
  fs.rmSync(outDir, { recursive: true, force: true })
  const files = fs.readdirSync(srcDir, { recursive: true }).filter((f) => /\.(tsx?|json)$/.test(f))
  const bad = files
    .filter((f) => /\.tsx?$/.test(f))
    .flatMap((f) => unsupported(read(path.join(srcDir, f))))
  if (bad.length) {
    report.skipped.push(`block ${block}: ${[...new Set(bad)].join(", ")}`)
    continue
  }
  for (const f of files) {
    let src = read(path.join(srcDir, f))
    if (/\.tsx?$/.test(f)) {
      const depth = f.split(path.sep).length - 1
      const toBlockRoot = depth === 0 ? "./" : "../".repeat(depth)
      src = dropNext(toPackageImports(src)).replace(
        new RegExp(`@/registry/new-york-v4/blocks/${block}/`, "g"),
        toBlockRoot
      )
    }
    write(path.join(outDir, f), src)
  }
  const component = pascal(block)
  write(path.join(outDir, "index.ts"), `export { default as ${component} } from "./page"\n`)
  blockIndex.push(`export { ${component} } from "./${block}"`)
  const kind = block.replace(/-\d+$/, "")
  write(
    path.join(outDir, `${block}.stories.tsx`),
    `// Generated by tools/sync-shadcn.mjs.
import type { Meta, StoryObj } from "@storybook/react-vite"

import { ${component} } from "./index"

const meta = {
  title: "Blocks/${title(kind)}/${title(block)}",
  component: ${component},
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ${component}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
`
  )
  report.blocks++
}

// ---- charts ----------------------------------------------------------------
const chartsOut = path.join(BLOCKS_DIR, "charts")
fs.rmSync(chartsOut, { recursive: true, force: true })
const chartGroups = new Map()
for (const f of tsxFiles(path.join(reg, "charts"))) {
  const name = f.replace(/\.tsx$/, "")
  let src = read(path.join(reg, "charts", f))
  const bad = unsupported(src)
  if (bad.length) {
    report.skipped.push(`chart ${name}: ${bad.join(", ")}`)
    continue
  }
  src = toPackageImports(src)
  const fn = src.match(/export function (\w+)/)?.[1]
  if (!fn) {
    report.skipped.push(`chart ${name}: no exported component`)
    continue
  }
  write(path.join(chartsOut, f), src)
  const kind = name.split("-")[1] // area, bar, line, pie, radar, radial, tooltip
  if (!chartGroups.has(kind)) chartGroups.set(kind, [])
  chartGroups.get(kind).push({ name, fn })
  report.charts++
}
const chartIndex = []
for (const [kind, charts] of [...chartGroups].sort()) {
  const used = new Set()
  const stories = charts.map(({ name, fn }) => {
    let story = pascal(name.replace(`chart-${kind}-`, ""))
    while (used.has(story)) story += "2"
    used.add(story)
    return `export const ${story}: Story = { render: () => <${fn} /> }`
  })
  charts.forEach(({ name, fn }) => chartIndex.push(`export { ${fn} } from "./${name}"`))
  write(
    path.join(chartsOut, `${kind}.stories.tsx`),
    `// Generated by tools/sync-shadcn.mjs.
import type { Meta, StoryObj } from "@storybook/react-vite"

import { ${charts.map((c) => c.fn).join(", ")} } from "./index"

const meta = {
  title: "Charts/${title(kind)}",
  decorators: [(Story: React.ComponentType) => <div className="mx-auto w-full max-w-xl"><Story /></div>],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

${stories.join("\n")}
`
  )
}
write(path.join(chartsOut, "index.ts"), `${chartIndex.join("\n")}\n`)
write(
  path.join(BLOCKS_DIR, "index.ts"),
  `// Generated by tools/sync-shadcn.mjs.\n${blockIndex.join("\n")}\nexport * from "./charts"\n`
)

console.log(
  `components ${report.components}, hooks ${report.hooks}, examples ${report.examples}, blocks ${report.blocks}, charts ${report.charts}`
)
if (report.skipped.length) {
  console.log(`skipped ${report.skipped.length}:`)
  report.skipped.forEach((s) => console.log(`  ${s}`))
}
