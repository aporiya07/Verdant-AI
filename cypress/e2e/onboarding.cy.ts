describe('Onboarding Flow', () => {
  beforeEach(() => {
    // Clear local storage to ensure fresh onboarding state
    cy.clearLocalStorage()
  })

  it('completes the onboarding flow and navigates to the dashboard', () => {
    cy.visit('/')
    
    // Step 0: Welcome
    cy.contains('Start my journey').click()

    // Step 1: Name
    cy.get('input[type="text"]').type('Cypress User')
    cy.contains('Next').click()

    // Step 2: City
    cy.get('select').select('Mumbai')
    cy.contains('Next').click()

    // Step 3: Commute
    cy.contains('Local Train').click()
    cy.contains('Next').click()

    // Step 4: Diet
    cy.contains('Vegetarian').click()
    cy.contains('Next').click()

    // Step 5: Energy
    cy.get('input').first().clear().type('200') // electricity
    cy.get('input').last().clear().type('2')    // lpg
    cy.contains('Next').click()

    // Step 6: Goal
    cy.contains('Next').click()

    // Step 7: EarthTwin Reveal
    cy.contains('Start my journey!').click()

    // Verify we landed on Dashboard and it shows the user's name
    cy.contains('Namaste, Cypress User').should('be.visible')
    
    // Verify that energy logs were added automatically
    cy.contains('Quick Add').should('be.visible')
  })
})
