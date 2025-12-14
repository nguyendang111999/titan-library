# ⚡ Quick Start Guide

Get your Titan Library Management System up and running in 15 minutes!

## 🎯 Step 1: Firebase Setup (5 minutes)

### Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "Titan Library")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Enable Authentication
1. In your project, go to **"Authentication"**
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Toggle **"Enable"** and **"Save"**

### Create Database
1. Go to **"Realtime Database"**
2. Click **"Create Database"**
3. Choose location (e.g., United States)
4. Start in **"Test mode"** → **"Enable"**

### Get Configuration
1. Click the **gear icon** ⚙️ → **"Project settings"**
2. Scroll to **"Your apps"**
3. Click **Web icon** (</>) → Name: "Titan Library" → **"Register app"**
4. **Copy** the `firebaseConfig` object

## 🔧 Step 2: Configure Your App (3 minutes)

1. Open `docs/js/firebase-config.js`
2. Replace the placeholder config with your copied config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_COPIED_API_KEY",
  authDomain: "YOUR_COPIED_AUTH_DOMAIN",
  databaseURL: "YOUR_COPIED_DATABASE_URL",
  projectId: "YOUR_COPIED_PROJECT_ID",
  storageBucket: "YOUR_COPIED_STORAGE_BUCKET",
  messagingSenderId: "YOUR_COPIED_MESSAGING_SENDER_ID",
  appId: "YOUR_COPIED_APP_ID"
};
```

3. Save the file

## 🔐 Step 3: Add Security Rules (2 minutes)

1. In Firebase Console, go to **Realtime Database** → **"Rules"**
2. Copy content from `firebase-rules.json` in this repo
3. Paste into the rules editor
4. Click **"Publish"**

## 👤 Step 4: Create Admin User (3 minutes)

### In Firebase Console:

1. Go to **Authentication** → **"Users"** → **"Add user"**
   - Email: `admin@yourcompany.com`
   - Password: Create a strong password
   - Click **"Add user"**

2. **Copy the User UID** from the users list

3. Go to **Realtime Database** → **"Data"**

4. Click the **"+"** next to your database name

5. Add this structure (replace `PASTE_YOUR_UID_HERE` with actual UID):

```json
{
  "users": {
    "PASTE_YOUR_UID_HERE": {
      "username": "admin",
      "email": "admin@yourcompany.com",
      "role": "admin",
      "createdAt": "2025-12-14T10:00:00Z"
    }
  }
}
```

6. Click **"Add"**

## 🚀 Step 5: Deploy to GitHub Pages (2 minutes)

### If not already in Git:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/titan-library.git
git push -u origin main
```

### Enable GitHub Pages:
1. Go to your GitHub repository → **"Settings"**
2. Scroll to **"Pages"**
3. Under **"Source"**:
   - Branch: **main**
   - Folder: **/docs**
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

## 🎉 Step 6: Test Your System

### Test Admin Access:
1. Visit: `https://YOUR_USERNAME.github.io/titan-library/`
2. Login with your admin credentials
3. You should see the admin dashboard

### Create a Test User:
1. In admin panel, click **"Users"** → **"Add New User"**
2. Create a test user account

### Add a Test Book:
1. Click **"Books"** → **"Add New Book"**
2. Fill in book details
3. Save

### Test User Flow:
1. Logout from admin
2. Login with test user credentials
3. Browse books
4. Request to borrow a book
5. Logout and login as admin
6. Approve the borrow request

## 🎊 Done!

Your library management system is now live and functional!

## 📚 Next Steps

- [ ] Change admin password
- [ ] Add your library's books
- [ ] Create user accounts for team members
- [ ] Customize the styling (optional)
- [ ] Set up regular backups

## 🆘 Having Issues?

### Can't login?
- Clear browser cache
- Check Firebase config is correct
- Verify user exists in both Authentication and Database

### Books not showing?
- Open browser console (F12)
- Check for error messages
- Verify Firebase rules are applied

### GitHub Pages not working?
- Wait 5 minutes for propagation
- Verify Pages is enabled for `/docs` folder
- Check repository is public

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Review `DEPLOYMENT.md` for troubleshooting
3. Check browser console for errors
4. Review Firebase logs
5. Create a GitHub issue

---

**Estimated Time:** 15 minutes
**Difficulty:** Beginner-friendly
**Cost:** Free (Firebase free tier)

Enjoy your new library management system! 📚✨
