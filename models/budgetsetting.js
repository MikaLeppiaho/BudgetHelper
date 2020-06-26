var mongoose = require('mongoose')
var Schema = mongoose.Schema



budgetSettingSchema = new Schema({
    income: Number,
    savings: Number,
    
})

budgetSettingSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('BudgetSetting', budgetSettingSchema)