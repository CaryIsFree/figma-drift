# Founder's Release Guide

This guide explains how to publish **Figma Drift** to the npm registry so that your testers can use the `npx figma-drift` command.

## 1. Prerequisites
- An account on [npmjs.com](https://www.npmjs.com/).
- Ensure the package name `figma-drift` is available (or choose a unique name in `packages/cli/package.json`).

## 2. One-Time Setup
Run this command in your terminal to log in to your npm account:
```bash
npm login
```

### 2.1 Handling 2FA (Important)
If you have Two-Factor Authentication (2FA) enabled on your npm account (which is now required for most packages), the `npm publish` command will:
1.  **Prompt for an OTP**: After you run the command, npm will ask for your one-time password from your authenticator app.
2.  **Web-based Login**: In modern npm versions, it might open a browser window to verify your identity.

**If you get a 403 Forbidden error:** 
Ensure your token is fresh by running `npm logout` and then `npm login` again.

## 3. The Release Process
Every time you want to release a new version:

### Step A: Build the project
From the root directory, ensure all packages are built:
```bash
npm run build
```

### Step B: Versioning
Decide on your next version number (e.g., `0.1.1`). Update the `version` field in:
1. `packages/backend/package.json`
2. `packages/cli/package.json`

### Step C: Publish the Core Engine
The core must be published first (or simultaneously) because the CLI depends on it.
```bash
cd packages/backend
npm publish --access public
```

### Step D: Publish the CLI
```bash
cd packages/cli
npm publish --access public
```

## 4. Verification
After publishing, anyone can run your tool without cloning the repo:
```bash
npx figma-drift check --figma "<URL>" --live "<URL>"
```

---
**Note**: Since we are using "Proprietary" licensing, the code is visible on npm (source-available), but the `LICENSE` file legally restricts what others can do with it.
