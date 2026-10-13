import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

// One Storybook for the whole design system: components and foundations from
// @backoffice/ui, page blocks and charts from @backoffice/blocks. Workspace
// packages resolve to their TypeScript source (the "source" export condition),
// so edits show up without rebuilding the libraries.
const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx", "../../../libs/*/src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite")
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: { conditions: ["source", "module", "browser", "development|production"] },
      build: {
        rollupOptions: {
          // Radix and friends ship "use client"; it means nothing in a Storybook bundle.
          onwarn(warning: { code?: string }, warn: (w: unknown) => void) {
            if (warning.code === "MODULE_LEVEL_DIRECTIVE") return
            warn(warning)
          },
        },
      },
    })
  },
}

export default config
