const dailyBudgetRouter = require('express').Router()
const mongoose = require('mongoose')
const DailyBudget = require('../models/dailybudget')
const tools = require('../utils/tools')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)

dailyBudgetRouter.get('/', async (request, response) => {

    try {
        //Middlewaren kautta lisätään request parametriin käyttäjän token. 
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'Token missing or invalid'})
        }
        console.log('Today is: ', tools.todaysDate())
        const dailyBudget = await DailyBudget.findOne({date : tools.todaysDate(), user: decodedToken.id})
        response.json(dailyBudget)
    } catch (e) {
        response.json(400)
    }
   
})

dailyBudgetRouter.put('/:id', async (request, response) => {
//TODO Ota dailybudgetti ja vähennä requestissä oleva summa
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'Token missing or invalid'})
    }
    const body = request.body

    console.log("amount: ", body.amount)
    console.log(`${request}`) 
    const dailyBudget = await DailyBudget.findById(request.params.id)
    const newDaily = {
        dailyBudget: dailyBudget.dailyBudget - body.amount 
    }
    console.log("newDaily: ",newDaily)
    const updateDailyBudget = await DailyBudget.findByIdAndUpdate(request.params.id, newDaily, {new: true})

    response.json(updateDailyBudget)
})


module.exports = dailyBudgetRouter