# 🛠️ Development Workflow

## 📋 Pre-Push Checklist

**CRITICAL: Always build BEFORE committing and pushing!**

```bash
# Step 1: Make your changes
# ... edit files ...

# Step 2: Build to verify (REQUIRED!)
npm run build

# Step 3: If build passes, then commit
git add .
git commit -m "your message"

# Step 4: Push to remote
git push
```

## ✅ Why Build First?

- **Catches TypeScript errors** before they reach the repo
- **Verifies production build** works correctly
- **Prevents broken commits** from being pushed
- **Saves time** debugging issues later

## 🚨 Never Skip This!

❌ **BAD:** `git add . && git commit && git push`
✅ **GOOD:** `npm run build && git add . && git commit && git push`

## 📝 Example Workflow

```bash
# After making changes to the invoice app
cd invoice

# Build first!
npm run build
# ✓ Compiled successfully
# ✓ TypeScript passed
# ✓ Build complete

# Now safe to commit
git add .
git commit -m "feat: add new feature"
git push
```

---

*Remember: Build First, Commit Later!*
