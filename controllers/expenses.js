const expensesRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Expense = require('../models/expense')
const BudgetSetting = require('../models/budgetsetting')
const DailyBudget = require('../models/dailybudget')

const tools = require('../utils/tools')

expensesRouter.post('/', async (request, response, next ) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const budgetSetting = await BudgetSetting.findOne({user:decodedToken.id})

    console.log("budgetSetting", budgetSetting)
    const newExpense = new Expense({
        description: body.description,
        amount: body.amount,
        budgetSetting: budgetSetting._id
    })
    try{
        const savedExpenses = await newExpense.save()
        budgetSetting.expenses = budgetSetting.expenses.concat(newExpense._id)
        await budgetSetting.save()

        //Päivitä kuukauden budgetit
        const dailyBudget = await DailyBudget.find({ date: tools.todaysDate() })
        const budgetExpenses = await BudgetSetting.findOne({user:decodedToken.id}).populate('expenses',{amount:1})
        
        console.log("dailyBudget: ", dailyBudget)
        console.log("budgetExpenses: ", budgetExpenses.expenses)
        
        const totalExpenses = budgetExpenses.expenses.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount, 0
        )
        console.log('Total Expenses',totalExpenses)
       
        console.log('Settings', budgetExpenses)
        const daysLeft = tools.daysToEndOfMonth(new Date())

        //Luo jäljellä olevalle kuukaudelle uusi päivittäinen käyttömäärä
        for(i = 0; i < daysLeft; i++){

            const dailyBudget ={
                dailyBudget: ((budgetExpenses.income - totalExpenses) / daysLeft).toFixed(2)
            }

        const updateDailyBudget = await DailyBudget.findOneAndUpdate({
            date: tools.incrementDateToEndOfMonth(i, tools.todaysDate())},
            dailyBudget,
            {new: true, useFindAndModify: false}
        )

        const updatedDaily = await DailyBudget.findOne({date: tools.incrementDateToEndOfMonth(i, tools.todaysDate())})
        console.log('Daily Budget: ', updatedDaily)
    }

        response.json(savedExpenses.toJSON())
    } catch (e) {
        next(e)
    }
})

module.exports = expensesRouter