//Hae käyttäjien id:t taulukkoon
//Käydään rekursiivisesti taulukko läpi, haetaan käyttäjän budgettiasetukset
//ja luodaan käyttäjille päivittäinen budgettitaulukko tietokantaan.

const CronJob = require('cron').CronJob
const mongoose = require('mongoose')
const BudgetSetting = require('../models/budgetsetting')
const DailyBudget = require('../models/dailybudget')
const User = require('../models/user')
const tools = require('./tools')

const newBudget = (users) => {
  const [first, ...remaining] = users
  createBudgetForUser(first)

  return remaining.length ? newBudget(remaining) : console.log('Done')
}

const calcTotalExpenses = (settings) => {
  return settings.expenses.reduce((acc, cur) => acc + cur.amount, 0)
}
const calcDailyBudget = (settings, totalExpenses) => {
  return (
    (settings.income - settings.income * settings.savings - totalExpenses) / 30
  )
}

const createBudgetForUser = async (user) => {
  const settings = await BudgetSetting.findOne({
    user: user
  }).populate('expenses', {
    description: 1,
    amount: 1
  })
  const dailyBudgetResponse = new DailyBudget({
    date: tools.todaysDate(new Date()),
    dailyBudget: parseFloat(
      calcDailyBudget(settings, calcTotalExpenses(settings)).toFixed(2)
    ),
    user: user
  })

  dailyBudgetResponse.save()
  return dailyBudgetResponse
}

var job = new CronJob(
  '1 1 1 * * *',
  async () => {
    console.log('You will see this message every ten second')
    const users = (await User.find({})).map((user) => user.id)

    newBudget(users)
  },
  null,
  true,
  'America/Los_Angeles'
)

module.exports = job
