# 🕐 Clock Skew Error Fix

## Problem
You're seeing this error:
```
@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew
```

This happens when your device's clock is out of sync with the server time.

## ✅ Quick Fix

### Windows:
1. Right-click the clock in the taskbar
2. Select **"Adjust date/time"**
3. Turn **ON** "Set time automatically"
4. Click **"Sync now"**
5. Refresh your browser

### Mac:
1. Open **System Settings** → **General** → **Date & Time**
2. Turn **ON** "Set time zone automatically using your location"
3. Turn **ON** "Set time automatically"
4. Refresh your browser

### Browser Fix (Temporary):
If you can't sync your system clock:
1. Clear browser cache and cookies for your app
2. Sign out and sign back in
3. This will issue a new session token with current time

## 🔍 Why This Happens

Supabase validates session tokens by checking their timestamp. If your device clock is:
- **Behind** server time → Token appears to be issued in the "future"
- **Ahead** server time → Token appears expired

Both cause authentication to fail.

## 🛠️ Code Fixes Applied

The app now:
1. ✅ Detects clock skew errors
2. ✅ Clears invalid sessions automatically
3. ✅ Shows helpful error messages
4. ✅ Allows you to sign out and sign back in

## 📝 Technical Details

The error shows timestamps:
- `1764117434` - Current device time
- `1764121034` - Token issued time (appears in future)
- Difference: ~1 hour

This means your device clock is approximately **1 hour behind** server time.

## 🚀 Prevention

To prevent this in the future:
- ✅ Keep "Set time automatically" enabled
- ✅ Sync your clock regularly
- ✅ Check time sync if you travel across timezones
- ✅ Restart your computer if time seems wrong

## ⚠️ If Issue Persists

If syncing your clock doesn't help:
1. Check your timezone settings
2. Restart your computer
3. Clear browser storage: `localStorage.clear()` in console
4. Sign out and sign back in




