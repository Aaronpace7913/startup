const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('grouptask');

// Collections
const userCollection = db.collection('user');
const projectCollection = db.collection('project');
const taskCollection = db.collection('task');
const messageCollection = db.collection('message');
const activityCollection = db.collection('activity');