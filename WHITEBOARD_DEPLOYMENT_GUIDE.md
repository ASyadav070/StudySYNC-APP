# Whiteboard Production Deployment Guide

## Issues Fixed
✅ Added reconnection logic for Socket.io
✅ Added connection status indicator  
✅ Improved error handling and validation
✅ Updated CORS configuration for production
✅ Added polling transport fallback
✅ Added visual connection feedback

## Environment Variables

### Client (Vercel)
Create environment variables in Vercel dashboard:

```
VITE_API_URL=https://your-railway-backend.up.railway.app
```

### Server (Railway)
Add these environment variables in Railway dashboard:

```
CLIENT_URL=https://your-vercel-app.vercel.app
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

## Deployment Steps

### 1. Update Client Environment
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add `VITE_API_URL` with your Railway backend URL
3. Redeploy the frontend

### 2. Update Server Environment  
1. Go to Railway dashboard → Your Project → Variables
2. Add `CLIENT_URL` with your Vercel app URL
3. Railway will automatically redeploy

### 3. Clear Browser Cache
After deployment:
1. Open Developer Console (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Application tab → Clear storage → Clear site data

### 4. Test Connection
1. Open browser console (F12)
2. Navigate to a group chat
3. Click "Whiteboard" tab
4. Look for these console messages:
   - ✅ Connected to whiteboard room: whiteboard-group-[id]
   - Whiteboard user count: [number]

### 5. Verify Features
- [ ] Whiteboard loads without errors
- [ ] Connection status shows "online"
- [ ] Drawing synchronizes between users
- [ ] User count updates correctly
- [ ] Analyze button works
- [ ] No red errors in console

## Troubleshooting

### Whiteboard keeps refreshing
**Cause**: Socket.io connection failing
**Fix**: 
1. Verify `VITE_API_URL` in Vercel matches Railway URL
2. Verify `CLIENT_URL` in Railway matches Vercel URL
3. Check Railway logs for CORS errors

### "Lost connection" error
**Cause**: Backend not responding or CORS blocking
**Fix**:
1. Check Railway deployment status
2. Verify environment variables are set
3. Check Railway logs: `railway logs`

### Drawings not syncing
**Cause**: Socket.io room issues or connection errors
**Fix**:
1. Check console for "Emitting drawing change" messages
2. Verify both users see same user count
3. Test in incognito window to rule out cache issues

### Connection status stuck on "Connecting..."
**Cause**: Backend unreachable or wrong URL
**Fix**:
1. Open Network tab in DevTools
2. Look for WebSocket connection attempts
3. Verify the URL matches your Railway backend

## Testing Checklist

Before marking as resolved:

- [ ] Draw something → other user sees it immediately
- [ ] Both users show same online count
- [ ] Page refresh preserves drawings (localStorage)
- [ ] Analyze button extracts text from whiteboard
- [ ] No console errors after 5 minutes of use
- [ ] Works in Chrome, Firefox, and Edge
- [ ] Works on mobile browsers

## Important Notes

1. **Persistence**: Drawings are stored in browser localStorage (per-domain)
   - Moving from localhost → production will lose drawings
   - Each browser/device maintains its own cache

2. **Real-time Sync**: Only works when both users are online simultaneously
   - Offline drawings won't sync to other users
   - Use the drawing-update event for live collaboration

3. **Rate Limits**: 
   - Socket.io reconnects automatically up to 5 times
   - Gemini AI vision analysis: ~20 requests/day
   - Text analysis (summaries): ~1,500 requests/day

## Monitoring

Check these regularly:
- Railway logs: `railway logs --tail`  
- Browser console for client errors
- Socket.io connection count in logs
- "User joined/left whiteboard room" messages
