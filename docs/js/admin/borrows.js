// Admin Borrow Management
import { checkAuth, logout } from '../auth.js';
import { database } from '../firebase-config.js';
import { ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;

// Check authentication
checkAuth('admin').then(({ user, userData }) => {
  currentUser = user;
  document.getElementById('adminName').textContent = userData.username || userData.email;
  loadRequests();
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

async function loadRequests() {
  try {
    const borrowsRef = ref(database, 'borrowRecords');
    const snapshot = await get(borrowsRef);
    
    // Hide all loading indicators
    document.getElementById('borrowLoading').classList.remove('show');
    document.getElementById('returnLoading').classList.remove('show');
    document.getElementById('activeLoading').classList.remove('show');
    document.getElementById('completedLoading').classList.remove('show');
    
    if (!snapshot.exists()) {
      showEmptyState();
      return;
    }
    
    const borrows = snapshot.val();
    const borrowArray = Object.entries(borrows).map(([id, data]) => ({ id, ...data }));
    
    // Separate by status
    const pendingBorrow = borrowArray.filter(b => b.status === 'pending_borrow');
    const pendingReturn = borrowArray.filter(b => b.status === 'pending_return');
    const active = borrowArray.filter(b => b.status === 'borrowed');
    const completed = borrowArray.filter(b => b.status === 'returned')
      .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
      .slice(0, 10);
    
    // Update counts
    document.getElementById('borrowCount').textContent = pendingBorrow.length;
    document.getElementById('returnCount').textContent = pendingReturn.length;
    document.getElementById('activeCount').textContent = active.length;
    
    // Render each section
    renderBorrowRequests(pendingBorrow);
    renderReturnRequests(pendingReturn);
    renderActiveBorrows(active);
    renderCompletedReturns(completed);
    
  } catch (error) {
    console.error('Error loading requests:', error);
    showAlert('Failed to load requests', 'error');
  }
}

function showEmptyState() {
  const sections = [
    { id: 'borrowRequests', message: 'No pending borrow requests' },
    { id: 'returnRequests', message: 'No pending return requests' },
    { id: 'activeBorrows', message: 'No active borrows' },
    { id: 'completedReturns', message: 'No completed returns yet' }
  ];
  
  sections.forEach(section => {
    document.getElementById(section.id).innerHTML = 
      `<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">${section.message}</p>`;
  });
}

function renderBorrowRequests(requests) {
  const container = document.getElementById('borrowRequests');
  
  if (requests.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No pending borrow requests</p>';
    return;
  }
  
  container.innerHTML = requests.map(request => `
    <div class="request-item">
      <div class="request-info">
        <h5>${request.bookTitle}</h5>
        <p><strong>User:</strong> ${request.userName} | <strong>Requested:</strong> ${new Date(request.borrowDate).toLocaleDateString()}</p>
      </div>
      <div class="request-actions">
        <button class="btn btn-success" onclick="confirmBorrow('${request.id}')">Approve</button>
        <button class="btn btn-danger" onclick="rejectBorrow('${request.id}')">Reject</button>
      </div>
    </div>
  `).join('');
}

function renderReturnRequests(requests) {
  const container = document.getElementById('returnRequests');
  
  if (requests.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No pending return requests</p>';
    return;
  }
  
  container.innerHTML = requests.map(request => `
    <div class="request-item">
      <div class="request-info">
        <h5>${request.bookTitle}</h5>
        <p><strong>User:</strong> ${request.userName} | <strong>Borrowed:</strong> ${new Date(request.confirmedAt).toLocaleDateString()}</p>
      </div>
      <div class="request-actions">
        <button class="btn btn-success" onclick="confirmReturn('${request.id}')">Confirm Return</button>
      </div>
    </div>
  `).join('');
}

function renderActiveBorrows(borrows) {
  const container = document.getElementById('activeBorrows');
  
  if (borrows.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No active borrows</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>User</th>
        <th>Book</th>
        <th>Borrowed Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${borrows.map(borrow => `
        <tr>
          <td>${borrow.userName}</td>
          <td>${borrow.bookTitle}</td>
          <td>${new Date(borrow.confirmedAt).toLocaleDateString()}</td>
          <td><span class="badge badge-info">Borrowed</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

function renderCompletedReturns(returns) {
  const container = document.getElementById('completedReturns');
  
  if (returns.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No completed returns yet</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>User</th>
        <th>Book</th>
        <th>Borrowed</th>
        <th>Returned</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${returns.map(ret => `
        <tr>
          <td>${ret.userName}</td>
          <td>${ret.bookTitle}</td>
          <td>${new Date(ret.confirmedAt).toLocaleDateString()}</td>
          <td>${ret.returnDate ? new Date(ret.returnDate).toLocaleDateString() : 'N/A'}</td>
          <td><span class="badge badge-success">Returned</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

// Make functions global for onclick handlers
window.confirmBorrow = async function(recordId) {
  try {
    const recordRef = ref(database, `borrowRecords/${recordId}`);
    const snapshot = await get(recordRef);
    
    if (!snapshot.exists()) {
      showAlert('Borrow request not found', 'error');
      return;
    }
    
    const record = snapshot.val();
    
    // Check if book is still available
    const bookRef = ref(database, `books/${record.bookId}`);
    const bookSnapshot = await get(bookRef);
    
    if (!bookSnapshot.exists()) {
      showAlert('Book not found', 'error');
      return;
    }
    
    const book = bookSnapshot.val();
    
    if (book.availableCopies <= 0) {
      showAlert('No copies available for this book', 'error');
      return;
    }
    
    // Update borrow record
    await update(recordRef, {
      status: 'borrowed',
      confirmedBy: currentUser.uid,
      confirmedAt: new Date().toISOString()
    });
    
    // Decrease available copies
    await update(bookRef, {
      availableCopies: book.availableCopies - 1
    });
    
    showAlert('Borrow request approved!', 'success');
    loadRequests();
    
  } catch (error) {
    console.error('Error confirming borrow:', error);
    showAlert('Failed to confirm borrow: ' + error.message, 'error');
  }
};

window.rejectBorrow = async function(recordId) {
  if (!confirm('Are you sure you want to reject this borrow request?')) {
    return;
  }
  
  try {
    const recordRef = ref(database, `borrowRecords/${recordId}`);
    const snapshot = await get(recordRef);
    
    if (!snapshot.exists()) {
      showAlert('Borrow request not found', 'error');
      return;
    }
    
    // Delete the record
    await remove(recordRef);
    
    showAlert('Borrow request rejected', 'info');
    loadRequests();
    
  } catch (error) {
    console.error('Error rejecting borrow:', error);
    showAlert('Failed to reject borrow: ' + error.message, 'error');
  }
};

window.confirmReturn = async function(recordId) {
  try {
    const recordRef = ref(database, `borrowRecords/${recordId}`);
    const snapshot = await get(recordRef);
    
    if (!snapshot.exists()) {
      showAlert('Return request not found', 'error');
      return;
    }
    
    const record = snapshot.val();
    
    // Update borrow record
    await update(recordRef, {
      status: 'returned',
      returnDate: new Date().toISOString()
    });
    
    // Increase available copies
    const bookRef = ref(database, `books/${record.bookId}`);
    const bookSnapshot = await get(bookRef);
    
    if (bookSnapshot.exists()) {
      const book = bookSnapshot.val();
      await update(bookRef, {
        availableCopies: book.availableCopies + 1
      });
    }
    
    showAlert('Return confirmed!', 'success');
    loadRequests();
    
  } catch (error) {
    console.error('Error confirming return:', error);
    showAlert('Failed to confirm return: ' + error.message, 'error');
  }
};
