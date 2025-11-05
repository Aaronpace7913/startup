const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

let users = [];
let projects = [];
let tasks = {}; 
let chatMessages = {};
let activities = {};

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

app.use(cookieParser());

app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Create a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// Login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// Logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Get current user info
apiRouter.get('/auth/user', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await findUser('token', authToken);
  if (user) {
    res.send({ email: user.email });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});


async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;  // Attach user to request
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
}


// Get all projects for the current user
apiRouter.get('/projects', verifyAuth, (req, res) => {
  // Filter projects by user email
  const userProjects = projects.filter(p => p.owner === req.user.email);
  res.send(userProjects);
});

// Create a new project
apiRouter.post('/projects', verifyAuth, (req, res) => {
  const newProject = {
    id: Date.now(),
    name: req.body.name,
    owner: req.user.email,
    completed: 0,
    total: 0,
    createdAt: new Date().toISOString()
  };
  
  projects.push(newProject);
  tasks[newProject.id] = [];
  chatMessages[newProject.id] = [];
  activities[newProject.id] = []; 
  
  res.send(newProject);
});

// Get a specific project
apiRouter.get('/projects/:id', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    res.send(project);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Update a project
apiRouter.put('/projects/:id', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId && p.owner === req.user.email);
  
  if (projectIndex !== -1) {
    projects[projectIndex] = { ...projects[projectIndex], ...req.body };
    res.send(projects[projectIndex]);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Delete a project
apiRouter.delete('/projects/:id', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = projects.findIndex(p => p.id === projectId && p.owner === req.user.email);
  
  if (projectIndex !== -1) {
    projects.splice(projectIndex, 1);
    delete tasks[projectId];
    delete chatMessages[projectId];
    delete activities[projectId];
    res.status(204).end();
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Get all tasks for a project
apiRouter.get('/projects/:id/tasks', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    res.send(tasks[projectId] || []);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Create a new task
apiRouter.post('/projects/:id/tasks', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    const newTask = {
      id: Date.now(),
      text: req.body.text,
      assignedTo: req.body.assignedTo || '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    if (!tasks[projectId]) {
      tasks[projectId] = [];
    }
    tasks[projectId].push(newTask);
    
    // Update project totals
    updateProjectProgress(projectId);
    
    res.send(newTask);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Update a task
apiRouter.put('/projects/:projectId/tasks/:taskId', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project && tasks[projectId]) {
    const taskIndex = tasks[projectId].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[projectId][taskIndex] = { ...tasks[projectId][taskIndex], ...req.body };
      updateProjectProgress(projectId);
      res.send(tasks[projectId][taskIndex]);
    } else {
      res.status(404).send({ msg: 'Task not found' });
    }
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Delete a task
apiRouter.delete('/projects/:projectId/tasks/:taskId', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project && tasks[projectId]) {
    const taskIndex = tasks[projectId].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[projectId].splice(taskIndex, 1);
      updateProjectProgress(projectId);
      res.status(204).end();
    } else {
      res.status(404).send({ msg: 'Task not found' });
    }
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Get all chat messages for a project
apiRouter.get('/projects/:id/messages', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    res.send(chatMessages[projectId] || []);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Post a new chat message
apiRouter.post('/projects/:id/messages', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    const newMessage = {
      id: Date.now(),
      user: req.body.user,
      text: req.body.text,
      timestamp: new Date().toISOString()
    };
    
    if (!chatMessages[projectId]) {
      chatMessages[projectId] = [];
    }
    chatMessages[projectId].push(newMessage);
    
    res.send(newMessage);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

apiRouter.get('/messages', verifyAuth, (req, res) => {
  // For global chat, we'll use a special key
  res.send(chatMessages['global'] || []);
});

apiRouter.post('/messages', verifyAuth, (req, res) => {
  const newMessage = {
    id: Date.now(),
    user: req.body.user,
    text: req.body.text,
    timestamp: new Date().toISOString()
  };
  
  if (!chatMessages['global']) {
    chatMessages['global'] = [];
  }
  chatMessages['global'].push(newMessage);
  
  res.send(newMessage);
});


// Get activities for a project
apiRouter.get('/projects/:id/activities', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    res.send(activities[projectId] || []);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Post a new activity
apiRouter.post('/projects/:id/activities', verifyAuth, (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    const newActivity = {
      id: Date.now(),
      user: req.body.user,
      action: req.body.action,
      timestamp: new Date().toISOString()
    };
    
    if (!activities[projectId]) {
      activities[projectId] = [];
    }
    activities[projectId].push(newActivity);
    
    res.send(newActivity);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Update project progress based on task completion
function updateProjectProgress(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (project && tasks[projectId]) {
    const projectTasks = tasks[projectId];
    project.total = projectTasks.length;
    project.completed = projectTasks.filter(t => t.completed).length;
  }
}

// Create a new user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);
  
  return user;
}

// Find a user by field and value
async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
}

// Set authentication cookie
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


app.listen(port, () => {
  console.log(`GroupTask service listening on port ${port}`);
});