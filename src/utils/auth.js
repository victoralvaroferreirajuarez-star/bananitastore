// ========================================
// Auth System
// ========================================

import { getUsers, saveUsers } from './storage.js';

export function getCurrentUser() {
  const userId = localStorage.getItem('bs_session');
  if (!userId) return null;
  return getUsers().find(u => u.id === userId) || null;
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

export function isSeller() {
  const user = getCurrentUser();
  return user && (user.role === 'seller' || user.role === 'admin');
}

export function isBuyer() {
  const user = getCurrentUser();
  return user && (user.role === 'buyer' || user.role === 'both' || user.role === 'admin');
}

export function login(email, password) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  if (!user) return { success: false, message: 'Email o contraseña incorrectos' };
  if (user.banned) return { success: false, message: 'Tu cuenta ha sido suspendida' };
  localStorage.setItem('bs_session', user.id);
  return { success: true, user };
}

export function register(username, email, password) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'Ya existe una cuenta con ese email' };
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Ese nombre de usuario ya está en uso' };
  }
  const newUser = {
    id: 'user_' + Date.now(),
    username,
    email: normalizedEmail,
    password,
    role: 'buyer',
    avatar: username.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString(),
    banned: false,
    paypalEmail: '',
    sellerPin: '',
    sellerApproved: false,
    bio: ''
  };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem('bs_session', newUser.id);
  return { success: true, user: newUser };
}

export function logout() {
  localStorage.removeItem('bs_session');
}

export function updateProfile(data) {
  const user = getCurrentUser();
  if (!user) return false;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...data };
    saveUsers(users);
    return true;
  }
  return false;
}

export function verifySellerPin(pin) {
  const user = getCurrentUser();
  return user && user.sellerPin === pin;
}
