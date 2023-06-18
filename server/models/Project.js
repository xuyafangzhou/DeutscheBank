const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Project = new Schema(
    {
        name: {type: String},
        host: { type: mongoose.Schema.Types.ObjectId, ref: 'users' , required: true},
        team_members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    },
    { timestamps: true },
)

module.exports = mongoose.model('projects', Project)