const express = require('express')

const EventCtrl = require('../controllers/event-ctrl')

const router = express.Router()

router.post('/new', EventCtrl.createEvent)
router.post('/leave/:eventID', EventCtrl.leaveEvent)
router.post('/join/:eventID', EventCtrl.joinEvent)

router.delete('/delete/:eventID', EventCtrl.deleteEvent)
router.get('/events', EventCtrl.getEvents)
router.get('/:eventID', EventCtrl.getEventByID)
router.get('/:eventID/feedback/', EventCtrl.getAllFeedback) // will be used to populate live feed as well as to generate data for graphs
/*
[
    {name:'Bob', msg:'This is too slow', sentiment: 0.3, id:10, timestamp:..., similarFeedback:true,},
    {name:'Dan', msg:'Great job', sentiment: 0.8,id:5, timestamp:..., similarFeedback:false},
]
*/
router.get('/:eventID/feedback/similar', EventCtrl.getAllSimilarFeedback)
/*
[
    [
        {name:'Bob', msg:'This is too slow', sentiment: 0.3, id:10, timestamp:..., similarFeedback:true,},
        {name:'Jim', msg:'very slow', sentiment: 0.8,id:5, timestamp:..., similarFeedback:false},
    ],
    [
        {name:'Dave', msg:'Well done', sentiment: 0.3, id:10, timestamp:..., similarFeedback:true,},
        {name:'Bob', msg:'Great job', sentiment: 0.8,id:5, timestamp:..., similarFeedback:false},
    ],
]
*/
router.get('/:eventID/feedback/similar/:feedbackID', EventCtrl.getSimilarFeedbackByID)
/*
[
    {name:'Bob', msg:'This is too slow', sentiment: 0.3, id:10, timestamp:..., similarFeedback:true,},
    {name:'Jim', msg:'very slow', sentiment: 0.8,id:5, timestamp:..., similarFeedback:false},
]
*/




module.exports = router