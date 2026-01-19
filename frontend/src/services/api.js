import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// SAVE USER AFTER SIGNUP
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

// GET USER ROLE AFTER LOGIN
export const getUserRole = (firebaseUid) => {
  return API.get(`/auth/role/${firebaseUid}`);
};

export const getStudentsOfTeacher = (firebaseUid) =>
  API.get(`/auth/students/${firebaseUid}`);
export default API;
