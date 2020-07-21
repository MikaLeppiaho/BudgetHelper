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
    console.log('id: ',id)
    const settings = await BudgetSetting.findOne({user: id}).populate('expenses', {description: 1, amount: 1})
    response.json(settings)
})


//Lisää budgettiasetus. Lisäksi endpoint lisää kuluvalle kuukauden jäljelläoleville
//päiville käytettävissä olevan budgettimäärän. Määrää päivitetään säännöllisten menojen päivittyess
//ja TODO listalla vähentää käyttäjän syöttämän päivän rahakulujen mukaan
//TODO Tarkista, että ei tule lisättyä uutta budgettiasetusta, jos semmoinen jo löytyy!

budgetSettingsRouter.post('/', async (request, response, next) => {
    const body = request.body

    //Tarkistetaan käyttäjä tokenin avulla
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

   const user = await User.findById(decodedToken.id)

    try {

        // uuden budgettiasetuksen objekti
        const budgetSetting  = new BudgetSetting({
            income: body.income,
            savings: body.savings,
            dailyBudget: ((body.income - (body.income*body.savings))/30).toFixed(2),
            user: decodedToken.id
        })

        //Luodaan budgetti asetus ja linkataan se käyttäjän kanssa. 
        const savedBudgetSetting = await budgetSetting.save()
        user.budgetSettings = budgetSetting._id
        await user.save()
        
        response.json(savedBudgetSetting.toJSON())

    }catch (e) {
        next(e)
    }




})

module.exports = budgetSettingsRouter