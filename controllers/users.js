const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const BudgetSetting = require('../models/budgetsetting')
const mongoose = require('mongoose')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  //create a new user and add a budgetsetting
  const user = new User({
    username: body.username,
    name: body.name,
    email: body.email,
    passwordHash
  })
  const savedUser = await user.save()

  const budgetSetting = new BudgetSetting({
    income: 0,
    savings: 0,
    dailyBudget: 0,
    user: savedUser._id
  })
  savedBudgetSetting = await budgetSetting.save()

  response.json(savedUser)
})

module.exports = usersRouter
