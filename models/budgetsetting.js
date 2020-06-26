var mongoose = require('mongoose')
var Schema = mongoose.Schema



budgetSetting = new Schema({
    income: Number,
    savings: Number,
    
})

budgetSetting.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('BudgetSetting', budgetSetting)