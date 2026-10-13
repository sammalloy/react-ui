# Back Office UI

A React design system and shared UI library for the Back Office suite of apps, as a prototype for moving off Angular. It is [shadcn/ui](https://ui.shadcn.com) copied in as source we own (every component, block and chart), themed by our own design tokens, documented in Storybook, and published as versioned npm packages.

| Package | Path | What it is |
| --- | --- | --- |
| `@backoffice/tokens` | `libs/tokens` | Design tokens in `src/tokens.json`, built to CSS variables, a Tailwind v4 theme and a JS object |
| `@backoffice/ui` | `libs/ui` | 61 components (Button, Dialog, Form, Sidebar, Table, Chart, ...) built on Radix and Tailwind |
| `@backoffice/blocks` | `libs/blocks` | 27 page blocks (dashboard, 16 sidebars, 5 logins, 5 signups) and 70 charts |
| Storybook | `apps/storybook` | 325 stories: every shadcn example, block and chart, plus token foundations, in light and dark |
| Example app | `apps/example` | A small Back Office (overview, cash-ups, fuel) built only from the built packages |

## Getting started

```bash
npm install
npm run storybook        # http://localhost:6006
npm run dev              # example app, builds the libraries first
npm run build            # build everything (Nx caches and only rebuilds what changed)
npm run typecheck
```

Nx runs the tasks. `npx nx affected -t build typecheck` builds and checks only what a branch changed, and `npx nx graph` shows how the packages depend on each other.

## Using the packages in an app

```bash
npm install @backoffice/ui @backoffice/blocks tailwindcss @tailwindcss/vite
```

```css
/* your main stylesheet */
@import "tailwindcss";
@import "@backoffice/ui/styles.css";
@import "@backoffice/blocks/styles.css";
```

```tsx
import { Button } from "@backoffice/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@backoffice/ui/dialog"
import { Dashboard01 } from "@backoffice/blocks/dashboard-01"
import { ChartAreaInteractive } from "@backoffice/blocks/charts"
```

Each component has its own entry point (`@backoffice/ui/<component>`), so apps only ship what they import. Dark mode is the `dark` class or `data-theme="dark"` on an ancestor, usually `<html>`. See `apps/example` for a complete app.

Apps that are not on Tailwind yet (including the Angular apps) can still share the colours, radius and fonts by importing `@backoffice/tokens/tokens.css`, which is plain CSS variables.

## Design tokens

`libs/tokens/src/tokens.json` is the source of truth, in the W3C design-tokens format:

- **primitive**: raw values (the neutral scale, reds, chart palette, radius, fonts).
- **semantic**: what components use (`background`, `primary`, `destructive`, `sidebar`, `chart-1`, ...), per theme (`light`, `dark`), each pointing at a primitive.

`nx build tokens` writes `dist/tokens.css` (`--bo-*` primitives and the semantic variables), `dist/theme.css` (maps them onto Tailwind utilities such as `bg-primary` and `rounded-lg`) and `dist/index.js`. To rebrand, change the primitives or point semantic tokens at different ones; to add a theme, add a group next to `light` and `dark` and it becomes `.<name>` / `[data-theme="<name>"]`.

## Owning shadcn

The components are ours to change. `tools/sync-shadcn.mjs` copies shadcn's `new-york-v4` registry into the repo and rewrites its imports, so pulling in upstream fixes later is a reviewable diff:

```bash
git clone --depth 1 https://github.com/shadcn-ui/ui.git /tmp/shadcn
npm run sync:shadcn -- /tmp/shadcn
git diff
```

It regenerates the stories from shadcn's examples too. The commit last synced is in `tools/shadcn-version.txt`. Examples that need things we don't ship (Next.js server actions, Formisch, TanStack Form) are skipped and listed when it runs. Once we start customising components heavily, stop syncing those files and treat them as fully ours.

## Visual testing with Lookout

`.lookout.yml` points [Lookout](https://github.com/sammalloy/lookout) at the Storybook build, capturing every story in light and dark with `onlyChanged` on (the build writes `preview-stats.json`). Changing `tokens.json` recaptures everything.

```bash
npx nx run storybook:build
lookout run --branch my-change --pr 123
```

## Versioning and publishing

The three libraries are versioned together with Nx Release, from conventional commits (`feat:` is a minor bump, `fix:` a patch, `feat!:` a major):

```bash
npx nx release --dry-run      # preview the version bump and changelog
npx nx release                # bump, write CHANGELOG.md, commit and tag
npx nx release publish        # publish to the registry in .npmrc
```

To publish to Nexus, copy `.npmrc.example` to `.npmrc` (or configure it in Jenkins) with the internal registry URL.

## Layout

```
libs/tokens/      src/tokens.json, scripts/build.mjs
libs/ui/          src/components, src/hooks, src/lib/utils.ts, src/styles.css, src/stories
libs/blocks/      src/<block>/, src/charts/, src/styles.css
apps/storybook/   .storybook/, src/introduction.mdx, src/foundations/
apps/example/     Vite app consuming the built packages
tools/            sync-shadcn.mjs
```

Inside the workspace, Storybook and type checking resolve `@backoffice/*` to TypeScript source through a `source` export condition, so edits show up without rebuilding. The example app deliberately uses the built `dist` output, the same as an app in another repo.

Derived from shadcn/ui under the MIT License; see `THIRD_PARTY_NOTICES.md`.
