require('dotenv').config()

let PORT = process.env.PORT
let MONGODBURI = process.env.MONGODBURI
if (process.env.NODE_ENV === 'development') {
  MONGODBURI = process.env.MONGODBDEVURI
}

module.exports = {
  MONGODBURI,
  PORT
}
