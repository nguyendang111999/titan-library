# 🚀 Deployment Checklist

Quick reference guide for deploying the Titan Library Management System.

## Pre-Deployment Checklist

### 1. Firebase Setup
- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Enable Email/Password authentication
- [ ] Create Realtime Database
- [ ] Copy Firebase configuration

### 2. Configuration
- [ ] Update `docs/js/firebase-config.js` with your Firebase credentials
- [ ] Apply Firebase security rules from `firebase-rules.json`

### 3. Initial Admin User
- [ ] Create admin user in Firebase Authentication
- [ ] Add admin user data to Realtime Database with role: "admin"

### 4. GitHub Pages
- [ ] Commit all changes to your repository
- [ ] Enable GitHub Pages in repository settings
- [ ] Set source to `main` branch and `/docs` folder

## Post-Deployment Verification

### Test Admin Functions
- [ ] Login as admin
- [ ] Create a test user
- [ ] Add a test book
- [ ] Verify dashboard statistics

### Test User Functions
- [ ] Login as regular user
- [ ] Browse books
- [ ] Submit borrow request
- [ ] Test admin approval workflow

### Security Check
- [ ] Verify users cannot access admin pages
- [ ] Verify authentication is required for all pages
- [ ] Test password change functionality

## Firebase Configuration Example

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Creating First Admin User

### Method 1: Firebase Console (Recommended)
1. Go to Authentication → Users → Add user
2. Enter email and password
3. Copy the User UID
4. Go to Realtime Database → Data
5. Create structure:
```json
{
  "users": {
    "USER_UID_HERE": {
      "username": "admin",
      "email": "admin@company.com",
      "role": "admin",
      "createdAt": "2025-12-14T10:00:00Z"
    }
  }
}
```

### Method 2: Using Import
1. Prepare a JSON file with the user data
2. Go to Realtime Database → ⋮ → Import JSON
3. Select your JSON file

## Troubleshooting

### Issue: "Permission Denied" errors
**Solution:** Verify Firebase security rules are properly applied

### Issue: Login redirects to wrong page
**Solution:** Check that user has correct role in database

### Issue: Books not loading
**Solution:** 
- Verify Firebase database URL is correct
- Check browser console for errors
- Ensure books exist in database

### Issue: GitHub Pages shows 404
**Solution:**
- Verify GitHub Pages is enabled
- Check that source is set to `/docs` folder
- Wait a few minutes for deployment to propagate

## Environment Variables (Future Enhancement)

For better security, consider moving Firebase config to environment variables in production:
- Use GitHub Secrets for CI/CD
- Implement backend proxy for sensitive operations
- Add rate limiting and monitoring

## Monitoring

After deployment, monitor:
- Firebase Authentication logs
- Database read/write operations
- User activity and error reports
- Performance metrics

## Backup Strategy

Recommended backup schedule:
- **Daily:** Export user data and borrow records
- **Weekly:** Full database backup
- **Monthly:** Archive old borrow records

Use Firebase Console → Realtime Database → Export JSON

## Support

For issues:
1. Check browser console for errors
2. Review Firebase logs
3. Verify configuration settings
4. Consult README.md for detailed documentation
5. Create GitHub issue with error details

---

**Last Updated:** December 2025
**Version:** 1.0.0
