const Event = require('../models/Event')
const Feedback = require('../models/Feedback')
//threshold used to determine if feedback is similar
const similarityThreshold = 0.4
const similarity = require('sentence-similarity')
const similarityScore = require('string-similarity')
const winkOpts = { f: similarityScore.compareTwoStrings, options : {threshold: 0} }

//adds an event to the database
createEvent = (req, res) => {
    const body = req.body
    //check if data has been provided with the request
    if (!body) {
        return res.status(400).json({
            sucess: false,
            error: "You must provide data"
        })
    }
    //create new Event document
    const event = new Event({
        name: body.name, 
        host: req.user._id, 
        allowsAnonymous: body.allowsAnonymous,
    })
    //check for an error when creating the event
    if (!event) {
        return res.status(400).json({
            sucess: false,
            error: "Failed to create event"
        })
    }
    //add the event to the list of the users events
    event
        .save()
        .then(()=>{
            req.user.events.push(event._id);
            return res.status(201).json({
                success: true,
                id: event._id,
                message: 'Event created'
            })
         })
         .catch(error=>{
             console.log(error);
             return res.status(400).json({
                success: false,
                error:'Event creation failed'
             })
         })
}

//joins a user to the requested event by ID
joinEvent = async (req, res) => {
    //find the relevant event
    await Event.findOne({_id: req.params.eventID}, (err, event) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if it doesn't exist, return an error to the user
        if (!event) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        //if the user is already part of the event, don't add them again
        if (event.members.includes(req.user._id)) {
            return res
                .status(400)
                .json({ success: false, error: "Already joined event" })
        }
        //if the user is hosting the event, don't add them as an attendee
        if (event.host.equals(req.user._id)) {
            return res
                .status(400)
                .json({ success: false, error: "Cant join event your hosting" })
        }
        //otherwise add the user to the list of members for that event
        event.members.push(req.user._id);
        event.save().then(()=>{
            req.user.events.push(event._id);
            req.user.save().then(()=>{
                return res.status(200).json({success:true})
            });
        })
        
    }).catch(err => console.log(err))
}

//removes a user from the member list for an event
leaveEvent = async (req, res) => {
    //find the relevant event
    await Event.findOne({_id: req.params.eventID}, (err, event) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if event does't exist, return an error
        if (!event) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        //remove user from list of event members
        if (event.members.includes(req.user._id)) {
            event.members.remove(req.user._id)
            event.save().then(()=>{
                req.user.events.remove(event._id);
                req.user.save().then(()=>{
                    return res.status(200).json({success:true})
                })
            })
        //if the user isn't a member of the event return an error
        } else {
            return res.status(400).json({success: false, error: "You are not member of this event"})
        }
    }).catch(err => console.log(err))
}

//deletes an existing event
deleteEvent = async (req, res) => {
    //find and delete the relevant event
    await Event.deleteOne({_id: req.params.eventID}, (err, event) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if event does't exist, return an error
        if (!event) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        return res.status(200).json({ success: true})
    }).catch(err => console.log(err))
}

//fetch an event by ID
getEventByID = async (req, res) => {
    //find the relevant event
    await Event.findOne({_id: req.params.eventID}, (err, event) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if event does't exist, return an error
        if (!event) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        //return the event to the user
        return res.status(200).json({ success: true, data: event})
    }).catch(err => console.log(err))
}

//fetch list of users joined and hosted events
getEvents = async (req, res) => {
    //find all events with user as host
    await Event.find({host: req.user._id}, (err, hostedEvents) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!hostedEvents) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        
        //find all events which include the user as a member
        Event.find({ "_id": { "$in": req.user.events}}, (err2, events)=>{
            //return both lists
            return res.status(200).json({ success: true, hostedEvents: hostedEvents, events: events})
        })
    }).catch(err => console.log(err))
    
}

//fetches all feedback for requested event
getAllFeedback = async (req, res) => {
    //find feedback for event by ID
    await Feedback.find({event: req.params.eventID}, (err, feedback) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!feedback) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found"})
        }
        //return the list of feedback
        return res.status(200).json({ success: true, data: feedback})
    }).catch(err => console.log(err))
}

//returns list of similar feedback for an event
getAllSimilarFeedback = async (req, res) => {
    return res.status(200).json({
        success: true
    })
}

//returns list of feedback similar to the one requested by ID
getSimilarFeedbackByID = async (req, res) => {
    //find the requested feedback
    await Feedback.findOne({_id: req.params.feedbackID}, (err, feedback) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if the feedback doesn't exist, return an error
        if (!feedback) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found"})
        }
        //find all feedback sent in the same event as the one requested
        Feedback.find({_id: {$ne: feedback._id}, eventID: feedback.eventID}, (err2, event_feedback) => {
            if (err2) {
                return res.status(400).json({ success: false, error: err })
            }
            //compare each feedback and keep track of those that have a similarity greater than the threshold
            const similarFB = []
            //splitting the sentence into words is necessary for the sentence similarity library
            const s1 = feedback.content.split(' ')
            for (let x of event_feedback){
                let s2 = x.content.split(' ')
                //calculate the similarity
                let res = similarity(s1,s2,winkOpts)
                //if feedback is close enough, keep it
                if (res.exact*res.order*res.size > similarityThreshold){
                    similarFB.push(x)
                }
            }
            //return the list of similar feedback
            return res.status(200).json({ success: true, data: similarFB})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
}

module.exports = {
    createEvent,
    joinEvent,
    leaveEvent,
    deleteEvent,
    getEventByID,
    getEvents,
    getAllFeedback,
    getAllSimilarFeedback,
    getSimilarFeedbackByID
}
