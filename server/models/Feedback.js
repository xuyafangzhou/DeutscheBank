const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Feedback = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'events', required: true },
        mood: { type: Number, required: true },
        content: { type: String, required: true },
        //name is set to 'anonymous' if feedback is anonymous
        name: { type: String, required: true },
    },
    { timestamps: true },
)

module.exports = mongoose.model('feedback', Feedback)