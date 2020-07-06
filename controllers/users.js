const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const mongoose = require('mongoose')



usersRouter.post('/', async (request, response) => {
    const body = request.body
    
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        email: body.email,
        passwordHash
    })

    const savedUser = await user.save()

    response.json(savedUser)
})

module.exports = usersRouter