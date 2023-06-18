const Project = require('../models/Project')
const Event = require('../models/Event')

//adds new project to the database
createProject = (req, res) => {
    //create new project document with no team-members
    const project = new Project({name: req.body.name, host: req.user._id, team_members: []})
    if (!project) {
        return res.status(400).json({
            sucess: false,
            error: "Failed to create project"
        })
    }
    //save the new project to the database
    project
        .save()
        .then(()=>{
            return res.status(201).json({
                success: true,
                id: project._id,
                message: 'Project created'
            })
         })
         .catch(error=>{
             return res.status(400).json({
                 error,
                 message:'Project creation failed'
             })
         })
}

//add the user to the list of team-members for the requested project by ID
join = async (req, res) => {
    //find the relevant project
    await Project.findOne({_id: req.params.projectID}, (err, project) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if the project doesn't exist, return an error
        if (!project) {
            return res
                .status(404)
                .json({ success: false, error: `Project not found` })
        }
        //add the user to the list of team members for the project
        project.team_members.push(req.user._id)
        //save the change to the database
        project.save()
        return res.status(200).json({success: true})
    }).catch(err => console.log(err))
}

//remove a user from the list of team-members for a project
leave = async (req, res) => {
    //find the relevant project
    await Project.findOne({_id: req.params.projectID}, (err, project) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if the project doesn't exist, return an error
        if (!project) {
            return res
                .status(404)
                .json({ success: false, error: `Project not found` })
        }
        //remove the user from the list of team members for the project
        const index = project.team_members.indexOf(req.user._id);
        //if the user is a team-member of the project, remove them from the list
        if (index > -1) {
            project.team_members.splice(index, 1);
        }
        //save the change to the database
        project.save()
        return res.status(200).json({success: true})
    }).catch(err => console.log(err))
}

//fetches a project by ID
getProjByID = async (req, res) => {
    //find the relevant project
    await Project.findOne({_id: req.params.projectID}, (err, project) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //if the project doesn't exist, return an error
        if (!project) {
            return res
                .status(404)
                .json({ success: false, error: `Project not found` })
        }
        return res.status(200).json({ success: true, data: project})
    }).catch(err => console.log(err))
}

//fetch the list of hosted and joined events for the user
getProjects = async (req, res) => {
    //get hosted projects
    await Project.find({host: req.user._id}, (err, hosted_projects) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        //get projects in which the user is a team-member
        Project.find({team_members: { $all: [req.user._id]}}, (err, joined_projects) => {
            if (err) {
                return res.status(400).json({ success: false, error: err })
            }
            //return both lists of projects
            return res.status(200).json({ success: true, hosted: hosted_projects, joined: joined_projects})
        })
    }).catch(err => console.log(err))
}

//fetch the list of events that are in a project by ID
getProjectEvents = async (req,res) => {
    //find all events which are part of the requested project
    await Event.find({project: req.params.projectID}, (err, events) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        //return the list of events
        return res.status(200).json({ success: true, data: events})
    }).catch(err => console.log(err))
}

module.exports = {
    createProject,
    join,
    leave,
    getProjByID,
    getProjects,
    getProjectEvents
}
