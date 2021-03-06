const expensesRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Expense = require('../models/expense')
const BudgetSetting = require('../models/budgetsetting')
const DailyBudget = require('../models/dailybudget')

const tools = require('../utils/tools')

expensesRouter.get('/', async (request, response, next) => {
  const settings = await Expense.find({})
  response.json(settings.map((s) => s.toJSON()))
})

//Lisää uusi kuukausittainen meno
expensesRouter.post('/', async (request, response, next) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    //lisää kuukausittainen summa tietokantaan ja linkitä se käyttäjän budgetSettings malliin.
    const budgetSetting = await BudgetSetting.findOne({
      user: decodedToken.id
    })

    const newExpense = new Expense({
      description: body.description,
      amount: body.amount,
      budgetSetting: budgetSetting._id
    })

    const savedExpenses = await newExpense.save()
    budgetSetting.expenses = budgetSetting.expenses.concat(newExpense._id)

    const expensesByBudgetSetting = await Expense.find({
      budgetSetting: budgetSetting.id
    })

    const initialValue = 0
    const totalExpenses = (
      expensesByBudgetSetting.reduce(
        (acc, cur) => acc + cur.amount,
        initialValue
      ) / 30
    ).toFixed(2)

    budgetSetting.dailyBudget =
      (budgetSetting.income - budgetSetting.savings * budgetSetting.income) /
        30 -
      totalExpenses
    await budgetSetting.save()

    response.json(savedExpenses.toJSON())
  } catch (e) {
    next(e)
  }
})

//Poista kuukausittainen meno
expensesRouter.delete('/:id', async (request, response) => {
  try {
    const result = await Expense.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (err) {
    response.status(500).end()
  }
})

module.exports = expensesRouter
