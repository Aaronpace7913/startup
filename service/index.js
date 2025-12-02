const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const { WebSocketServer } = require('ws');
const http = require('http');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Create HTTP server
const server = http.createServer(app);

// WebSocket connection management
let connections = [];

// ========== WEBSOCKET SETUP ==========
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  const connection = { id: uuid.v4(), alive: true, ws: ws, projectId: null, userEmail: null };
  connections.push(connection);

  // Respond to pong messages by marking the connection alive
  ws.on('pong', () => {
    connection.alive = true;
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      
      // Handle authentication
      if (msg.type === 'auth') {
        connection.userEmail = msg.userEmail;
        connection.projectId = msg.projectId;
        console.log(`WebSocket authenticated: ${msg.userEmail} for project ${msg.projectId}`);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    connections = connections.filter((c) => c.id !== connection.id);
  });
});

// Keep alive ping/pong
setInterval(() => {
  connections.forEach((c) => {
    if (!c.alive) {
      c.ws.terminate();
    } else {
      c.alive = false;
      c.ws.ping();
    }
  });
}, 10000);

// Broadcast message to all connections in a specific project
function broadcastToProject(projectId, message) {
  connections.forEach((c) => {
    if (c.projectId === projectId && c.ws.readyState === c.ws.OPEN) {
      c.ws.send(JSON.stringify(message));
    }
  });
}

// Broadcast to a specific user across all their projects
function broadcastToUser(userEmail, message) {
  connections.forEach((c) => {
    if (c.userEmail === userEmail && c.ws.readyState === c.ws.OPEN) {
      c.ws.send(JSON.stringify(message));
    }
  });
}

// Broadcast to global chat
function broadcastGlobal(message) {
  connections.forEach((c) => {
    if (c.projectId === 'global' && c.ws.readyState === c.ws.OPEN) {
      c.ws.send(JSON.stringify(message));
    }
  });
}

// ========== AUTHENTICATION ENDPOINTS ==========

apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

apiRouter.get('/auth/user', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await findUser('token', authToken);
  if (user) {
    res.send({ email: user.email });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// ========== MIDDLEWARE ==========

async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
}

// ========== USER SEARCH ENDPOINT ==========

apiRouter.get('/users/search', verifyAuth, async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query || query.length < 2) {
      return res.status(400).send({ msg: 'Query must be at least 2 characters' });
    }
    
    const users = await DB.searchUsers(query);
    const results = users.map(user => ({ email: user.email }));
    res.send(results);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).send({ msg: 'Search failed', error: err.message });
  }
});

// ========== PROJECT ENDPOINTS ==========

apiRouter.get('/projects', verifyAuth, async (req, res) => {
  const userProjects = await DB.getProjects(req.user.email);
  res.send(userProjects);
});

apiRouter.post('/projects', verifyAuth, async (req, res) => {
  const newProject = {
    id: Date.now(),
    name: req.body.name,
    owner: req.user.email,
    members: [req.user.email],
    completed: 0,
    total: 0,
    createdAt: new Date().toISOString()
  };
  
  await DB.addProject(newProject);
  res.send(newProject);
});

apiRouter.get('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    res.send(project);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.put('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const updatedProject = await DB.updateProject(projectId, req.user.email, req.body);
  
  if (updatedProject) {
    // Broadcast project update
    broadcastToProject(projectId, {
      type: 'project-updated',
      project: updatedProject
    });
    res.send(updatedProject);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.delete('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project && project.owner === req.user.email) {
    await DB.deleteProject(projectId, req.user.email);
    await DB.deleteTasksByProject(projectId);
    await DB.deleteMessagesByProject(projectId);
    await DB.deleteActivitiesByProject(projectId);
    
    // Broadcast project deletion
    broadcastToProject(projectId, {
      type: 'project-deleted',
      projectId: projectId
    });
    
    res.status(204).end();
  } else {
    res.status(403).send({ msg: 'Only the project owner can delete the project' });
  }
});

// ========== MEMBER MANAGEMENT ENDPOINTS ==========

apiRouter.get('/projects/:id/members', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    res.send({ members: project.members, owner: project.owner });
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.post('/projects/:id/invite', verifyAuth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const inviteEmail = req.body.email;
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      return res.status(400).send({ msg: 'Invalid email address' });
    }
    
    const project = await DB.getProject(projectId, req.user.email);
    
    if (!project) {
      return res.status(404).send({ msg: 'Project not found' });
    }
    
    if (project.owner !== req.user.email) {
      return res.status(403).send({ msg: 'Only the project owner can invite members' });
    }
    
    const invitedUser = await DB.getUser(inviteEmail);
    if (!invitedUser) {
      return res.status(404).send({ msg: `User with email ${inviteEmail} not found. They need to create an account first.` });
    }
    
    if (project.members && project.members.includes(inviteEmail)) {
      return res.status(409).send({ msg: 'User is already a member' });
    }
    
    const existingInvitations = await DB.getInvitations(inviteEmail);
    const alreadyInvited = existingInvitations.some(
      inv => inv.projectId === projectId && inv.status === 'pending'
    );
    
    if (alreadyInvited) {
      return res.status(409).send({ msg: 'User has already been invited to this project' });
    }
    
    const invitation = {
      id: Date.now(),
      projectId: projectId,
      projectName: project.name,
      fromEmail: req.user.email,
      toEmail: inviteEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await DB.createInvitation(invitation);
    
    // Broadcast new invitation to the invited user
    broadcastToUser(inviteEmail, {
      type: 'new-invitation',
      invitation: invitation
    });
    
    res.send({ msg: 'Invitation sent', invitation });
  } catch (err) {
    console.error('Error in invite endpoint:', err);
    res.status(500).send({ msg: 'Server error while sending invitation', error: err.message });
  }
});

apiRouter.get('/invitations', verifyAuth, async (req, res) => {
  const invitations = await DB.getInvitations(req.user.email);
  res.send(invitations);
});

apiRouter.post('/invitations/:id/accept', verifyAuth, async (req, res) => {
  const invitationId = parseInt(req.params.id);
  const invitations = await DB.getInvitations(req.user.email);
  const invitation = invitations.find(inv => inv.id === invitationId);
  
  if (!invitation) {
    return res.status(404).send({ msg: 'Invitation not found' });
  }
  
  if (invitation.toEmail !== req.user.email) {
    return res.status(403).send({ msg: 'This invitation is not for you' });
  }
  
  const project = await DB.getProject(invitation.projectId, invitation.fromEmail);
  if (!project) {
    return res.status(404).send({ msg: 'Project no longer exists' });
  }
  
  await DB.addProjectMember(invitation.projectId, project.owner, req.user.email);
  await DB.updateInvitation(invitationId, 'accepted');
  
  const activity = {
    id: Date.now(),
    projectId: invitation.projectId,
    user: req.user.email,
    action: 'joined the project',
    timestamp: new Date().toISOString()
  };
  await DB.addActivity(activity);
  
  // Broadcast member joined
  broadcastToProject(invitation.projectId, {
    type: 'member-joined',
    member: req.user.email,
    activity: activity
  });
  
  res.send({ msg: 'Invitation accepted', project });
});

apiRouter.post('/invitations/:id/decline', verifyAuth, async (req, res) => {
  const invitationId = parseInt(req.params.id);
  const invitations = await DB.getInvitations(req.user.email);
  const invitation = invitations.find(inv => inv.id === invitationId);
  
  if (!invitation) {
    return res.status(404).send({ msg: 'Invitation not found' });
  }
  
  if (invitation.toEmail !== req.user.email) {
    return res.status(403).send({ msg: 'This invitation is not for you' });
  }
  
  await DB.updateInvitation(invitationId, 'declined');
  res.send({ msg: 'Invitation declined' });
});

apiRouter.delete('/projects/:id/members/:email', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const memberEmail = req.params.email;
  const project = await DB.getProject(projectId, req.user.email);
  
  if (!project) {
    return res.status(404).send({ msg: 'Project not found' });
  }
  
  if (project.owner !== req.user.email) {
    return res.status(403).send({ msg: 'Only the project owner can remove members' });
  }
  
  if (memberEmail === project.owner) {
    return res.status(400).send({ msg: 'Cannot remove the project owner' });
  }
  
  await DB.removeProjectMember(projectId, req.user.email, memberEmail);
  
  const activity = {
    id: Date.now(),
    projectId: projectId,
    user: req.user.email,
    action: `removed ${memberEmail} from the project`,
    timestamp: new Date().toISOString()
  };
  await DB.addActivity(activity);
  
  // Broadcast member removed
  broadcastToProject(projectId, {
    type: 'member-removed',
    member: memberEmail,
    activity: activity
  });
  
  res.send({ msg: 'Member removed' });
});

apiRouter.post('/projects/:id/leave', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (!project) {
    return res.status(404).send({ msg: 'Project not found' });
  }
  
  if (project.owner === req.user.email) {
    return res.status(400).send({ msg: 'Project owner cannot leave. Delete the project instead.' });
  }
  
  await DB.removeProjectMember(projectId, project.owner, req.user.email);
  
  const activity = {
    id: Date.now(),
    projectId: projectId,
    user: req.user.email,
    action: 'left the project',
    timestamp: new Date().toISOString()
  };
  await DB.addActivity(activity);
  
  // Broadcast member left
  broadcastToProject(projectId, {
    type: 'member-left',
    member: req.user.email,
    activity: activity
  });
  
  res.send({ msg: 'You have left the project' });
});

// ========== TASK ENDPOINTS ==========

apiRouter.get('/projects/:id/tasks', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const tasks = await DB.getTasks(projectId);
    res.send(tasks);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.post('/projects/:id/tasks', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const newTask = {
      id: Date.now(),
      projectId: projectId,
      text: req.body.text,
      assignedTo: req.body.assignedTo || '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    await DB.addTask(newTask);
    const updatedProject = await updateProjectProgress(projectId, project.owner);
    
    // Broadcast new task
    broadcastToProject(projectId, {
      type: 'task-created',
      task: newTask,
      project: updatedProject
    });
    
    res.send(newTask);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.put('/projects/:projectId/tasks/:taskId', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const updatedTask = await DB.updateTask(projectId, taskId, req.body);
    if (updatedTask) {
      const updatedProject = await updateProjectProgress(projectId, project.owner);
      
      // Broadcast task update
      broadcastToProject(projectId, {
        type: 'task-updated',
        task: updatedTask,
        project: updatedProject
      });
      
      res.send(updatedTask);
    } else {
      res.status(404).send({ msg: 'Task not found' });
    }
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.delete('/projects/:projectId/tasks/:taskId', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    await DB.deleteTask(projectId, taskId);
    const updatedProject = await updateProjectProgress(projectId, project.owner);
    
    // Broadcast task deletion
    broadcastToProject(projectId, {
      type: 'task-deleted',
      taskId: taskId,
      project: updatedProject
    });
    
    res.status(204).end();
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// ========== MESSAGE ENDPOINTS ==========

apiRouter.get('/projects/:id/messages', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const messages = await DB.getMessages(projectId);
    res.send(messages);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.post('/projects/:id/messages', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const newMessage = {
      id: Date.now(),
      projectId: projectId,
      user: req.body.user,
      text: req.body.text,
      timestamp: new Date().toISOString()
    };
    
    await DB.addMessage(newMessage);
    
    // Broadcast new message
    broadcastToProject(projectId, {
      type: 'new-message',
      message: newMessage
    });
    
    res.send(newMessage);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.get('/messages', verifyAuth, async (req, res) => {
  const messages = await DB.getMessages('global');
  res.send(messages);
});

apiRouter.post('/messages', verifyAuth, async (req, res) => {
  const newMessage = {
    id: Date.now(),
    projectId: 'global',
    user: req.body.user,
    text: req.body.text,
    timestamp: new Date().toISOString()
  };
  
  await DB.addMessage(newMessage);
  
  // Broadcast global message
  broadcastGlobal({
    type: 'new-message',
    message: newMessage
  });
  
  res.send(newMessage);
});

// ========== ACTIVITY ENDPOINTS ==========

apiRouter.get('/projects/:id/activities', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const activities = await DB.getActivities(projectId);
    res.send(activities);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.post('/projects/:id/activities', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const newActivity = {
      id: Date.now(),
      projectId: projectId,
      user: req.body.user,
      action: req.body.action,
      timestamp: new Date().toISOString()
    };
    
    await DB.addActivity(newActivity);
    
    // Broadcast new activity
    broadcastToProject(projectId, {
      type: 'new-activity',
      activity: newActivity
    });
    
    res.send(newActivity);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// ========== HELPER FUNCTIONS ==========

async function updateProjectProgress(projectId, ownerEmail) {
  const tasks = await DB.getTasks(projectId);
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  
  const updatedProject = await DB.updateProject(projectId, ownerEmail, { 
    total: total, 
    completed: completed 
  });
  
  return updatedProject;
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await DB.addUser(user);
  
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  
  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  return DB.getUser(value);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Upgrade HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

server.listen(port, () => {
  console.log(`GroupTask service listening on port ${port}`);
});