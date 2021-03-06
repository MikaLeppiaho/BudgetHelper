const logger = require('./logger')

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unkown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'Validationerror') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'invalid token' })
    }

    logger.error(error.message)

    next(error)
}

const tokenExtractor = (request, response, next) => {
    
    const authorization = request.get('authorization')
    if ( authorization && authorization.toLowerCase().startsWith('bearer')) {
      request.token = authorization.substring(7)
    }
next()
}


module.exports = {
    tokenExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler
}