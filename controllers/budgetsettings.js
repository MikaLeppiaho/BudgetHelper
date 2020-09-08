//API Endpointit kuukausibudgetin määrittelyä varten

const budgetSettingsRouter = require('express').Router()
const BudgetSetting = require('../models/budgetsetting')
const DailyBudget = require('../models/dailybudget')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Expense = require('../models/expense')

//
//Hae käyttäjän budgettiasetukset
//
budgetSettingsRouter.get('/', async (request, response) => {
  //Tarkistetaan käyttäjä tokenin avulla
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const settings = await BudgetSetting.findOne({
    user: decodedToken.id
  }).populate('expenses', {
    description: 1,
    amount: 1
  })
  if (!settings) {
    response.json('haloo?')
  } else {
    response.json(settings)
  }
})

//
//Poista käyttäjän budgettiasetukset
//
budgetSettingsRouter.delete('/', async (request, response) => {
  const settings = await BudgetSetting.deleteMany({})
  const dailys = await DailyBudget.deleteMany({})
  const expenses = await Expense.deleteMany({})
  response.status(204).end()
})

//
//Hae käyttäjän budgettiasetukset id parametrillä
//
budgetSettingsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const settings = await BudgetSetting.findOne({
    user: id
  }).populate('expenses', { description: 1, amount: 1 })
  response.json(settings)
})

budgetSettingsRouter.post('/', async (request, response, next) => {
  const body = request.body

  //Tarkistetaan käyttäjä tokenin avulla
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    const user = await User.findById(decodedToken.id)
    const doc = await BudgetSetting.findOne({ user: decodedToken.id })
    let savedBudgetSetting = {}
    if (!doc) {
      // uuden budgettiasetuksen objekti
      const budgetSetting = new BudgetSetting({
        income: body.income,
        savings: body.savings,
        dailyBudget: ((body.income - body.income * body.savings) / 30).toFixed(
          2
        ),
        user: decodedToken.id
      })

      //Luodaan budgetti asetus ja linkataan se käyttäjän kanssa.
      savedBudgetSetting = await budgetSetting.save()
    } else {
      doc.income = body.income
      doc.savings = body.savings
      doc.dailyBudget = (
        (body.income - body.income * body.savings) /
        30
      ).toFixed(2)
      doc.user = decodedToken.id
      savedBudgetSetting = await doc.save()
    }

    await user.save()

    response.json(savedBudgetSetting.toJSON())
  } catch (e) {
    next(e)
  }
})

module.exports = budgetSettingsRouter
