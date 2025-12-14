// User Book Browsing
import { checkAuth, logout } from '../auth.js';
import { database } from '../firebase-config.js';
import { ref, get, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let userData = null;
let allBooks = [];

// Check authentication
checkAuth('user').then(({ user, userData: userInfo }) => {
  currentUser = user;
  userData = userInfo;
  document.getElementById('userName').textContent = userInfo.username || userInfo.email;
  loadBooks();
}).catch((error) => {
  console.error('Auth error:', error);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', logout);

// Search and filter
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const alertDiv = document.getElementById('alert');

searchInput.addEventListener('input', filterBooks);
categoryFilter.addEventListener('change', filterBooks);

function showAlert(message, type) {
  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type} show`;
  setTimeout(() => {
    alertDiv.className = 'alert';
  }, 5000);
}

async function loadBooks() {
  const loading = document.getElementById('loading');
  const booksGrid = document.getElementById('booksGrid');
  
  try {
    const booksRef = ref(database, 'books');
    const snapshot = await get(booksRef);
    
    loading.classList.remove('show');
    
    if (!snapshot.exists()) {
      booksGrid.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem; grid-column: 1 / -1;">No books available</p>';
      return;
    }
    
    const books = snapshot.val();
    allBooks = Object.entries(books).map(([id, data]) => ({ id, ...data }));
    
    renderBooks(allBooks);
    
  } catch (error) {
    console.error('Error loading books:', error);
    loading.classList.remove('show');
    booksGrid.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 2rem; grid-column: 1 / -1;">Error loading books</p>';
  }
}

function filterBooks() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  
  let filtered = allBooks;
  
  if (searchTerm) {
    filtered = filtered.filter(book => 
      book.title?.toLowerCase().includes(searchTerm) ||
      book.author?.toLowerCase().includes(searchTerm) ||
      book.isbn?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (category) {
    filtered = filtered.filter(book => book.category === category);
  }
  
  renderBooks(filtered);
}

function renderBooks(books) {
  const booksGrid = document.getElementById('booksGrid');
  
  if (books.length === 0) {
    booksGrid.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem; grid-column: 1 / -1;">No books found</p>';
    return;
  }
  
  booksGrid.innerHTML = books.map(book => `
    <div class="card">
      ${book.coverImage ? `<img src="${book.coverImage}" alt="${book.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.375rem; margin-bottom: 1rem;">` : ''}
      <h4 style="margin-bottom: 0.5rem;">${book.title}</h4>
      <p style="color: var(--secondary-color); margin-bottom: 0.5rem;"><strong>Author:</strong> ${book.author}</p>
      <p style="color: var(--secondary-color); margin-bottom: 0.5rem;"><strong>Category:</strong> <span class="badge badge-info">${book.category}</span></p>
      <p style="color: var(--secondary-color); margin-bottom: 0.5rem;"><strong>ISBN:</strong> ${book.isbn}</p>
      ${book.description ? `<p style="color: var(--secondary-color); margin-bottom: 1rem; font-size: 0.875rem;">${book.description.substring(0, 100)}${book.description.length > 100 ? '...' : ''}</p>` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="font-weight: bold; color: ${book.availableCopies > 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
          ${book.availableCopies > 0 ? `${book.availableCopies} available` : 'Not available'}
        </span>
      </div>
      <button 
        class="btn ${book.availableCopies > 0 ? 'btn-primary' : 'btn-secondary'}" 
        style="width: 100%;"
        ${book.availableCopies > 0 ? `onclick="borrowBook('${book.id}', '${book.title}')"` : 'disabled'}
      >
        ${book.availableCopies > 0 ? 'Borrow Book' : 'Not Available'}
      </button>
    </div>
  `).join('');
}

// Make function global for onclick handler
window.borrowBook = async function(bookId, bookTitle) {
  if (!confirm(`Do you want to borrow "${bookTitle}"?`)) {
    return;
  }
  
  try {
    // Check if user already has a pending or active borrow for this book
    const borrowsRef = ref(database, 'borrowRecords');
    const borrowsSnapshot = await get(borrowsRef);
    
    if (borrowsSnapshot.exists()) {
      const borrows = borrowsSnapshot.val();
      const existingBorrow = Object.values(borrows).find(
        borrow => borrow.userId === currentUser.uid && 
                  borrow.bookId === bookId && 
                  (borrow.status === 'pending_borrow' || borrow.status === 'borrowed')
      );
      
      if (existingBorrow) {
        showAlert('You already have an active or pending borrow for this book', 'error');
        return;
      }
    }
    
    // Create borrow request
    const newBorrowRef = push(borrowsRef);
    await set(newBorrowRef, {
      userId: currentUser.uid,
      bookId: bookId,
      bookTitle: bookTitle,
      userName: userData.username || userData.email,
      borrowDate: new Date().toISOString(),
      returnDate: null,
      status: 'pending_borrow',
      confirmedBy: null,
      confirmedAt: null
    });
    
    showAlert('Borrow request submitted! Waiting for admin approval.', 'success');
    
  } catch (error) {
    console.error('Error borrowing book:', error);
    showAlert('Failed to submit borrow request: ' + error.message, 'error');
  }
};
