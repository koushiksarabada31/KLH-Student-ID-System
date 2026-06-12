export const USERS_KEY = "users";
export const CURRENT_USER_KEY = "currentUser";

export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({ fullName, email, username, password, year, department }) {
  const users = getUsers();

  if (!email || !email.toLowerCase().endsWith("@klh.edu.in")) {
    return { ok: false, message: "Only KLEF student emails are allowed." };
  }

  const localPart = email.split("@")[0];
  if (password !== localPart) {
    return { ok: false, message: "Password must match your email local-part." };
  }

  if (users.find((u) => u.username === username || u.email === email)) {
    return { ok: false, message: "User already exists." };
  }

  const user = {
    id: Date.now(),
    fullName,
    email,
    username,
    password,
    year,
    department,
    registeredAt: new Date().toISOString(),
    isAdmin: false,
  };

  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function loginUser({ identifier, password }) {
  if (identifier === "admin" && password === "admin123") {
    const admin = { id: "admin", username: "admin", fullName: "Administrator", isAdmin: true };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(admin));
    return { ok: true, user: admin };
  }

  const users = getUsers();
  const user = users.find(
    (u) => (u.username === identifier || u.email === identifier) && u.password === password
  );

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  }

  return { ok: false, message: "Invalid email or password." };
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
}
