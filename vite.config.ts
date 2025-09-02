// PERMITE QUE O VITEST reconheça os atalhos de paths definidos no seu tsconfig.json

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
})
