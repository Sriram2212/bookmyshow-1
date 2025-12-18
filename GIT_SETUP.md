# Git Setup & GitHub Upload Guide

## 📋 Prerequisites

1. Git installed on your system
2. GitHub account created
3. Git configured with your details

---

## 🔧 Step 1: Configure Git (First Time Only)

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

## 🚀 Step 2: Initialize Git Repository

```powershell
# Navigate to project folder
cd d:\bookmyshow

# Initialize Git repository
git init

# Check status
git status
```

**Expected Output:**
```
Initialized empty Git repository in d:/bookmyshow/.git/
```

---

## 📝 Step 3: Verify .gitignore

Your `.gitignore` file already exists and includes:

```
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Build files
/build
/dist

# IDE files
.vscode/
.idea/

# Logs
*.log
```

**✅ This will exclude:**
- `server/node_modules/`
- `client/node_modules/`
- `.env` files (keeps secrets safe)
- Build folders
- IDE settings
- Log files

---

## 📦 Step 4: Stage All Files

```powershell
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status
```

**Should see:**
```
On branch main

Changes to be committed:
  new file:   .gitignore
  new file:   README.md
  new file:   server/package.json
  new file:   server/src/index.js
  new file:   client/package.json
  new file:   client/src/App.js
  ... (many more files)
```

**Should NOT see:**
```
❌ server/node_modules/
❌ client/node_modules/
❌ .env files
```

---

## 💾 Step 5: Create First Commit

```powershell
# Commit with message
git commit -m "Initial commit: BookMyShow clone with MongoDB-only mode"
```

**Expected Output:**
```
[main (root-commit) abc1234] Initial commit: BookMyShow clone with MongoDB-only mode
 XX files changed, XXXX insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 ...
```

---

## 🌐 Step 6: Create GitHub Repository

### Option A: Using GitHub Website

1. Go to https://github.com
2. Click "+" icon → "New repository"
3. Enter repository name: `bookmyshow-clone`
4. Description: `Movie ticket booking system with MongoDB`
5. Choose: **Public** or **Private**
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

### Option B: Using GitHub CLI (if installed)

```powershell
gh repo create bookmyshow-clone --public --source=. --remote=origin --push
```

---

## 🔗 Step 7: Connect to GitHub

After creating repository on GitHub, you'll see commands like:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/bookmyshow-clone.git

# Verify remote
git remote -v
```

**Expected Output:**
```
origin  https://github.com/YOUR-USERNAME/bookmyshow-clone.git (fetch)
origin  https://github.com/YOUR-USERNAME/bookmyshow-clone.git (push)
```

---

## 📤 Step 8: Push to GitHub

```powershell
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
Delta compression using up to X threads
Compressing objects: 100% (XXX/XXX), done.
Writing objects: 100% (XXX/XXX), XX.XX MiB | X.XX MiB/s, done.
Total XXX (delta XX), reused 0 (delta 0), pack-reused 0
To https://github.com/YOUR-USERNAME/bookmyshow-clone.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ Step 9: Verify Upload

1. Go to https://github.com/YOUR-USERNAME/bookmyshow-clone
2. You should see all your files
3. **Verify node_modules is NOT there** ✅
4. **Verify .env is NOT there** ✅

---

## 📝 Step 10: Create README.md for GitHub

Your project already has a comprehensive README.md. To make it GitHub-friendly, let me create an enhanced version:

---

## 🔄 Future Updates

### When you make changes:

```powershell
# Check what changed
git status

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Common commit messages:

```powershell
git commit -m "Add seat booking feature"
git commit -m "Fix authentication bug"
git commit -m "Update documentation"
git commit -m "Improve performance"
git commit -m "Add error handling"
```

---

## 🌿 Working with Branches (Optional)

```powershell
# Create new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature

# Switch back to main
git checkout main

# Merge branch
git merge feature/new-feature
```

---

## 🔍 Useful Git Commands

```powershell
# View commit history
git log --oneline

# View changes
git diff

# Undo changes (before commit)
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote URL
git remote -v

# Pull latest changes
git pull origin main

# Clone repository (on another machine)
git clone https://github.com/YOUR-USERNAME/bookmyshow-clone.git
```

---

## 📦 What Gets Uploaded to GitHub

### ✅ Included:
- Source code (`.js`, `.jsx`, `.css` files)
- Configuration files (`package.json`, `.gitignore`)
- Documentation (`.md` files)
- Public assets (images, icons)
- Example environment file (`.env.example`)

### ❌ Excluded (by .gitignore):
- `node_modules/` folders (too large, can be reinstalled)
- `.env` files (contain secrets)
- Build folders (`/build`, `/dist`)
- Log files (`*.log`)
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

---

## 🚨 Important Security Notes

### Never commit these files:
- ❌ `.env` (contains database passwords, API keys)
- ❌ `node_modules/` (too large, unnecessary)
- ❌ Private keys or certificates
- ❌ Database dumps with real data

### If you accidentally committed .env:

```powershell
# Remove from Git (keeps local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from repository"

# Push changes
git push

# Then change all passwords/keys in .env!
```

---

## 📋 Setup Instructions for Others

When someone clones your repository:

```powershell
# Clone repository
git clone https://github.com/YOUR-USERNAME/bookmyshow-clone.git

# Navigate to project
cd bookmyshow-clone

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Create .env file (copy from .env.example)
cd ../server
copy .env.example .env
# Edit .env with actual values

# Seed database
npm run seed

# Start application
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm start
```

---

## 🎯 Quick Commands Summary

```powershell
# Initial setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/bookmyshow-clone.git
git push -u origin main

# Regular updates
git add .
git commit -m "Your message"
git push

# Check status
git status

# View history
git log --oneline
```

---

## 🎉 Success Checklist

After following these steps:

- [ ] Git repository initialized
- [ ] All files committed locally
- [ ] GitHub repository created
- [ ] Remote origin added
- [ ] Code pushed to GitHub
- [ ] Verified on GitHub website
- [ ] node_modules NOT in repository
- [ ] .env NOT in repository
- [ ] README.md visible on GitHub
- [ ] Repository is public/private as desired

---

## 📞 Troubleshooting

### Error: "fatal: not a git repository"
**Solution:** Run `git init` first

### Error: "remote origin already exists"
**Solution:** 
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/bookmyshow-clone.git
```

### Error: "failed to push some refs"
**Solution:**
```powershell
git pull origin main --rebase
git push origin main
```

### Error: "Permission denied (publickey)"
**Solution:** Use HTTPS URL instead of SSH, or set up SSH keys

### Large files warning
**Solution:** Make sure `.gitignore` includes `node_modules/`

---

## 🌟 GitHub Repository Features

Once uploaded, you can:

1. **Share your project** - Send GitHub link to others
2. **Collaborate** - Others can fork and contribute
3. **Track issues** - Use GitHub Issues for bugs
4. **Documentation** - README.md shows on main page
5. **Releases** - Tag versions of your project
6. **GitHub Pages** - Host frontend (optional)
7. **Actions** - Set up CI/CD (advanced)

---

**Your project is now on GitHub! 🎉**

Repository URL: `https://github.com/YOUR-USERNAME/bookmyshow-clone`
