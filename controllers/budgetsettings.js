//API Endpointit kuukausibudgetin määrittelyä varten

const budgetSettingsRouter = require('express').Router()
const BudgetSetting = require('../models/budgetsetting')

budgetSettingsRouter.get('/', async (request, response) => {
    const settings = await BudgetSetting.find({})
    response.json(settings.map(s => s.toJSON())) 
})

budgetSettingsRouter.post('/', async (request, response, next) => {

    const body = request.body

    const budgetSetting  = new BudgetSetting({
        income: body.Income,
        savings: body.Savings
    })
    try{
        const savedBudgetSetting = await budgetSetting.save()
        response.toJSON(savedBudgetSetting.toJSON())
    }catch (e) {
        next(e)
    }

})

module.exports = budgetSettingsRouter