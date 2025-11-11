const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');
const { Db } = require('mongodb');

const authCookieName = 'token';

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
    await Db.updateUser(user);
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
apiRouter.get('/projects', verifyAuth, async (req, res) => {
  // Filter projects by user email
  const userProjects = await DB.getProjects(req.user.email);
  res.send(userProjects);
});

// Create a new project
apiRouter.post('/projects', verifyAuth, async (req, res) => {
  const newProject = {
    id: Date.now(),
    name: req.body.name,
    owner: req.user.email,
    completed: 0,
    total: 0,
    createdAt: new Date().toISOString()
  };
  
  await DB.addProject(newProject);
  res.send(newProject);
});

// Get a specific project
apiRouter.get('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
 
  if (project) {
    res.send(project);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Update a project
apiRouter.put('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = DB.updateProject(projectId, req.user.email, req.body);
  
  if (updatedProject) {
    res.send(updatedProject);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Delete a project
apiRouter.delete('/projects/:id', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const projectIndex = await DB.getProject(projectId, req.user.email);

  if (project) {
    await DB.deleteProject(projectId, req.user.email);
    await DB.deleteTasksByProject(projectId);
    await DB.deleteMessagesByProject(projectId);
    await DB.deleteActivitiesByProject(projectId);
    res.status(204).end();
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Get all tasks for a project
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

// Create a new task
apiRouter.post('/projects/:id/tasks', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const newTask = {
      id: Date.now(),
      text: req.body.text,
      assignedTo: req.body.assignedTo || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    await DB.addTask(newTask);
    await DB.updateProjectProgress(projectId, req.user.email);
    
    res.send(newTask);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Update a task
apiRouter.put('/projects/:projectId/tasks/:taskId', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    const updatedTask = await DB.updateTask(projectId, taskId, req.body);
    if (updatedTask) {
      await DB.updateProjectProgress(projectId, req.user.email);
      res.send(updatedTask);
    } else {
      res.status(404).send({ msg: 'Task not found' });
    }
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});

// Delete a task
apiRouter.delete('/projects/:projectId/tasks/:taskId', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const taskId = parseInt(req.params.taskId);
  const project = await DB.getProject(projectId, req.user.email);
  
  if (project) {
    await DB.deleteTask(projectId, taskId);
    await DB.updateProjectProgress(projectId, req.user.email);
    res.status(204).end();
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Get all chat messages for a project
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

// Post a new chat message
apiRouter.post('/projects/:id/messages', verifyAuth, async (req, res) => {
  const projectId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projectId && p.owner === req.user.email);
  
  if (project) {
    const newMessage = {
      id: Date.now(),
      projectId: projectId,
      user: req.body.user,
      text: req.body.text,
      timestamp: new Date().toISOString()
    };
    await DB.addMessage(newMessage);
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
  res.send(newMessage);
});


// Get activities for a project
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

// Post a new activity
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
    res.send(newActivity);
  } else {
    res.status(404).send({ msg: 'Project not found' });
  }
});


// Update project progress based on task completion
async function updateProjectProgress(projectId, ownerEmail) {
  const tasks = await getTasks(projectId);
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  
  await DB.updateProject(projectId, ownerEmail, {
    completed: completed,
    total: total
  });
}

// Create a new user
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

// Find a user by field and value
async function findUser(field, value) {
  if (!value) return null;

  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  return DB.getUser(value)
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