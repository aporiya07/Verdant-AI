import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
