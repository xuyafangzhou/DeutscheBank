const app = require('testindex')
const db = require('./db')

const port = 5000

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.listen(port, () => console.log(`Server running on port ${port}`))