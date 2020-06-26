//API Endpointit kuukausibudgetin määrittelyä varten

const budgetSettingsRouter = require('express').Router()
const BudgetSetting = require('../models/budgetsetting')

budgetSettingsRouter.get('/', async (request, response, next) => {
    const settings = await BudgetSetting.find({})
    response.json(settings.map(s => s.toJSON())) 
})

budgetSettingsRouter.post('/', async (request, response) => {
    const body = request.body

    const budgetSetting  = new BudgetSetting({
        income: body.Income,
        savings: body.Savings
    })

    const savedBudgetSetting = await budgetSetting.save()
    response.json(savedBudgetSetting.toJSON())

})

module.exports = budgetSettingsRouter