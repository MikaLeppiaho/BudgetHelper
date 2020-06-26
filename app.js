const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const budgetSettingsRouter = require('./controllers/budgetsettings')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('Connecting to', config.MONGODBURI)

//Yhdistä MongoDB
getConnection = async () =>  {
    try{
        await mongoose.connect(config.MONGODBURI, { useCreateIndex:true, useNewUrlParser: true, useUnifiedTopology: true})
        console.log(`Connection to database succesfull`)
    } catch (err) {
        console.log(`Connection to database failed ${config.MONGODBURI}`)
    }
}
getConnection()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
//REST Endpointit
app.use('/api/budgetsettings', budgetSettingsRouter)
//Middlewaret
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.express = app