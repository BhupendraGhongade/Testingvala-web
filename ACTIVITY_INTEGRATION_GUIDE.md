# 🔌 Activity Tracking Integration Guide

## Step 1: Add Activity Dashboard to Existing Admin Panel

### Update WebsiteAdminPanel.jsx

Add the activity dashboard tab to your existing admin panel:

```javascript
// In admin-panel/src/components/WebsiteAdminPanel.jsx

import ActivityDashboard from './ActivityDashboard';

// Add to the tabs array (around line 100):
const tabs = [
  { id: 'contest', label: 'Contest', icon: Trophy },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity }, // ADD THIS
  { id: 'hero', label: 'Hero', icon: Users },
  // ... other tabs
];

// Add to the content area (around line 200):
{activeTab === 'activity' && (
  <ActivityDashboard />
)}
```

## Step 2: Add Activity Tracking to Existing Components

### 2.1 Resume Builder Integration

```javascript
// In src/components/ResumeBuilder.jsx
import { trackActivity } from '../services/activityTracker';

const ResumeBuilder = () => {
  const handleCreateResume = async (templateId) => {
    try {
      const resume = await createResume(templateData);
      
      // Add this line - non-blocking
      trackActivity.resumeCreated(resume.id, templateId);
      
      toast.success('Resume created!');
    } catch (error) {
      // Handle error normally
    }
  };

  const handleDownloadResume = async (resumeId, format) => {
    try {
      await downloadResume(resumeId, format);
      
      // Add this line
      trackActivity.resumeDownloaded(resumeId, format);
      
    } catch (error) {
      // Handle error
    }
  };
};
```

### 2.2 Community Integration

```javascript
// In src/components/CommunityHub.jsx
import { trackActivity } from '../services/activityTracker';

const CommunityHub = () => {
  const handleLikePost = async (postId) => {
    try {
      await toggleLike(postId);
      
      // Add this line
      trackActivity.postLiked(postId);
      
      setLiked(!liked);
    } catch (error) {
      // Handle error
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const post = await createPost(postData);
      
      // Add this line
      trackActivity.postCreated(post.id, postData.category);
      
      onPostCreated();
    } catch (error) {
      // Handle error
    }
  };
};
```

### 2.3 Boards Integration

```javascript
// In src/components/BoardsPage.jsx
import { trackActivity } from '../services/activityTracker';

const BoardsPage = () => {
  const handleCreateBoard = async (boardData) => {
    try {
      const board = await createBoard(boardData);
      
      // Add this line
      trackActivity.boardCreated(board.id, board.name);
      
      setBoards(prev => [board, ...prev]);
    } catch (error) {
      // Handle error
    }
  };

  const handlePinPost = async (boardId, postId) => {
    try {
      await pinPostToBoard(boardId, postId);
      
      // Add this line
      trackActivity.postPinned(boardId, postId);
      
      toast.success('Post pinned!');
    } catch (error) {
      // Handle error
    }
  };
};
```

### 2.4 Events Integration

```javascript
// In src/components/EventsPage.jsx
import { trackActivity } from '../services/activityTracker';

const EventsPage = () => {
  const handleEventClick = (event) => {
    // Add this line
    trackActivity.eventClicked(event.id, event.name);
    
    // Open event link
    window.open(event.registration_link, '_blank');
  };

  const handleEventRegistration = async (eventId) => {
    try {
      await registerForEvent(eventId);
      
      // Add this line
      trackActivity.eventRegistered(eventId);
      
      toast.success('Registered successfully!');
    } catch (error) {
      // Handle error
    }
  };
};
```

### 2.5 Authentication Integration

```javascript
// In src/services/authService.js
import { trackActivity } from './activityTracker';

class AuthService {
  async sendMagicLink(email) {
    try {
      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceId: this.getDeviceId() })
      });

      if (response.ok) {
        // Add this line
        trackActivity.magicLinkRequested(email, this.getDeviceId());
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token, email) {
    try {
      const result = await fetch(`/api/verify-token?token=${token}&email=${email}`);
      
      if (result.ok) {
        // Add this line
        trackActivity.userLoggedIn(email);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
```

## Step 3: Database Setup

### Run the SQL Script

Execute `admin-activity-extension.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire SQL script
4. Click "Run"

### Verify Tables Created

Check that these tables exist:
- `user_activity_logs`
- `magic_link_tracking`
- `daily_activity_summary`

## Step 4: Environment Setup

### No additional environment variables needed!

The activity tracker uses your existing Supabase configuration.

## Step 5: Testing

### Test Activity Logging

1. Perform actions on your site (create resume, like post, etc.)
2. Go to Admin Panel → Activity tab
3. Verify activities are being logged

### Test Dashboard

1. Check user stats are loading
2. Verify module activity summaries
3. Test filters and export functionality

## Step 6: Free Tier Optimization

### Automatic Optimizations Included:

- **Batched Logging**: Activities are batched to reduce API calls
- **Minimal Storage**: Only essential data is stored
- **Efficient Queries**: Optimized indexes and functions
- **Daily Summaries**: Aggregated data to reduce query load

### Monitor Usage:

1. Check Supabase dashboard for API usage
2. Monitor database size in Supabase
3. Adjust batch size if needed

## Step 7: Troubleshooting

### Common Issues:

**Activities not appearing:**
- Check browser console for errors
- Verify Supabase connection
- Ensure tables were created correctly

**Performance issues:**
- Reduce batch size in `activityTracker.js`
- Increase flush interval
- Check database indexes

**Admin panel not loading:**
- Verify admin email in RLS policies
- Check Supabase permissions
- Ensure functions were created

## Success Criteria:

✅ Activity dashboard tab appears in admin panel  
✅ User stats load correctly  
✅ Recent activities show in feed  
✅ Module summaries display  
✅ Filters work properly  
✅ Export functionality works  
✅ No impact on existing functionality  
✅ Free tier limits respected  

## Maintenance:

- Run daily summary updates via Supabase cron (optional)
- Monitor database size monthly
- Clean old activity logs if needed (>90 days)

Your existing admin panel now has comprehensive user activity tracking! 🚀