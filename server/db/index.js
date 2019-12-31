const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const connectionString = 'mongodb://localhost:27017/test';

function connect() {
    mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "Connection error"));
    db.once("open", () => {
        console.log("Connection with the database established.");
    });
}

module.exports = {
    connect,
    ObjectId,
};