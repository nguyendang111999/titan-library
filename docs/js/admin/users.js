// Admin User Management
import { checkAuth, logout } from '../auth.js';
import { database, auth } from '../firebase-config.js';
import { ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { ref as dbRef, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let allUsers = [];

// Check authentication
checkAuth('admin').then(({ user, userData }) => {
  currentUser = user;
  document.getElementById('adminName').textContent = userData.username || userData.email;
  loadUsers();
}).catch((error) => {
  console.error('Auth error:', error);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', logout);

// Modal controls
const modal = document.getElementById('addUserModal');
const addUserBtn = document.getElementById('addUserBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addUserForm = document.getElementById('addUserForm');
const alertDiv = document.getElementById('alert');

addUserBtn.addEventListener('click', () => {
  modal.classList.add('show');
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  addUserForm.reset();
});

cancelBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  addUserForm.reset();
});

// Add user form submission
addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    
    // Save user data to database
    const userRef = dbRef(database, `users/${newUser.uid}`);
    await set(userRef, {
      username: username,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    });
    
    showAlert('User created successfully!', 'success');
    modal.classList.remove('show');
    addUserForm.reset();
    loadUsers();
    
  } catch (error) {
    console.error('Error creating user:', error);
    let errorMessage = 'Failed to create user';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email is already in use';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    }
    
    showAlert(errorMessage, 'error');
  }
});

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  filterUsers();
});

function showAlert(message, type) {
  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertDiv.className = 'alert';
  }, 5000);
}

async function loadUsers() {
  const loading = document.getElementById('loading');
  const usersTable = document.getElementById('usersTable');
  
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    loading.classList.remove('show');
    
    if (!snapshot.exists()) {
      usersTable.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No users found</p>';
      return;
    }
    
    const users = snapshot.val();
    allUsers = Object.entries(users)
      .map(([id, data]) => ({ id, ...data }))
      .filter(user => user.role === 'user');
    
    renderUsers(allUsers);
    
  } catch (error) {
    console.error('Error loading users:', error);
    loading.classList.remove('show');
    usersTable.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 2rem;">Error loading users</p>';
  }
}

function filterUsers() {
  const searchTerm = searchInput.value.toLowerCase();
  
  const filtered = allUsers.filter(user => 
    user.username?.toLowerCase().includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm)
  );
  
  renderUsers(filtered);
}

function renderUsers(users) {
  const usersTable = document.getElementById('usersTable');
  
  if (users.length === 0) {
    usersTable.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No users found</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Created At</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${users.map(user => `
        <tr>
          <td>${user.username || 'N/A'}</td>
          <td>${user.email}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          <td><span class="badge badge-success">Active</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  usersTable.innerHTML = '';
  usersTable.appendChild(table);
}
