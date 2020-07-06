//API Endpointit kuukausibudgetin määrittelyä varten

const budgetSettingsRouter = require('express').Router()
const BudgetSetting = require('../models/budgetsetting')
const DailyBudget = require('../models/dailybudget')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const tools = require('../utils/tools')
const Expense = require('../models/expense')

//
//Hae kaikki budgettiasetukset
//
budgetSettingsRouter.get('/', async (request, response) => {
    const settings = await BudgetSetting.find({}).populate('expenses', {description: 1, amount: 1})
    response.json(settings.map(s => s.toJSON())) 
})
//
//Poist käyttäjän budgettiasetukset
//
budgetSettingsRouter.delete('/', async (request, response) => {
    const settings = await BudgetSetting.deleteMany({})
    const dailys = await DailyBudget.deleteMany({})
    const expenses = await Expense.deleteMany({})
    response.status(204).end() 
})

//
//Hae käyttäjän budgettiasetukset
//
budgetSettingsRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    console.log('id: ',id)
    const settings = await BudgetSetting.findOne({user: id}).populate('expenses', {description: 1, amount: 1})
    response.json(settings)
})

//
//Lisää budgetti asetus. Lisäksi endpoint lisää kuluvalle kuukauden jäljelläoleville
//päiville käytettävissä olevan budgettimäärän. Määrää päivitetään säännöllisten menojen päivittyess
//ja TODO listalla vähentää käyttäjän syöttämän päivän rahakulujen mukaan

budgetSettingsRouter.post('/', async (request, response, next) => {
    const body = request.body
//Tarkistetaan käyttäjä tokenin avulla
    console.log('RequestToken: ', request.token)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    console.log('Decoded id: ', decodedToken.id)
    const user = await User.findById(decodedToken.id)
    console.log("Awaited user:", user)


    const budgetSetting  = new BudgetSetting({
        income: body.income,
        savings: body.savings,
        user: user._id
    })

    try {
        //Luodaan budgetti asetus ja linkataan se käyttäjän kanssa. 
        const savedBudgetSetting = await budgetSetting.save()
        user.budgetSettings = budgetSetting._id
        await user.save()

        const settings = await BudgetSetting
        .findOne({user: user._id})
       
        console.log('Settings', settings)
        const daysLeft = tools.daysToEndOfMonth(tools.todaysDate())

        //Luo jäljellä olevalle kuukaudelle uusi päivittäinen käyttömäärä
        for(i = 0; i < daysLeft; i++){

            const dailyBudget = new DailyBudget({
                date:  tools.incrementDateToEndOfMonth(i,tools.todaysDate()),
                dailyBudget: (settings.income / daysLeft).toFixed(2),
                user: user._id
            })

        const savedDailyBudget = await dailyBudget.save()
        await user.save()

        console.log('Daily Budget: ', dailyBudget.toString())
    }
        response.json(savedBudgetSetting.toJSON())

    }catch (e) {
        next(e)
    }




})

module.exports = budgetSettingsRouter