# 📚 Titan Library Management System

A modern, web-based library management system built for small company libraries. The system features role-based access control with separate interfaces for administrators and regular users, enabling efficient book management and borrowing operations.

## 🌟 Features

### Admin Features
- **User Management** - Create and manage library member accounts
- **Book Catalog Management** - Add, edit, and remove books from the library
- **Borrow Request Management** - Approve or reject book borrow requests
- **Return Confirmation** - Process and confirm book returns
- **Dashboard Analytics** - View statistics and recent activities
- **Real-time Updates** - Track book availability and borrowing status

### User Features
- **Browse Books** - View all available books with detailed information
- **Search & Filter** - Find books by title, author, ISBN, or category
- **Borrow Books** - Submit requests to borrow available books
- **Return Books** - Request to return borrowed books
- **Borrow History** - View personal borrowing records and status
- **Change Password** - Update account password securely

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Backend:** Firebase Realtime Database
- **Authentication:** Firebase Authentication
- **Hosting:** GitHub Pages (served from `/docs` folder)

## 📁 Project Structure

```
titan-library/
├── docs/                              # GitHub Pages root
│   ├── index.html                     # Login page
│   ├── admin/
│   │   ├── dashboard.html             # Admin main dashboard
│   │   ├── users.html                 # User management
│   │   ├── books.html                 # Book management
│   │   └── borrow-requests.html       # Borrow/return confirmations
│   ├── user/
│   │   ├── dashboard.html             # User main dashboard
│   │   ├── books.html                 # Browse & borrow books
│   │   └── my-borrows.html            # User's borrow history
│   ├── css/
│   │   ├── style.css                  # Global styles
│   │   └── admin.css                  # Admin-specific styles
│   ├── js/
│   │   ├── firebase-config.js         # Firebase initialization
│   │   ├── auth.js                    # Authentication logic
│   │   ├── admin/
│   │   │   ├── users.js               # User management functions
│   │   │   ├── books.js               # Book CRUD operations
│   │   │   └── borrows.js             # Borrow confirmations
│   │   └── user/
│   │       ├── books.js               # Browse books functionality
│   │       └── borrows.js             # Borrow/return requests
│   └── assets/
│       └── images/
│
├── firebase-rules.json                # Firebase security rules
├── firebase-database-structure.json   # Database structure reference
└── README.md                          # This file
```

## 🚀 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on "Web" icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Titan Library")
5. Copy the Firebase configuration object

### 2. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Save changes

#### Enable Realtime Database:
1. In Firebase Console, go to **Realtime Database**
2. Click **Create Database**
3. Choose a location (e.g., United States)
4. Start in **test mode** for now (we'll add security rules later)

### 3. Configure Firebase Credentials

1. Open `docs/js/firebase-config.js`
2. Replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Up Firebase Security Rules

1. In Firebase Console, go to **Realtime Database** > **Rules**
2. Copy the rules from `firebase-rules.json`
3. Paste and publish the rules

### 5. Create First Admin User

Since the system requires authentication, you need to manually create the first admin user:

#### Option A: Using Firebase Console
1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Enter email (e.g., `admin@company.com`) and password
4. Copy the User UID from the users list
5. Go to **Realtime Database** > **Data**
6. Click on the `+` icon to add data:
   ```json
   {
     "users": {
       "PASTE_USER_UID_HERE": {
         "username": "admin",
         "email": "admin@company.com",
         "role": "admin",
         "createdAt": "2025-12-14T10:00:00Z"
       }
     }
   }
   ```

#### Option B: Using Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Use Firebase Auth REST API to create user
# Then manually add to database
```

### 6. Deploy to GitHub Pages

1. Ensure all files are in the `/docs` folder
2. Commit and push to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial library management system"
   git push origin main
   ```
3. Go to your GitHub repository **Settings**
4. Scroll to **Pages** section
5. Under **Source**, select **main** branch and **/docs** folder
6. Click **Save**
7. Your site will be available at `https://yourusername.github.io/titan-library/`

## 📖 Usage Guide

### For Administrators

1. **Login** - Use admin credentials at the login page
2. **Dashboard** - View overview of library statistics
3. **Manage Users**:
   - Click "Users" in navigation
   - Click "Add New User" to create library members
   - View all registered users
4. **Manage Books**:
   - Click "Books" in navigation
   - Click "Add New Book" to add books to catalog
   - Edit or delete existing books
   - Track available copies
5. **Process Requests**:
   - Click "Requests" in navigation
   - Approve/reject borrow requests
   - Confirm book returns
   - View active borrows and history

### For Users

1. **Login** - Use user credentials provided by admin
2. **Dashboard** - View personal statistics and quick actions
3. **Browse Books**:
   - Click "Browse Books" in navigation
   - Search by title, author, or ISBN
   - Filter by category
   - View book details and availability
4. **Borrow Books**:
   - Click "Borrow Book" on available books
   - Wait for admin approval
   - Track request status in "My Borrows"
5. **Return Books**:
   - Go to "My Borrows"
   - Click "Request Return" on borrowed books
   - Wait for admin confirmation
6. **Change Password**:
   - Click "Change Password" in dashboard
   - Enter new password
   - Confirm changes

## 🔐 Security

- All pages require authentication
- Role-based access control (admin vs. user)
- Firebase security rules enforce permissions
- Password authentication with minimum 6 characters
- Secure Firebase SDK (v10+) with modular imports

## 📊 Database Structure

### Users Collection
```json
{
  "username": "string",
  "email": "string",
  "role": "admin" | "user",
  "createdAt": "ISO 8601 timestamp"
}
```

### Books Collection
```json
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "category": "string",
  "description": "string",
  "totalCopies": "number",
  "availableCopies": "number",
  "coverImage": "string (URL)",
  "addedAt": "ISO 8601 timestamp",
  "addedBy": "userId",
  "lastModified": "ISO 8601 timestamp"
}
```

### Borrow Records Collection
```json
{
  "userId": "string",
  "bookId": "string",
  "bookTitle": "string",
  "userName": "string",
  "borrowDate": "ISO 8601 timestamp",
  "returnDate": "ISO 8601 timestamp | null",
  "status": "pending_borrow" | "borrowed" | "pending_return" | "returned",
  "confirmedBy": "userId | null",
  "confirmedAt": "ISO 8601 timestamp | null"
}
```

## 🔄 Status Flow

```
Borrow Request:
User creates → pending_borrow → Admin approves → borrowed

Return Request:
User requests → pending_return → Admin confirms → returned
```

## 🎨 Customization

### Styling
- Modify `docs/css/style.css` for global styles
- Modify `docs/css/admin.css` for admin-specific styles
- CSS variables defined in `:root` for easy theme customization

### Categories
Add or modify book categories in:
- `docs/admin/books.html`
- `docs/user/books.html`

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `firebase-config.js`
- Check Firebase project is active
- Ensure Realtime Database is enabled

### Authentication Errors
- Verify Email/Password authentication is enabled
- Check Firebase security rules are correctly set
- Ensure user exists in both Authentication and Database

### Books Not Showing
- Check books exist in Firebase Realtime Database
- Verify user is authenticated
- Check browser console for errors

### Deploy Issues
- Ensure files are in `/docs` folder
- Check GitHub Pages is enabled in repository settings
- Verify source is set to `/docs` folder

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 📄 License

This project is open source and available for educational and commercial use.

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase Console for errors
3. Check browser console for JavaScript errors
4. Create an issue on GitHub

## 🙏 Acknowledgments

- Firebase for backend services
- GitHub Pages for hosting
- Modern CSS and JavaScript features for a clean user interface

---

Built with ❤️ for Titan Company Library
