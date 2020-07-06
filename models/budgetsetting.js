const mongoose = require('mongoose')
/*TODO 
1. Estä uusien asetusten luominen
2. Mahdollisuus päivittää asetuksia
*/

const budgetSetting = new mongoose.Schema({
    income: Number,
    savings: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expenses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Expense'
        }
    ]
})

budgetSetting.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('BudgetSetting', budgetSetting)