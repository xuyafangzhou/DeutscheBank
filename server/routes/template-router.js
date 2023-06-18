const express = require('express')

const TemplateCtrl = require('../controllers/template-ctrl')

const router = express.Router()

router.post('/', (req, res)=>{
    return res.status(200).json({
        success: true
    })
})

module.exports = router