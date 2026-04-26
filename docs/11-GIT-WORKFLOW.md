# 11 — Git Workflow

## Initial repository setup

```bash
mkdir ai-social-saas
cd ai-social-saas
git init
```

## Add remote GitHub repo

Create a GitHub repository named:

```text
ai-social-saas
```

Then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-social-saas.git
```

Check remote:

```bash
git remote -v
```

Expected:

```text
origin  https://github.com/YOUR_USERNAME/ai-social-saas.git (fetch)
origin  https://github.com/YOUR_USERNAME/ai-social-saas.git (push)
```

## First commit

```bash
git add .
git commit -m "chore: initialize project skeleton"
git branch -M main
git push -u origin main
```

## Daily workflow

Before coding:

```bash
git status
git pull
```

After coding:

```bash
git status
git add .
git commit -m "feat: describe change here"
git push
```

## Useful Git commands

Check current remote:

```bash
git remote get-url origin
```

Check branch:

```bash
git branch
```

Check recent commits:

```bash
git log --oneline --graph --decorate -10
```

Undo unstaged file changes:

```bash
git restore FILE_PATH
```

## Branch rule

For now, use only:

```text
main
```

Later, when the project becomes more stable, use feature branches:

```bash
git checkout -b feat/customer-form
```
