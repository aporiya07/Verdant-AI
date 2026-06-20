describe('Insights Flow', () => {
  beforeEach(() => {
    // Seed local storage with some logs to view in insights
    cy.window().then((win) => {
      const today = new Date().toISOString().split('T')[0]
      win.localStorage.setItem('verdant-storage', JSON.stringify({
        state: {
          user: { name: 'Test User', city: 'Delhi', onboardingComplete: true, monthlyGoalKg: 200 },
          logs: [
            { id: '1', date: today, category: 'energy', activity: 'Electricity', co2Kg: 50, quantity: 1, unit: 'm' },
            { id: '2', date: today, category: 'food', activity: 'Veg Thali', co2Kg: 0.45, quantity: 1, unit: 'm' }
          ],
          monthlyReports: []
        }
      }))
    })
    cy.visit('/')
  })

  it('navigates to EarthReport and displays data', () => {
    // Click on EarthReport in sidebar
    cy.contains('EarthReport').click()

    // Verify header
    cy.contains('Verdant AI · EarthReport').should('be.visible')
    
    // Verify the total footprint is displayed (50.45)
    cy.contains('50.4').should('be.visible') // using formatNumDecimal logic it might be 50.5

    // Verify category breakdown is visible
    cy.contains('Breakdown by category').should('be.visible')
    cy.contains('Energy').should('be.visible')
    cy.contains('Food').should('be.visible')
  })
})
