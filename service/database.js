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

(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// User functions
function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne(
    { email: user.email }, 
    { $set: user });
}   

// Additional functions for projects, tasks, messages, and activities can be added here

async function getProjects(ownerEmail) {
  return cursor = projectCollection.find({ owner: ownerEmail });
  return cursor.toArray();
}

async function getProject(projectId, ownerEmail) {
    return projectCollection.findOne({
         _id: projectId, 
         owner: ownerEmail 
});
}

async function addProject(project) {
  return projectCollection.insertOne(project);
  return project;
}

async function updateProject(projectId, ownerEmail, updates) {
    const result = await projectCollection.findOneAndUpdate(
        { _id: projectId, owner: ownerEmail },
        { $set: updates },
        { returnDocument: 'after' }
    );
    return result;
}

async function deleteProject(projectId, ownerEmail) {
    await projectCollection.deleteOne({
         _id: projectId, 
         owner: ownerEmail 
    });
}

// ============== Task Functions ==============
async function getTasks(projectId) {
    const cursor = taskCollection.find({ projectId: projectId });
    return cursor.toArray();
}

async function addTask(task) {
    return taskCollection.insertOne(task);
    return task;
}

async function updateTask(projectId, taskId, updates) {
    const result = await taskCollection.findOneAndUpdate(
        { projectId: projectId, id: taskId },
        { $set: updates },
        { returnDocument: 'after' }
    );
    return result;
}

async function deleteTask(projectId, taskId) {
    await taskCollection.deleteOne({
         projectId: projectId, 
         id: taskId 
    });
}

async function deleteTasksByProject(projectId) {
    await taskCollection.deleteMany({ projectId: projectId });
}

