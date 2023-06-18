const express = require('express')

const ProjectCtrl = require('../controllers/project-ctrl')
const Project = require('../models/Project')

const router = express.Router()

router.post('/new', ProjectCtrl.createProject)
router.post('/join/:projectID', ProjectCtrl.join)
router.post('/leave/:projectID', ProjectCtrl.leave)
router.get('/projects', ProjectCtrl.getProjects)
router.get('/:projectID', ProjectCtrl.getProjByID)
router.get('/:projectID/events', ProjectCtrl.getProjectEvents)

module.exports = router