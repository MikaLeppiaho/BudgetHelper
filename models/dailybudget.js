const mongoose = require('mongoose')

const dailyBudget = new mongoose.Schema({
  date: Date,
  dailyExpenses: [{ category: { type: String }, amount: { type: Number } }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

dailyBudget.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('DailyBudget', dailyBudget)
