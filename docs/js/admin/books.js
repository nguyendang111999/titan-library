// Admin Book Management
import { checkAuth, logout } from '../auth.js';
import { database } from '../firebase-config.js';
import { ref, get, set, push, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

let currentUser = null;
let allBooks = [];
let editingBookId = null;

// Check authentication
checkAuth('admin').then(({ user, userData }) => {
  currentUser = user;
  document.getElementById('adminName').textContent = userData.username || userData.email;
  loadBooks();
}).catch((error) => {
  console.error('Auth error:', error);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', logout);

// Modal controls
const modal = document.getElementById('bookModal');
const addBookBtn = document.getElementById('addBookBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const bookForm = document.getElementById('bookForm');
const alertDiv = document.getElementById('alert');
const modalTitle = document.getElementById('modalTitle');

addBookBtn.addEventListener('click', () => {
  editingBookId = null;
  modalTitle.textContent = 'Add New Book';
  bookForm.reset();
  modal.classList.add('show');
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  bookForm.reset();
  editingBookId = null;
});

cancelBtn.addEventListener('click', () => {
  modal.classList.remove('show');
  bookForm.reset();
  editingBookId = null;
});

// Book form submission
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const bookData = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    isbn: document.getElementById('isbn').value,
    category: document.getElementById('category').value,
    totalCopies: parseInt(document.getElementById('totalCopies').value),
    description: document.getElementById('description').value,
    coverImage: document.getElementById('coverImage').value,
    lastModified: new Date().toISOString(),
    addedBy: currentUser.uid
  };
  
  try {
    if (editingBookId) {
      // Update existing book
      const bookRef = ref(database, `books/${editingBookId}`);
      const snapshot = await get(bookRef);
      const existingBook = snapshot.val();
      
      // Calculate available copies based on the difference in total copies
      const copiesDifference = bookData.totalCopies - existingBook.totalCopies;
      bookData.availableCopies = (existingBook.availableCopies || 0) + copiesDifference;
      
      // Ensure available copies doesn't go negative
      if (bookData.availableCopies < 0) {
        bookData.availableCopies = 0;
      }
      
      bookData.addedAt = existingBook.addedAt;
      
      await set(bookRef, bookData);
      showAlert('Book updated successfully!', 'success');
    } else {
      // Add new book
      bookData.availableCopies = bookData.totalCopies;
      bookData.addedAt = new Date().toISOString();
      
      const booksRef = ref(database, 'books');
      const newBookRef = push(booksRef);
      await set(newBookRef, bookData);
      showAlert('Book added successfully!', 'success');
    }
    
    modal.classList.remove('show');
    bookForm.reset();
    editingBookId = null;
    loadBooks();
    
  } catch (error) {
    console.error('Error saving book:', error);
    showAlert('Failed to save book: ' + error.message, 'error');
  }
});

// Search and filter functionality
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

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
  const booksTable = document.getElementById('booksTable');
  
  try {
    const booksRef = ref(database, 'books');
    const snapshot = await get(booksRef);
    
    loading.classList.remove('show');
    
    if (!snapshot.exists()) {
      booksTable.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No books found</p>';
      return;
    }
    
    const books = snapshot.val();
    allBooks = Object.entries(books).map(([id, data]) => ({ id, ...data }));
    
    renderBooks(allBooks);
    
  } catch (error) {
    console.error('Error loading books:', error);
    loading.classList.remove('show');
    booksTable.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 2rem;">Error loading books</p>';
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
  const booksTable = document.getElementById('booksTable');
  
  if (books.length === 0) {
    booksTable.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 2rem;">No books found</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th>
        <th>Author</th>
        <th>ISBN</th>
        <th>Category</th>
        <th>Copies</th>
        <th>Available</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${books.map(book => `
        <tr>
          <td><strong>${book.title}</strong></td>
          <td>${book.author}</td>
          <td>${book.isbn}</td>
          <td><span class="badge badge-info">${book.category}</span></td>
          <td>${book.totalCopies}</td>
          <td><span class="badge badge-${book.availableCopies > 0 ? 'success' : 'danger'}">${book.availableCopies}</span></td>
          <td>
            <div class="actions">
              <button class="btn btn-primary" onclick="editBook('${book.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteBook('${book.id}', '${book.title}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  booksTable.innerHTML = '';
  booksTable.appendChild(table);
}

// Make functions global for onclick handlers
window.editBook = async function(bookId) {
  try {
    const bookRef = ref(database, `books/${bookId}`);
    const snapshot = await get(bookRef);
    
    if (snapshot.exists()) {
      const book = snapshot.val();
      editingBookId = bookId;
      
      document.getElementById('title').value = book.title;
      document.getElementById('author').value = book.author;
      document.getElementById('isbn').value = book.isbn;
      document.getElementById('category').value = book.category;
      document.getElementById('totalCopies').value = book.totalCopies;
      document.getElementById('description').value = book.description || '';
      document.getElementById('coverImage').value = book.coverImage || '';
      
      modalTitle.textContent = 'Edit Book';
      modal.classList.add('show');
    }
  } catch (error) {
    console.error('Error loading book:', error);
    showAlert('Failed to load book details', 'error');
  }
};

window.deleteBook = async function(bookId, bookTitle) {
  if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
    return;
  }
  
  try {
    // Check if book has active borrows
    const borrowsRef = ref(database, 'borrowRecords');
    const borrowsSnapshot = await get(borrowsRef);
    
    if (borrowsSnapshot.exists()) {
      const borrows = borrowsSnapshot.val();
      const activeBorrows = Object.values(borrows).filter(
        borrow => borrow.bookId === bookId && (borrow.status === 'borrowed' || borrow.status === 'pending_borrow')
      );
      
      if (activeBorrows.length > 0) {
        showAlert('Cannot delete book with active borrows. Please wait for all copies to be returned.', 'error');
        return;
      }
    }
    
    const bookRef = ref(database, `books/${bookId}`);
    await remove(bookRef);
    
    showAlert('Book deleted successfully!', 'success');
    loadBooks();
    
  } catch (error) {
    console.error('Error deleting book:', error);
    showAlert('Failed to delete book: ' + error.message, 'error');
  }
};
