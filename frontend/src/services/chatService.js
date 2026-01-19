import {
  collection,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/* ---------- CHAT ID ---------- */
export const getChatId = (teacherUid, studentUid) => {
  return teacherUid < studentUid
    ? `${teacherUid}_${studentUid}`
    : `${studentUid}_${teacherUid}`;
};

/* ---------- SEND MESSAGE ---------- */
export const sendMessage = async (chatId, senderId, text) => {
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      participants: chatId.split("_"),
      lastMessage: text,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await addDoc(collection(chatRef, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
};

/* ---------- LISTEN TO MESSAGES ---------- */
export const listenToMessages = (chatId, callback) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(messages);
  });
};
