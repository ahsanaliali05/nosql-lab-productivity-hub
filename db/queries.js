// db/queries.js

const { ObjectId } = require('mongodb');

// -------------------- Query 1 --------------------
async function signupUser(db, userData) {
  const result = await db.collection('users').insertOne({
    email: userData.email,
    passwordHash: userData.passwordHash,
    name: userData.name,
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
  throw new Error('signupUser not implemented');
}

// -------------------- Query 2 --------------------
async function loginFindUser(db, email) {
  const user = await db.collection('users').findOne({ email: email });
  return user;
  throw new Error('loginFindUser not implemented');
}

// -------------------- Query 3 --------------------
async function listUserProjects(db, ownerId) {
  const projects = await db.collection('projects')
    .find({ ownerId: ownerId, archived: false })
    .sort({ createdAt: -1 })
    .toArray();

  return projects;
  throw new Error('listUserProjects not implemented');
}

// -------------------- Query 4 --------------------
async function createProject(db, projectData) {
  const result = await db.collection('projects').insertOne({
    ownerId: projectData.ownerId,
    name: projectData.name,
    description: projectData.description || '',
    archived: false,
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
  throw new Error('createProject not implemented');
}

// -------------------- Query 5 --------------------
async function archiveProject(db, projectId) {
  const result = await db.collection('projects').updateOne(
    { _id: projectId },
    { $set: { archived: true } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
  throw new Error('archiveProject not implemented');
}

// -------------------- Query 6 --------------------
async function listProjectTasks(db, projectId, status) {
  const filter = { projectId: projectId };
  if (status) filter.status = status;

  const tasks = await db.collection('tasks')
    .find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .toArray();

  return tasks;
  throw new Error('listProjectTasks not implemented');
}

// -------------------- Query 7 --------------------
async function createTask(db, taskData) {
  const result = await db.collection('tasks').insertOne({
    ownerId: taskData.ownerId,
    projectId: taskData.projectId,
    title: taskData.title,
    status: 'todo',
    priority: taskData.priority || 1,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    createdAt: new Date()
  });

  return { insertedId: result.insertedId };
  throw new Error('createTask not implemented');
}

// -------------------- Query 8 --------------------
async function updateTaskStatus(db, taskId, newStatus) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $set: { status: newStatus } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
  throw new Error('updateTaskStatus not implemented');
}

// -------------------- Query 9 --------------------
async function addTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $addToSet: { tags: tag } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
  throw new Error('addTaskTag not implemented');
}

// -------------------- Query 10 --------------------
async function removeTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $pull: { tags: tag } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
  throw new Error('removeTaskTag not implemented');
}

// -------------------- Query 11 --------------------
async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId, 'subtasks.title': subtaskTitle },
    { $set: { 'subtasks.$.done': newDone } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
  throw new Error('toggleSubtask not implemented');
}

// -------------------- Query 12 --------------------
async function deleteTask(db, taskId) {
  const result = await db.collection('tasks').deleteOne({ _id: taskId });

  return { deletedCount: result.deletedCount };
  throw new Error('deleteTask not implemented');
}

// -------------------- Query 13 --------------------
async function searchNotes(db, ownerId, tags, projectId) {
  const filter = {
    ownerId: ownerId,
    tags: { $in: tags }
  };

  if (projectId) filter.projectId = projectId;

  const notes = await db.collection('notes')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return notes;
  throw new Error('searchNotes not implemented');
}

// -------------------- Query 14 --------------------
async function projectTaskSummary(db, ownerId) {
  const result = await db.collection('tasks').aggregate([
    { $match: { ownerId: ownerId } },
    {
      $group: {
        _id: '$projectId',
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    {
      $project: {
        _id: 1,
        projectName: '$project.name',
        todo: 1,
        inProgress: 1,
        done: 1,
        total: 1
      }
    }
  ]).toArray();

  return result;
  throw new Error('projectTaskSummary not implemented');
}

// -------------------- Query 15 --------------------
async function recentActivityFeed(db, ownerId) {
  const result = await db.collection('tasks').aggregate([
    { $match: { ownerId: ownerId } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        priority: 1,
        createdAt: 1,
        projectId: 1,
        projectName: '$project.name'
      }
    }
  ]).toArray();

  return result;
  throw new Error('recentActivityFeed not implemented');
}

module.exports = {
  signupUser,
  loginFindUser,
  listUserProjects,
  createProject,
  archiveProject,
  listProjectTasks,
  createTask,
  updateTaskStatus,
  addTaskTag,
  removeTaskTag,
  toggleSubtask,
  deleteTask,
  searchNotes,
  projectTaskSummary,
  recentActivityFeed
};