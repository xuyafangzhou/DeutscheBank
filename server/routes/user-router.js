const express = require('express')

const UserCtrl = require('../controllers/user-ctrl')
const auth = require('../middlewares/auth')


const router = express.Router()

router.post('/login', UserCtrl.login)
router.post('/logout', auth, UserCtrl.logout)
router.post('/new', UserCtrl.createUser)


module.exports = router