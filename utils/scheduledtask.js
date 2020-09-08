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

  return newBudget(remaining)
}

const createBudgetForUser = async (user) => {
  const settings = await BudgetSetting.findOne({
    user: user
  }).populate('expenses', {
    description: 1,
    amount: 1
  })
  if (
    !(await DailyBudget.findOne({
      user: decodedToken.id,
      date: tools.todaysDate(new Date())
    }))
  ) {
    const dailyBudgetResponse = new DailyBudget({
      date: tools.todaysDate(new Date()),
      user: user
    })

    dailyBudgetResponse.save()
    return dailyBudgetResponse
  }
}

var job = new CronJob(
  '1 1 1 * * *',
  async () => {
    const users = (await User.find({})).map((user) => user.id)
    newBudget(users)
  },
  null,
  true,
  'Europe/Helsinki'
)

module.exports = job
