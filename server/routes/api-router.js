const express = require('express')

const userRouter = require('./user-router')
const eventRouter = require('./event-router')
const templateRouter = require('./template-router')
const feedbackRouter = require('./feedback-router')
const projectRouter = require('./project-router')
const auth = require("../middlewares/auth")

const router = express.Router()

router.use('/user', userRouter)
router.use('/event', auth, eventRouter)
router.use('/feedback', auth, feedbackRouter)
router.use('/template', auth, templateRouter)
router.use('/project', auth, projectRouter)

module.exports = router