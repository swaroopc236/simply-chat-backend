const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Connected to mongodb');
})

connection.on('error', (err) => {
    console.error(err);
})