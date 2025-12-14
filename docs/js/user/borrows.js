// User Borrow History
import { checkAuth, logout } from '../auth.js';
import { database } from '../firebase-config.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;

// Check authentication
checkAuth('user').then(({ user, userData }) => {
  currentUser = user;
  document.getElementById('userName').textContent = userData.username || userData.email;
  loadBorrows();
}).catch((error) => {
  console.error('Auth error:', error);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', logout);

const alertDiv = document.getElementById('alert');

function showAlert(message, type) {
  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertDiv.className = 'alert';
  }, 5000);
}

async function loadBorrows() {
  try {
    const borrowsRef = ref(database, 'borrowRecords');
    const snapshot = await get(borrowsRef);
    
    // Hide all loading indicators
    document.getElementById('activeLoading').classList.remove('show');
    document.getElementById('pendingLoading').classList.remove('show');
    document.getElementById('historyLoading').classList.remove('show');
    
    if (!snapshot.exists()) {
      showEmptyState();
      return;
    }
    
    const borrows = snapshot.val();
    const userBorrows = Object.entries(borrows)
      .map(([id, data]) => ({ id, ...data }))
      .filter(borrow => borrow.userId === currentUser.uid);
    
    // Separate by status
    const active = userBorrows.filter(b => b.status === 'borrowed');
    const pending = userBorrows.filter(b => b.status === 'pending_borrow' || b.status === 'pending_return');
    const history = userBorrows.filter(b => b.status === 'returned')
      .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));
    
    // Update counts
    document.getElementById('activeCount').textContent = active.length;
    document.getElementById('pendingCount').textContent = pending.length;
    
    // Render each section
    renderActiveBorrows(active);
    renderPendingRequests(pending);
    renderHistory(history);
    
  } catch (error) {
    console.error('Error loading borrows:', error);
    showAlert('Failed to load borrow history', 'error');
  }
}

function showEmptyState() {
  const sections = [
    { id: 'activeBorrows', message: 'You have no active borrows' },
    { id: 'pendingRequests', message: 'You have no pending requests' },
    { id: 'borrowHistory', message: 'No borrow history yet' }
  ];
  
  sections.forEach(section => {
    document.getElementById(section.id).innerHTML = 
      `<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">${section.message}</p>`;
  });
}

function renderActiveBorrows(borrows) {
  const container = document.getElementById('activeBorrows');
  
  if (borrows.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">You have no active borrows</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Book Title</th>
        <th>Borrowed Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${borrows.map(borrow => `
        <tr>
          <td><strong>${borrow.bookTitle}</strong></td>
          <td>${new Date(borrow.confirmedAt).toLocaleDateString()}</td>
          <td><span class="badge badge-info">Borrowed</span></td>
          <td>
            <button class="btn btn-warning" onclick="requestReturn('${borrow.id}')">Request Return</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

function renderPendingRequests(requests) {
  const container = document.getElementById('pendingRequests');
  
  if (requests.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">You have no pending requests</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Book Title</th>
        <th>Request Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${requests.map(request => `
        <tr>
          <td><strong>${request.bookTitle}</strong></td>
          <td>${new Date(request.borrowDate).toLocaleDateString()}</td>
          <td>
            <span class="badge badge-warning">
              ${request.status === 'pending_borrow' ? 'Pending Borrow' : 'Pending Return'}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

function renderHistory(history) {
  const container = document.getElementById('borrowHistory');
  
  if (history.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No borrow history yet</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Book Title</th>
        <th>Borrowed Date</th>
        <th>Returned Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${history.map(record => `
        <tr>
          <td><strong>${record.bookTitle}</strong></td>
          <td>${record.confirmedAt ? new Date(record.confirmedAt).toLocaleDateString() : 'N/A'}</td>
          <td>${record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'N/A'}</td>
          <td><span class="badge badge-success">Returned</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

// Make function global for onclick handler
window.requestReturn = async function(recordId) {
  if (!confirm('Do you want to request to return this book?')) {
    return;
  }
  
  try {
    const recordRef = ref(database, `borrowRecords/${recordId}`);
    await update(recordRef, {
      status: 'pending_return'
    });
    
    showAlert('Return request submitted! Waiting for admin confirmation.', 'success');
    loadBorrows();
    
  } catch (error) {
    console.error('Error requesting return:', error);
    showAlert('Failed to request return: ' + error.message, 'error');
  }
};
