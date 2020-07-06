const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    budgetSetting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BudgetSetting'
    }
})

expenseSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Expense = mongoose.model('Expense', expenseSchema)

module.exports = Expense