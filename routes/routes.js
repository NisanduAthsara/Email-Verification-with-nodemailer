const express = require('express')
const app = express.Router()
const {signup,login} = require('../controller/user.loginSignup')
const {checkUserToken} = require('../controller/user.auth')
const {newVerification,checkVerification} = require('../controller/verification')

app.post('/signup',signup)
app.post('/login',login)
app.post('/checkUserToken',checkUserToken)
app.put('/newVerification',newVerification)
app.post('/checkVerification',checkVerification)

module.exports = app