# Supabase Integration - Manual Setup Required

## Step 1: Install Supabase Package

Run this command in your terminal (you may need to enable PowerShell scripts first):

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Environment File

Create a file called `.env.local` in the root of your project (`d:/antigravity/gamehub/`) with this content:

```
NEXT_PUBLIC_SUPABASE_URL=https://fcxkxzrgzbsflzfmsqwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeGt4enJnemJzZmx6Zm1zcXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzE2OTcsImV4cCI6MjA4MjQwNzY5N30.oR5CULUQzhwikFWW7PoKK3kcp0TRkw8F01Dae7W6uHw
```

## Step 3: Restart Dev Server

After installing the package and creating the `.env.local` file, restart your dev server:

```bash
npm run dev
```

## What's Changed

✅ **Real Database Authentication**: Users are now stored in Supabase
✅ **Email Verification**: New users must verify their email before logging in
✅ **Secure Passwords**: Passwords are hashed and never stored in plain text
✅ **Session Management**: Persistent login across browser sessions
✅ **Username Support**: Users can set a custom username

## How It Works

1. **Sign Up**: User enters email, password, and username
2. **Email Sent**: Supabase sends verification email automatically
3. **User Clicks Link**: Email contains verification link
4. **Account Activated**: User can now log in
5. **Persistent Session**: User stays logged in across visits

## Testing

1. Go to `/signup`
2. Create an account with a real email
3. Check your email for verification link
4. Click the link
5. Log in at `/login`

---

**Note**: The old localStorage authentication has been completely replaced!
