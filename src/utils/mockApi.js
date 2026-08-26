import initialData from '../../db.json';

const DB_KEY = 'baseball_salon_db';

// Initialize DB in localStorage if it doesn't exist
const initDB = () => {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  } else {
    // 이미 로컬스토리지가 존재하더라도, db.json(initialData)에 있는 새로운 초안/아티클 병합
    const localDb = JSON.parse(existing);
    let changed = false;

    // db.json의 draftArticles 중 로컬(draftArticles, articles)에 없는 것만 추가
    if (initialData.draftArticles) {
      if (!localDb.draftArticles) localDb.draftArticles = [];
      const localIds = new Set([
        ...localDb.draftArticles.map(a => a.originalUrl),
        ...(localDb.articles || []).map(a => a.originalUrl)
      ]);
      
      for (const draft of initialData.draftArticles) {
        if (!localIds.has(draft.originalUrl)) {
          localDb.draftArticles.unshift(draft);
          localIds.add(draft.originalUrl);
          changed = true;
        }
      }
    }

    if (changed) {
      localStorage.setItem(DB_KEY, JSON.stringify(localDb));
    }
  }
};

const getDB = () => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
};

const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- Auth ---
export const verifyPin = async (pin) => {
  const db = getDB();
  return db.auth.pins.includes(pin);
};

// --- Articles ---
export const getArticles = async () => {
  const db = getDB();
  return db.articles;
};

export const postArticle = async (article) => {
  const db = getDB();
  const newArticle = { ...article, id: Date.now().toString() };
  db.articles.unshift(newArticle);
  saveDB(db);
  return newArticle;
};

// --- Draft Articles (Admin) ---
export const getDraftArticles = async () => {
  const db = getDB();
  return db.draftArticles || [];
};

export const deleteDraftArticle = async (id) => {
  const db = getDB();
  db.draftArticles = (db.draftArticles || []).filter(d => d.id !== id);
  saveDB(db);
};

export const updateDraftArticle = async (updatedDraft) => {
  const db = getDB();
  const index = (db.draftArticles || []).findIndex(d => d.id === updatedDraft.id);
  if (index > -1) {
    db.draftArticles[index] = updatedDraft;
    saveDB(db);
  }
};

// --- Comments ---
export const getComments = async (articleId) => {
  const db = getDB();
  return (db.comments || []).filter(c => c.articleId === articleId);
};

export const postComment = async (comment) => {
  const db = getDB();
  const newComment = { ...comment, id: Date.now().toString() };
  if (!db.comments) db.comments = [];
  db.comments.push(newComment);
  saveDB(db);
  return newComment;
};

// --- Research Tasks ---
export const getResearchTasks = async () => {
  const db = getDB();
  return (db.researchTasks || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const postResearchTask = async (task) => {
  const db = getDB();
  const newTask = { ...task, id: Date.now().toString() };
  if (!db.researchTasks) db.researchTasks = [];
  db.researchTasks.push(newTask);
  saveDB(db);
  return newTask;
};

export const updateResearchTaskStatus = async (taskId, newStatus) => {
  const db = getDB();
  const taskIndex = db.researchTasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    db.researchTasks[taskIndex].status = newStatus;
    saveDB(db);
    return db.researchTasks[taskIndex];
  }
  throw new Error("Task not found");
};

export const updateResearchTaskReplies = async (taskId, replies) => {
  const db = getDB();
  const taskIndex = db.researchTasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    db.researchTasks[taskIndex].replies = replies;
    saveDB(db);
    return db.researchTasks[taskIndex];
  }
  throw new Error("Task not found");
};
