import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://jeevankatha.example.com',
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
