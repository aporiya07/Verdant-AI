describe('Logging Flow', () => {
  beforeEach(() => {
    // Seed local storage to skip onboarding
    cy.window().then((win) => {
      win.localStorage.setItem('verdant-storage', JSON.stringify({
        state: {
          user: { name: 'Test User', city: 'Bengaluru', onboardingComplete: true, monthlyGoalKg: 200 },
          logs: [],
          monthlyReports: []
        }
      }))
    })
    cy.visit('/')
  })

  it('allows user to quick-add a new log and updates the dashboard', () => {
    // Verify dashboard is loaded and footprint is 0 initially
    cy.contains('Quick Add').should('be.visible')
    
    // Click "Drive" in quick add
    cy.contains('Drive').click()

    // Select "Petrol Car" from the modal
    cy.contains('Petrol Car').click()

    // Enter distance (e.g., 10 km)
    cy.get('input[type="number"]').clear().type('10')

    // Add to TraceLog
    cy.contains('Add to TraceLog').click()

    // The modal should close and the footprint should update (10 * 1.92 = 19.2)
    // Wait for the modal to disappear
    cy.contains('Quick Add — transport').should('not.exist')
    
    // Navigate to TraceLog to verify
    cy.contains('TraceLog').click()
    cy.contains('Petrol Car').should('be.visible')
    cy.contains('19.2 kg').should('be.visible')
  })
})
