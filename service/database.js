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

// Test the connection
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log('Connected to database');
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// ========== USER FUNCTIONS ==========
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
    { $set: user }
  );
}

// ========== PROJECT FUNCTIONS ==========
async function getProjects(ownerEmail) {
  const cursor = projectCollection.find({ owner: ownerEmail });
  return cursor.toArray();
}

async function getProject(projectId, ownerEmail) {
  return projectCollection.findOne({ 
    id: projectId, 
    owner: ownerEmail 
  });
}

async function addProject(project) {
  await projectCollection.insertOne(project);
  return project;
}

async function updateProject(projectId, ownerEmail, updates) {
  const result = await projectCollection.findOneAndUpdate(
    { id: projectId, owner: ownerEmail },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

async function deleteProject(projectId, ownerEmail) {
  await projectCollection.deleteOne({ 
    id: projectId, 
    owner: ownerEmail 
  });
}

// ========== TASK FUNCTIONS ==========
async function getTasks(projectId) {
  const cursor = taskCollection.find({ projectId: projectId });
  return cursor.toArray();
}

async function addTask(task) {
  await taskCollection.insertOne(task);
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

// ========== MESSAGE FUNCTIONS ==========
async function getMessages(projectId) {
  const cursor = messageCollection
    .find({ projectId: projectId })
    .sort({ timestamp: 1 });
  return cursor.toArray();
}

async function addMessage(message) {
  await messageCollection.insertOne(message);
  return message;
}

async function deleteMessagesByProject(projectId) {
  await messageCollection.deleteMany({ projectId: projectId });
}

// ========== ACTIVITY FUNCTIONS ==========
async function getActivities(projectId) {
  const cursor = activityCollection
    .find({ projectId: projectId })
    .sort({ timestamp: -1 });
  return cursor.toArray();
}

async function addActivity(activity) {
  await activityCollection.insertOne(activity);
  return activity;
}

async function deleteActivitiesByProject(projectId) {
  await activityCollection.deleteMany({ projectId: projectId });
}

module.exports = {
  // User functions
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  
  // Project functions
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  
  // Task functions
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  deleteTasksByProject,
  
  // Message functions
  getMessages,
  addMessage,
  deleteMessagesByProject,
  
  // Activity functions
  getActivities,
  addActivity,
  deleteActivitiesByProject,
};