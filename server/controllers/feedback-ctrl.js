const Feedback = require('../models/Feedback')

//adds submitted feedback to the database
submitFeedback = (req, res) => {
    const body = req.body
    //if no data is provided, return an error
    if (!body) {
        return res.status(400).json({
            sucess: false,
            error: "You must provide data"
        })
    }
    const user = req.user
    const name = req.user.name
    const event = req.body.eventID
    const mood = req.body.mood
    const content = req.body.content

    //create new feedback document
    let feedback = new Feedback({name: name, user: user, event: event, mood: mood, content: content})
    //if the feedback is anonymous, set the user's name to anonymous
    if (body.isAnonymous=="true") {
        feedback = new Feedback({name: "Anonymous", user: user, event: event, mood: mood, content: content})
    } 
        if (!feedback) {
        return res.status(400).json({
            sucess: false,
            error: "Failed to create feedback"
        })
    }
    //save the new feedback to the database
    feedback
        .save()
        .then(()=>{
            return res.status(201).json({
                success: true,
                id: feedback._id,
                message: 'Feedback created'
            })
         })
         .catch(error=>{
             return res.status(400).json({
                 error,
                 message:'Feedback creation failed'
             })
         })
}



module.exports = {
    submitFeedback,
}