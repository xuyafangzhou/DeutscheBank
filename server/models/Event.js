const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Event = new Schema(
    {
        name: {type: String, required: true},
        host: { type: mongoose.Schema.Types.ObjectId, ref: 'users' , required: true},
        // If project is null, then the event isn't part of a project
        // (currently not in use as project requirement has been dropped)
        // project: { type: mongoose.Schema.Types.ObjectId, ref: 'projects' },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        feedback:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'feedback' }],
        date: { type: Date, required: true, default: Date.now },
        allowsAnonymous: { type: Boolean, default: false},        
    },
    { timestamps: true },
)

module.exports = mongoose.model('events', Event)