const express = require('express')
const cookieParser=require('cookie-parser');

const cors = require('cors')
var path = require('path')

const db = require('./db')

const apiRouter = require('./routes/api-router')
const auth = require('./middlewares/auth');
const User = require('./models/User')
const Event = require('./models/Event')

const app = express()
const port = 5000

app.use(cors())

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/', express.static(path.join(__dirname, './views')))

app.get('/', (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) {
            res.sendFile('./views/signin.html', { root: __dirname });
        }
        else {
            res.sendFile('./views/loggedin.html', { root: __dirname })
        }
    })   
})

app.get('/signup', (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) {
            res.sendFile('./views/signup.html', { root: __dirname })
        }
        else {
            res.redirect('/')
        }
    })
    
})

app.get('/signin', (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) {
            res.sendFile('./views/signin.html', { root: __dirname })
        }
        else {
            res.redirect('/')
        }
    })
})

app.get('/events/join', auth, (req, res) => {
    res.sendFile('./views/join_event.html',{ root: __dirname })
})

app.get('/events/create', auth, (req, res) => {
    res.sendFile('./views/create_event.html',{ root: __dirname })
})

app.get('/events/:eventCode', auth, (req, res) => {
    Event.findOne({_id: req.params.eventCode}, (err, event) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!event) {
            return res
                .status(404)
                .json({ success: false, error: "Event not found" })
        }
        if (req.user._id.equals(event.host)) {
            res.sendFile('./views/manage_event.html',{ root: __dirname })
        } else {
            return res
            .status(404)
            .json({ success: false, error: "You are not authorised" })
        }
    }).catch(err => console.log(err))
    // If eventCode exists
        // If user is host of event:
            // res.sendFile('./views/manage_event.html',{ root: __dirname })
        // Else:
            // user isn't authorised 
    // Else:
        // event not found 
})

app.use('/api', apiRouter)

app.listen(port, () => console.log(`Server running on port ${port}`))
