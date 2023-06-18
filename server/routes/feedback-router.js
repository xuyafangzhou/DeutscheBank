const express = require('express')

const FeedbackCtrl = require('../controllers/feedback-ctrl')

const router = express.Router()

router.post('/new/', FeedbackCtrl.submitFeedback)

module.exports = router