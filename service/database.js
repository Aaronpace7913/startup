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
const invitationCollection = db.collection('invitation'); // NEW

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

// NEW: Search users by email (case-insensitive)
async function searchUsers(query) {
  const regex = new RegExp(query, 'i'); // Case-insensitive search
  const cursor = userCollection
    .find({ email: regex })
    .limit(10); // Limit results to 10
  return cursor.toArray();
}

// ========== PROJECT FUNCTIONS ==========
// UPDATED: Now returns projects where user is owner OR member
async function getProjects(userEmail) {
  const cursor = projectCollection.find({ 
    $or: [
      { owner: userEmail },
      { members: userEmail }
    ]
  });
  return cursor.toArray();
}

// UPDATED: Check if user is owner OR member
async function getProject(projectId, userEmail) {
  return projectCollection.findOne({ 
    id: projectId,
    $or: [
      { owner: userEmail },
      { members: userEmail }
    ]
  });
}

// UPDATED: Initialize with members array containing just the owner
async function addProject(project) {
  project.members = project.members || [project.owner]; // Owner is always a member
  await projectCollection.insertOne(project);
  return project;
}

async function updateProject(projectId, userEmail, updates) {
  const result = await projectCollection.findOneAndUpdate(
    { 
      id: projectId,
      $or: [
        { owner: userEmail },
        { members: userEmail }
      ]
    },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

// Only owner can delete
async function deleteProject(projectId, ownerEmail) {
  await projectCollection.deleteOne({ 
    id: projectId, 
    owner: ownerEmail 
  });
}

// NEW: Add a member to a project
async function addProjectMember(projectId, ownerEmail, memberEmail) {
  const result = await projectCollection.findOneAndUpdate(
    { id: projectId, owner: ownerEmail },
    { $addToSet: { members: memberEmail } }, // $addToSet prevents duplicates
    { returnDocument: 'after' }
  );
  return result;
}

// NEW: Remove a member from a project
async function removeProjectMember(projectId, ownerEmail, memberEmail) {
  const result = await projectCollection.findOneAndUpdate(
    { id: projectId, owner: ownerEmail },
    { $pull: { members: memberEmail } },
    { returnDocument: 'after' }
  );
  return result;
}

// NEW: Get all members of a project
async function getProjectMembers(projectId, userEmail) {
  const project = await projectCollection.findOne({
    id: projectId,
    $or: [
      { owner: userEmail },
      { members: userEmail }
    ]
  });
  return project ? project.members : null;
}

// ========== INVITATION FUNCTIONS ==========
// NEW: Create an invitation
async function createInvitation(invitation) {
  await invitationCollection.insertOne(invitation);
  return invitation;
}

// NEW: Get invitations for a user
async function getInvitations(userEmail) {
  const cursor = invitationCollection.find({ 
    toEmail: userEmail,
    status: 'pending'
  }).sort({ createdAt: -1 });
  return cursor.toArray();
}

// NEW: Update invitation status
async function updateInvitation(invitationId, status) {
  const result = await invitationCollection.findOneAndUpdate(
    { id: invitationId },
    { $set: { status: status } },
    { returnDocument: 'after' }
  );
  return result;
}

// NEW: Delete invitation
async function deleteInvitation(invitationId) {
  await invitationCollection.deleteOne({ id: invitationId });
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
  searchUsers,              // NEW
  
  // Project functions
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  
  // Invitation functions
  createInvitation,
  getInvitations,
  updateInvitation,
  deleteInvitation,
  
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