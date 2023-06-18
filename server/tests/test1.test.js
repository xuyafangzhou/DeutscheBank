const app = require('../testserver')
const request = require('supertest')
const mongoose = require('mongoose')
const User = require('../models/User')
const Event = require('../models/Event')
const Project = require('../models/Project')
const Feedback = require('../models/Feedback')

/*
const express = require('express');
const app = express();
s
app.get('/', function(req, res) {
  res.status(200).json({ name: 'john' });
});
*/

beforeAll(async () => {
  const url = `mongodb://127.0.0.1/testdatabase`
  await mongoose.connect(url, { useNewUrlParser: true })
})

afterAll(async () => {
  await mongoose.connection.close()
})

it('test to see if Jest works', () => {
    expect(1).toBe(1);
})

describe('Testing GETs for html pages', () => {
  var token;
  var userID;
  var user2ID;
  var eventID;
  var event2ID;

  beforeAll(async () => {
    // populate database
    // create users
    const user = new User({
      name: 'John',
      email: 'test@gmail.com',
      password: '123456'
    })
    await user.save().then(() => {
      user.generateToken((err,user)=>{
        if (err) throw err;
        token = user.token;
      })
    })
    token = user.token;
    userID = user._id;

    const user2 = new User({
      name: 'Jane',
      email: 'test2@gmail.com',
      password: '654321'
    })
    await user2.save().then(() => {
      user2.generateToken((err,user)=>{
        if (err) throw err;
      })
    })
    user2ID = user2._id;

    // create event
    const event = new Event({
      name: 'test event',
      host: user._id,
      feedback: []
    })
    await event.save().then(() => {
      // add to user's events
      user.events.push(event._id);
    })
    eventID = event._id;

    const event2 = new Event({
      name: 'test event 2',
      host: user2._id,
      members: [user._id],
      feedback: []
    })
    await event2.save().then(() => {
      // add to user's events
      user2.events.push(event2._id);
      user.events.push(event2._id);
    })
    event2ID = event2._id;
  })

  afterAll(async () => {
    // clean up database
    await User.deleteMany();
    await Event.deleteMany();
    await Feedback.deleteMany();
    await Project.deleteMany();
  })

  it('GET /', async done => {
    const res = await request(app).get('/');
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /signup', async done => {
    const res = await request(app).get('/signup');
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /signin', async done => {
    const res = await request(app).get('/signin');
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /events/join', async done => {
    const res = await request(app).get('/events/join').set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /events/create', async done => {
    const res = await request(app).get('/events/create').set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /events/:eventCode (host)', async done => {
    const res = await request(app).get(`/events/${eventID}`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    done()
  })
  it('GET /events/:eventCode (attendee)', async done => {
    const res = await request(app).get(`/events/${event2ID}`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    done()
  })
})

describe('Testing GETs for database retrievals', () => {
  var token;
  var userID
  var eventID;
  var projectID;

  beforeAll(async () => {
    // populate database
    // create user
    const user = new User({
      name: 'John',
      email: 'test@gmail.com',
      password: '123456'
    })
    await user.save().then(() => {
      user.generateToken((err,user)=>{
        if (err) throw err;
        token = user.token;
      })
    })
    token = user.token;
    userID = user._id;

    // create event
    const event = new Event({
      name: 'test event',
      host: user._id,
      feedback: []
    })
    await event.save().then(() => {
      // add to user's events
      user.events.push(event._id);
    })
    eventID = event._id;
    // create feedback
    const feedback = new Feedback({
      event: event,
      mood: 0.5,
      content: 'test',
      name: 'Joe'
    })
    await feedback.save();
    // create project
    const project = new Project({
      name: 'test project',
      host: user
    })
    await project.save();
    projectID = project._id;
  })

  afterAll(async () => {
    // clean up database
    await User.deleteMany();
    await Event.deleteMany();
    await Feedback.deleteMany();
    await Project.deleteMany();
  })

  it('GET /api/event/events', async done => {
    const res = await request(app).get('/api/event/events').set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    User.find({token: token}, (err, user) => {
      Event.find({host: user}, (err, events) => {
        expect(res.body.hostedEvents).toEqual(JSON.parse(JSON.stringify(events)))
      })
    })
    done()
  })
  it('GET /api/event/:eventID', async done => {
    const res = await request(app).get(`/api/event/${eventID}`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    Event.findOne({_id: eventID}, (err, event) => {
      expect(res.body.data).toEqual(JSON.parse(JSON.stringify(event)))
    })
    done()
  })
  it('GET /api/event/:eventID/feedback', async done => {
    const res = await request(app).get(`/api/event/${eventID}/feedback`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    Feedback.find({event: eventID}, (err, feedback) => {
      expect(res.body.data).toEqual(JSON.parse(JSON.stringify(feedback)))
    })
    done()
  })
  it('GET /api/event/:eventID/feedback/similar', async done => {
    // TODO
    done()
  })
  it('GET /api/event/:eventID/feedback/similar/:feedbackID', async done => {
    // TODO
    done()
  })
  it('GET /api/project/projects', async done => {
    const res = await request(app).get('/api/project/projects').set('Cookie', `auth=${token}`);
    
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    User.find({token: token}, (err, user) => {
      Project.find({host: user}, (err, projects) => {
        expect(res.body.hosted).toEqual(JSON.parse(JSON.stringify(projects)))
      })
    })
    done()
  })
  it('GET /api/project/:projectID', async done => {
    const res = await request(app).get(`/api/project/${projectID}`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    Project.findOne({_id: projectID}, (err, project) => {
      expect(res.body.data).toEqual(JSON.parse(JSON.stringify(project)))
    })
    done()
  })
  it('GET /api/project/:projectID/events', async done => {
    const res = await request(app).get(`/api/project/${projectID}/events`).set('Cookie', `auth=${token}`);
  
    expect(res.status).toBe(200)
    Event.find({project: projectID}, (err, events) => {
      expect(res.body.data).toEqual(JSON.parse(JSON.stringify(events)))
    })
    done()
  })
})
describe('Testing DELETEs', () => {
  var token;
  var userID;
  var eventID;
  beforeAll(async () => {
    // populate database
    // create user
    const user = new User({
      name: 'John',
      email: 'test@gmail.com',
      password: '123456'
    })
    await user.save().then(() => {
      user.generateToken((err,user)=>{
        if (err) throw err;
        token = user.token;
      })
    })
    token = user.token;
    userID = user._id;

    // create event
    const event = new Event({
      name: 'test event',
      host: user._id,
      feedback: []
    })
    await event.save().then(() => {
      // add to user's events
      user.events.push(event._id);
    })
    eventID = event._id;
  })

  afterAll(async () => {
    // clean up database
    await User.deleteMany();
    await Event.deleteMany();
  })

  it(`DELETE /api/event/delete/eventID`, async done => {
    const res = await request(app).delete(`/api/event/delete/${eventID}`).set('Cookie', `auth=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    Event.findOne({_id: eventID}, (err, event) => {
      expect(event).toBeNull();
    })
    done()
  })
})

describe('Testing POSTs', () => {
  var token;
  var token2;
  var userID;
  var user2ID;
  var eventID;
  var event2ID;
  var event3ID;
  var projectID;
  var project2ID;
  var project3ID;

  beforeAll(async () => {
    // populate database
    // create users
    const user = new User({
      name: 'John',
      email: 'test@gmail.com',
      password: '123456'
    })
    await user.save().then(() => {
      user.generateToken((err,user)=>{
        if (err) throw err;
        token = user.token;
      })
    })
    token = user.token;
    userID = user._id;

    const user2 = new User({
      name: 'Jane',
      email: 'test2@gmail.com',
      password: '654321'
    })
    await user2.save().then(() => {
      user2.generateToken((err,user)=>{
        if (err) throw err;
      })
    })
    user2ID = user2._id;

    const user3 = new User({
      name: 'Joe',
      email: 'test3@gmail.com',
      password: 'pass123'
    })
    await user3.save().then(() => {
      user3.generateToken((err,user)=>{
        if (err) throw err;
      })
    })
    token2 = user3.token;

    // create events
    const event = new Event({
      name: 'test event',
      host: user._id,
      feedback: []
    })
    await event.save().then(() => {
      // add to user's events
      user.events.push(event._id);
    })
    eventID = event._id;

    const event2 = new Event({
      name: 'test event 2',
      host: user2._id,
      members: [user._id],
      feedback: []
    })
    await event2.save().then(() => {
      // add to user's events
      user2.events.push(event2._id);
      user.events.push(event2._id);
    })
    event2ID = event2._id;

    const event3 = new Event({
      name: 'test event 3',
      host: user2._id,
      feedback: []
    })
    await event3.save().then(() => {
      // add to user's events
      user2.events.push(event3._id);
    })
    event3ID = event3._id;

    // create projects
    const project = new Project({
      name: 'test project',
      host: user._id,
      team_members: []
    })
    await project.save();
    projectID = project._id;

    const project2 = new Project({
      name: 'test project 2',
      host: user2._id,
      team_members: [user._id],
    })
    await project2.save();
    project2ID = project2._id;

    const project3 = new Project({
      name: 'test project 3',
      host: user2._id,
      team_members: []
    })
    await project3.save();
    project3ID = project3._id;
  })

  afterAll(async () => {
    // clean up database
    await User.deleteMany();
    await Event.deleteMany();
  })
  

  it('POST /api/event/new', async done => {
    const res = await request(app)
      .post('/api/event/new')
      .set('Cookie', `auth=${token}`)
      .send({
        name: 'test event 4'
      })
    expect(res.status).toBe(201);
    Event.findOne({_id: res.body.id, name: 'test event 4'}, (err, event) => {
      expect(event).toBeTruthy();
    })
    done();
  })
  it('POST /api/event/join/:eventid', async done => {
    const res = await request(app)
      .post(`/api/event/join/${event3ID}`)
      .set('Cookie', `auth=${token}`)
    expect(res.status).toBe(200);
    Event.findOne({_id: event3ID}, (err, event) => {
      expect(event.members).toContainEqual(userID);
    })
    User.findOne({_id: userID}, (err, user) => {
      expect(user.events).toContainEqual(event3ID);
    })
    done();
  })
  it('POST /api/event/leave/:eventid', async done => {
    const res = await request(app)
      .post(`/api/event/leave/${event2ID}`)
      .set('Cookie', `auth=${token}`)
      expect(res.status).toBe(200);
      Event.findOne({_id: event2ID}, (err, event) => {
        expect(event.members).not.toContainEqual(userID);
      })
      User.findOne({_id: userID}, (err, user) => {
        expect(user.events).not.toContainEqual(event2ID);
      })
    done()
  })
  it('POST /api/project/new', async done => {
    const res = await request(app)
      .post('/api/project/new')
      .set('Cookie', `auth=${token}`)
      .send({
        name: 'test project 4'
      })
    expect(res.status).toBe(201);
    Project.findOne({_id: res.body.id, name: 'test project 4'}, (err, project) => {
      expect(project).toBeTruthy();
    })
    done()
  })
  it('POST /api/project/join/:projectID', async done => {
    const res = await request(app)
      .post(`/api/project/join/${project3ID}`)
      .set('Cookie', `auth=${token}`)
    expect(res.status).toBe(200);
    Project.findOne({_id: project3ID}, (err, project) => {
      expect(project.team_members).toContainEqual(userID);
    })
    done();
  })
  it('POST /api/project/leave/:projectID', async done => {
    const res = await request(app)
      .post(`/api/project/leave/${project2ID}`)
      .set('Cookie', `auth=${token}`)
      expect(res.status).toBe(200);
      Project.findOne({_id: project2ID}, (err, project) => {
        expect(project.team_members).not.toContainEqual(userID);
      })
    done()
  })
  it('POST /api/user/new', async done => {
    const res = await request(app)
      .post('/api/user/new')
      .send({
        name: 'David',
        email: 'email@gmail.com',
        password: '321456',
        events: []
      })
    expect(res.status).toBe(201);
    User.findOne({_id: res.body.id, name: 'David', email: 'email@gmail.com', events: []}, (err, user) => {
      expect(user).toBeTruthy();
    })
    done();
  })
  it('POST /api/user/login', async done => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'test2@gmail.com',
        password: '654321'
      })
    expect(res.status).toBe(200);
    expect(res.body.id).toEqual(`${user2ID}`);
    done();
  })
  it('POST /api/user/logout', async done => {
    const res = await request(app)
      .post('/api/user/logout')
      .set('Cookie', `auth=${token2}`)
    expect(res.status).toBe(200);
    User.findOne({token: token2}, (err, user) => {
      expect(user).toBeNull();
    })
    done();
  })
  it('POST /api/feedback/new', async done => {
    const res = await request(app)
      .post('/api/feedback/new')
      .set('Cookie', `auth=${token}`)
      .send({
        eventID: eventID,
        mood: 0.5,
        content: 'very good'
      })
    expect(res.status).toBe(201);
    Feedback.findOne({_id: res.body.id}, (err, feedback) => {
      expect(feedback).toBeTruthy();
      expect(feedback.event).toEqual(eventID);
      expect(feedback.mood).toBe(0.5);
      expect(feedback.content).toBe('very good');
    })
    done();
  })
})
