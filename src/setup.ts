import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import type { NuxtConfig } from 'nuxt/schema'
import { getColors } from 'theme-colors'
import { type DocsConfig, loadDocsConfig } from './config'

const appDir = fileURLToPath(new URL('../app', import.meta.url))

export async function setupDocs(docsDir: string) {
  // Try to load docs config
  const docsconfig = (await loadDocsConfig(docsDir)) || ({} as DocsConfig)

  // Normalize dir
  docsconfig.dir = docsDir = resolve(docsconfig.dir || docsDir)

  // Prepare loadNuxt overrides
  const nuxtConfig: NuxtConfig = {
    rootDir: appDir,
    srcDir: appDir,
    modulesDir: [resolve(appDir, '../node_modules'), resolve(docsDir, 'node_modules')],
    build: {
      transpile: [appDir],
    },
    // @ts-ignore
    docs: docsconfig,
    appConfig: {
      site: {
        name: docsconfig.name || '',
        description: docsconfig.description || '',
      },
      docs: {
        github: docsconfig.github || '',
      },
    },
    nitro: {
      static: true,
      publicAssets: [{ baseURL: '/', dir: resolve(docsDir, '.docs/public'), maxAge: 0 }],
    },
    alias: {
      '.docs': resolve(docsDir, '.docs'),
    },
    routeRules: {
      ...Object.fromEntries(Object.entries(docsconfig.redirects || {}).map(([from, to]) => [from, { redirect: to }])),
    },
    tailwindcss: {
      config: {
        theme: {
          extend: {
            colors: {
              theme: getColors(docsconfig.themeColor || '#ECDC5A'),
            },
          },
        },
      },
    },
  }

  return {
    docsDir,
    appDir,
    nuxtConfig,
  }
}
