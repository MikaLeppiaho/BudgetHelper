const dailyBudgetRouter = require('express').Router()
const mongoose = require('mongoose')
const DailyBudget = require('../models/dailybudget')
const BudgetSetting = require('../models/budgetsetting')
const tools = require('../utils/tools')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)

//Hakee käyttäjän päivittäisen budgetin
dailyBudgetRouter.get('/', async (request, response) => {
  console.log('trying to get daily budget!')
  try {
    //Middlewaren kautta lisätään request parametriin käyttäjän token.
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token missing or invalid' })
    }

    //Tarkistetaan onko käyttäjälle tallentunut päivittäinen budgetti vai tarvitaanko uusi
    if (
      !(await DailyBudget.findOne({
        user: decodedToken.id,
        date: tools.todaysDate(new Date())
      }))
    ) {
      console.log('new daily!')
      const newDailyBudget = new DailyBudget({
        date: tools.todaysDate(new Date()),
        user: decodedToken.id
      })

      newDailyBudget.save()
    }

    console.log(decodedToken)
    console.log('Today is: ', tools.todaysDate(new Date()))

    const budgetSettings = await BudgetSetting.findOne({
      user: decodedToken.id
    }).populate('expenses', { description: 1, amount: 1 })

    const dailyExpenses = await DailyBudget.findOne({
      user: decodedToken.id,
      date: tools.todaysDate(new Date())
    })

    console.log(budgetSettings)
    /*const dailyBudget = await DailyBudget.findOne({
      user: decodedToken.id
    })*/

    const calcDailyBudget = (budgetSettings) => {
      let initialExpenses = 0
      const totalExpenses = budgetSettings.expenses.reduce(
        (accumulator, currentValue) => accumulator + currentValue.amount,
        initialExpenses
      )

      let initialDailyExpenses = 0
      const totalDailyExpenses = dailyExpenses.dailyExpenses.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initialDailyExpenses
      )
      console.log(totalDailyExpenses)

      const dailyBudget =
        (budgetSettings.income -
          budgetSettings.income * budgetSettings.savings -
          totalExpenses) /
          30 -
        totalDailyExpenses
      return dailyBudget.toFixed(2)
    }

    const returnedDailyBudget = {
      dailyBudget: calcDailyBudget(budgetSettings)
    }

    response.json(returnedDailyBudget)
  } catch (e) {
    console.log('failed :S')
    response.json(400)
  }
})

dailyBudgetRouter.put('/:id', async (request, response) => {
  //Ota dailybudgetti ja vähennä requestissä oleva summa
  //Dekoodaa pyynnön mukana tullut token, jotta voi käyttää käyttäjän ID:tä tietokantakyselyissä
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token missing or invalid' })
  }
  const body = request.body

  await DailyBudget.updateOne(
    {
      user: decodedToken.id,
      date: tools.todaysDate(new Date())
    },
    { $push: { dailyExpenses: [body.dailyBudget] } }
  )
  console.log(decodedToken.id)
  //Lisätään cronjobin luomaan tauluun päiväkohtaisesti uusi, päivän aikana tehty kulu
  console.log(tools.todaysDate(new Date()))
  console.log('daily: ', body.dailyBudget)
  //const response = await DailyBudget.updateOne({})

  response.json(body)
})

module.exports = dailyBudgetRouter
