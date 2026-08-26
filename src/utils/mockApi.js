import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// --- Auth ---
export const verifyPin = async (pin) => {
  // 간단한 하드코딩 핀 (실무에서는 DB 등 사용)
  return pin === "1234";
};

// --- Articles ---
export const getArticles = async () => {
  const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const postArticle = async (article) => {
  const newArticle = { ...article, createdAt: Date.now() };
  if (newArticle.id) delete newArticle.id; // 파이어베이스가 자동 ID 생성하도록 함
  const docRef = await addDoc(collection(db, "articles"), newArticle);
  return { id: docRef.id, ...newArticle };
};

// --- Draft Articles (Admin) ---
export const getDraftArticles = async () => {
  const q = query(collection(db, "draftArticles"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteDraftArticle = async (id) => {
  await deleteDoc(doc(db, "draftArticles", id));
};

export const updateDraftArticle = async (updatedDraft) => {
  const docRef = doc(db, "draftArticles", updatedDraft.id);
  const dataToUpdate = { ...updatedDraft };
  delete dataToUpdate.id;
  await updateDoc(docRef, dataToUpdate);
};

// --- Comments ---
export const getComments = async (articleId) => {
  const q = query(collection(db, "comments"), where("articleId", "==", articleId));
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return comments.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
};

export const postComment = async (comment) => {
  const newComment = { ...comment, createdAt: Date.now() };
  const docRef = await addDoc(collection(db, "comments"), newComment);
  return { id: docRef.id, ...newComment };
};

// --- Research Tasks ---
export const getResearchTasks = async () => {
  const q = query(collection(db, "researchTasks"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const postResearchTask = async (task) => {
  const newTask = { ...task, createdAt: Date.now() };
  const docRef = await addDoc(collection(db, "researchTasks"), newTask);
  return { id: docRef.id, ...newTask };
};

export const updateResearchTaskStatus = async (taskId, newStatus) => {
  const docRef = doc(db, "researchTasks", taskId);
  await updateDoc(docRef, { status: newStatus });
  return { id: taskId, status: newStatus };
};

export const updateResearchTaskReplies = async (taskId, replies) => {
  const docRef = doc(db, "researchTasks", taskId);
  await updateDoc(docRef, { replies });
  return { id: taskId, replies };
};
