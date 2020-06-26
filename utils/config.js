require('dotenv').config()

let PORT = process.env.PORT
let MONGODBURI = process.env.MONGODBURI

module.exports = {
    MONGODBURI,
    PORT
}