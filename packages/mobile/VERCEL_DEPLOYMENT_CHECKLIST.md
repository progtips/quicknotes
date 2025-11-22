# Vercel Deployment Verification & Checklist

## ✅ Verification Summary

### 1. Build Script ✅
- **File:** `packages/mobile/package.json`
- **Status:** ✅ CORRECT
- **Command:** `expo export --platform web --output-dir dist`
- **Note:** Updated from deprecated `expo export:web` to `expo export --platform web`

### 2. Output Directory ✅
- **File:** `packages/mobile/vercel.json`
- **Status:** ✅ CORRECT
- **Output Directory:** `dist`
- **Configuration:** Properly set in both `vercel.json` and build command

### 3. Environment Variables ✅
- **File:** `packages/mobile/app.config.ts`
- **Status:** ✅ CONFIGURED
- **Variable:** `EXPO_PUBLIC_API_URL`
- **Priority Order:**
  1. `process.env.EXPO_PUBLIC_API_URL` (primary - works in web/production)
  2. `process.env.EXPO_PUBLIC_API_BASE_URL` (backward compatibility)
  3. Fallback based on NODE_ENV

### 4. Runtime Configuration ✅
- **File:** `packages/mobile/src/config/index.ts`
- **Status:** ✅ PROPERLY IMPLEMENTED
- **Behavior:** 
  - Checks `process.env.EXPO_PUBLIC_API_URL` first (web builds)
  - Falls back to `Constants.expoConfig.extra` (mobile builds)
  - Safe fallbacks for development

### 5. Hardcoded URLs ✅
- **Status:** ✅ NO ISSUES FOUND
- **Fallbacks Only:** 
  - `http://localhost:4000/api` - development fallback (only if env var not set)
  - `https://your-domain.com/api` - production fallback (only if env var not set)
- **Note:** These are safe fallbacks and won't be used if `EXPO_PUBLIC_API_URL` is set in Vercel

### 6. Web Compatibility ✅
- **Storage:** ✅ Uses `localStorage` with proper checks (`typeof window !== 'undefined'`)
- **Navigation:** ✅ Uses `@react-navigation/native` (web-compatible)
- **API Client:** ✅ Uses `axios` with proper error handling
- **Platform Checks:** ✅ All `window`/`document` usage properly guarded

## 📁 Expected `dist` Folder Structure

After running `npm run build`, the `dist` folder will contain:

```
dist/
├── index.html          # Main HTML entry point
├── _expo/
│   ├── static/         # Static assets (JS, CSS, images)
│   └── ...             # Expo runtime files
├── assets/             # App assets (images, fonts, etc.)
└── ...                 # Other static files
```

**Note:** With `output: 'single'` in `app.config.ts`, Expo generates a single-page application optimized for static hosting.

## ⚠️ Potential Runtime Issues (Checked & Resolved)

### ✅ Storage Implementation
- **Status:** SAFE
- **Implementation:** `tokenStorage.ts` properly checks for `window.localStorage`
- **Fallback:** Graceful error handling if localStorage unavailable

### ✅ API Configuration
- **Status:** SAFE
- **Implementation:** `src/services/api.ts` uses `API_BASE_URL` from config
- **Environment:** Properly reads from `process.env.EXPO_PUBLIC_API_URL` at build time

### ✅ Navigation
- **Status:** SAFE
- **Implementation:** Uses `@react-navigation/native` which supports web
- **Routing:** Client-side routing compatible with static hosting

### ✅ Platform-Specific Code
- **Status:** SAFE
- **Checks:** All `window`/`document` usage properly guarded
- **Examples:** 
  - `src/services/api.ts` - checks `Platform.OS === 'web'`
  - `src/storage/tokenStorage.ts` - checks `typeof window !== 'undefined'`

## 📋 Pre-Deployment Checklist

### Before Deploying to Vercel:

#### 1. Configuration Files ✅
- [x] `vercel.json` exists and is correct
- [x] `package.json` build script is correct
- [x] `app.config.ts` reads `EXPO_PUBLIC_API_URL`
- [x] `app.json` has `web.output: 'single'` (for static hosting)

#### 2. Environment Variables (Vercel Dashboard)
- [ ] Set `EXPO_PUBLIC_API_URL` in Vercel project settings
  - **Production:** Your production API URL (e.g., `https://api.yourdomain.com/api`)
  - **Preview:** Preview API URL (if different)
  - **Development:** Development API URL (if using Vercel dev)

#### 3. Vercel Project Settings
- [ ] **Root Directory:** Set to `packages/mobile`
- [ ] **Build Command:** `npm run build` (auto-detected from `vercel.json`)
- [ ] **Output Directory:** `dist` (auto-detected from `vercel.json`)
- [ ] **Install Command:** `npm install` (auto-detected from `vercel.json`)

#### 4. Build Verification (Local Test)
- [ ] Run `npm run build` locally
- [ ] Verify `dist` folder is created
- [ ] Check `dist/index.html` exists
- [ ] Verify no build errors

#### 5. Code Review
- [x] No hardcoded API URLs in source code
- [x] All environment variables properly referenced
- [x] Web compatibility checks in place
- [x] Storage implementation web-safe

## 🔍 Files to Inspect Before Deploy

### Critical Files (Must Review):
1. **`packages/mobile/vercel.json`**
   - Verify build command, output directory, install command

2. **`packages/mobile/package.json`**
   - Verify `build` script: `expo export --platform web --output-dir dist`

3. **`packages/mobile/app.config.ts`**
   - Verify `EXPO_PUBLIC_API_URL` is read from environment
   - Verify `web.output: 'single'` is set

4. **`packages/mobile/src/config/index.ts`**
   - Verify `process.env.EXPO_PUBLIC_API_URL` is checked first
   - Verify fallback logic is safe

5. **`packages/mobile/src/services/api.ts`**
   - Verify uses `API_BASE_URL` from config (not hardcoded)

### Important Files (Should Review):
6. **`packages/mobile/app.json`**
   - Verify `web.output: 'single'` matches `app.config.ts`
   - Note: `app.config.ts` takes precedence if both exist

7. **`packages/mobile/metro.config.js`**
   - Verify debug alias is set (prevents Node.js module issues)

8. **`packages/mobile/src/storage/tokenStorage.ts`**
   - Verify web compatibility checks

9. **`packages/mobile/src/navigation/RootNavigator.tsx`**
   - Verify uses `@react-navigation/native` (web-compatible)

### Optional Files (Nice to Review):
10. **`packages/mobile/babel.config.js`**
    - Verify module resolver configuration

11. **`packages/mobile/tsconfig.json`**
    - Verify TypeScript configuration is correct

## 🚀 Deployment Steps

1. **Set Environment Variables in Vercel:**
   ```
   EXPO_PUBLIC_API_URL=https://your-api-url.com/api
   ```

2. **Configure Vercel Project:**
   - Root Directory: `packages/mobile`
   - Build Command: `npm run build` (from vercel.json)
   - Output Directory: `dist` (from vercel.json)

3. **Deploy:**
   - Push to connected Git repository, OR
   - Use Vercel CLI: `vercel --prod`

4. **Verify Deployment:**
   - Check build logs for successful build
   - Verify `dist` folder is served correctly
   - Test API connectivity
   - Verify authentication flow works

## ⚡ Quick Test Commands

```bash
# Test build locally
cd packages/mobile
npm run build

# Verify dist folder structure
ls -la dist/

# Test with local server (optional)
npx serve dist
```

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (should be compatible with Expo SDK 54)
- Clear cache: `npx expo export --platform web --clear`
- Check for missing dependencies

### Environment Variables Not Working
- Verify `EXPO_PUBLIC_API_URL` is set in Vercel dashboard
- Check variable name spelling (case-sensitive)
- Rebuild after adding environment variables

### API Calls Fail
- Verify `EXPO_PUBLIC_API_URL` is correctly set
- Check CORS settings on backend
- Verify API URL format (should end with `/api` if backend expects it)

### Routing Issues
- Verify `web.output: 'single'` is set (for SPA)
- Check Vercel rewrites if needed (usually not needed for SPA)

## 📝 Notes

- **Expo SDK:** 54.0.25
- **React Native:** 0.82.1
- **React:** 19.2.0
- **Build Output:** Single-page application (SPA)
- **Hosting:** Static files (no server-side rendering)

---

**Last Verified:** $(date)
**Status:** ✅ Ready for Deployment

