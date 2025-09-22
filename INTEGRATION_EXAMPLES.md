# 🔌 Activity Logging Integration Examples

## 1. Resume Builder Integration

```javascript
// In your ResumeBuilder component
import { logActivity } from '../services/activityLogger';

const ResumeBuilder = () => {
  const handleCreateResume = async (templateId) => {
    try {
      const resume = await createResume(templateData);
      
      // Log activity (non-blocking)
      logActivity.resumeCreated(resume.id, templateId);
      
      toast.success('Resume created!');
    } catch (error) {
      // Handle error normally
    }
  };

  const handleDownloadResume = async (resumeId, format) => {
    try {
      await downloadResume(resumeId, format);
      
      // Log download
      logActivity.resumeDownloaded(resumeId, format);
      
    } catch (error) {
      // Handle error
    }
  };
};
```

## 2. Community Integration

```javascript
// In your CommunityHub component
import { logActivity } from '../services/activityLogger';

const CommunityHub = () => {
  const handleLikePost = async (postId) => {
    try {
      await toggleLike(postId);
      
      // Log like action
      logActivity.postLiked(postId);
      
      setLiked(!liked);
    } catch (error) {
      // Handle error
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const post = await createPost(postData);
      
      // Log post creation
      logActivity.postCreated(post.id, postData.category);
      
      onPostCreated();
    } catch (error) {
      // Handle error
    }
  };
};
```

## 3. Boards Integration

```javascript
// In your BoardsPage component
import { logActivity } from '../services/activityLogger';

const BoardsPage = () => {
  const handleCreateBoard = async (boardData) => {
    try {
      const board = await createBoard(boardData);
      
      // Log board creation
      logActivity.boardCreated(board.id, board.name);
      
      setBoards(prev => [board, ...prev]);
    } catch (error) {
      // Handle error
    }
  };

  const handlePinPost = async (boardId, postId) => {
    try {
      await pinPostToBoard(boardId, postId);
      
      // Log pin action
      logActivity.postPinned(boardId, postId);
      
      toast.success('Post pinned!');
    } catch (error) {
      // Handle error
    }
  };
};
```

## 4. Events Integration

```javascript
// In your EventsPage component
import { logActivity } from '../services/activityLogger';

const EventsPage = () => {
  const handleEventClick = (event) => {
    // Log event click
    logActivity.eventClicked(event.id, event.name);
    
    // Open event link
    window.open(event.registration_link, '_blank');
  };

  const handleEventRegistration = async (eventId) => {
    try {
      await registerForEvent(eventId);
      
      // Log registration
      logActivity.eventRegistered(eventId);
      
      toast.success('Registered successfully!');
    } catch (error) {
      // Handle error
    }
  };
};
```

## 5. Authentication Integration

```javascript
// In your AuthModal component
import { logActivity } from '../services/activityLogger';

const AuthModal = () => {
  const handleSendMagicLink = async (email) => {
    try {
      const result = await authService.sendMagicLink(email);
      
      // Log magic link request
      logActivity.magicLinkRequested(email, authService.getDeviceId());
      
      setStep('verify');
    } catch (error) {
      // Handle error
    }
  };
};

// In your AuthContext
const AuthContext = () => {
  const handleLogin = (user) => {
    // Log successful login
    logActivity.userLoggedIn(user.email);
    
    setUser(user);
  };

  const handleLogout = () => {
    // Log logout
    logActivity.userLoggedOut();
    
    setUser(null);
  };
};
```

## 6. Magic Link Integration

```javascript
// Update your existing authService.js
import { logActivity } from './activityLogger';

class AuthService {
  async sendMagicLink(email) {
    try {
      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceId: this.getDeviceId() })
      });

      if (response.ok) {
        // Log magic link request
        logActivity.magicLinkRequested(email, this.getDeviceId());
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
        // Log successful login
        logActivity.userLoggedIn(email);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
```

## 7. Non-Intrusive Implementation Pattern

```javascript
// Wrapper function for safe logging
const safeLog = (logFunction) => {
  try {
    logFunction();
  } catch (error) {
    // Never let logging break the main functionality
    console.warn('Activity logging failed:', error);
  }
};

// Usage in components
const handleUserAction = async () => {
  try {
    // Main functionality
    const result = await performMainAction();
    
    // Safe logging (won't break if it fails)
    safeLog(() => logActivity.someAction(result.id));
    
    return result;
  } catch (error) {
    // Handle main functionality error
    throw error;
  }
};
```

## 8. Batch Optimization Example

```javascript
// The activityLogger automatically batches, but you can also manually batch:
import { activityLogger } from '../services/activityLogger';

const handleBulkActions = async (items) => {
  // Disable auto-flush temporarily for bulk operations
  activityLogger.disable();
  
  try {
    for (const item of items) {
      await processItem(item);
      // This will queue but not immediately send
      logActivity.itemProcessed(item.id);
    }
  } finally {
    // Re-enable and flush all queued items at once
    activityLogger.enable();
    await activityLogger.flush();
  }
};
```

## Key Integration Principles:

1. **Non-Blocking**: Logging never blocks main functionality
2. **Error-Safe**: Logging failures don't affect user experience  
3. **Batched**: Multiple actions are sent together to save API calls
4. **Contextual**: Each log includes relevant metadata
5. **Efficient**: Minimal performance impact on existing features

## Testing Integration:

```javascript
// Disable logging during tests
if (process.env.NODE_ENV === 'test') {
  activityLogger.disable();
}

// Or mock the logger
jest.mock('../services/activityLogger', () => ({
  logActivity: {
    resumeCreated: jest.fn(),
    postLiked: jest.fn(),
    // ... other methods
  }
}));
```