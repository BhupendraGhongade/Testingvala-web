# Premium Management System

## Database Setup
Run the SQL commands in `admin-panel/database/premium_setup.sql` in your Supabase SQL editor.

## Storage Setup
No storage bucket required - screenshot upload functionality removed.

## Admin Features
- Configure UPI ID and pricing
- Approve/reject payment requests
- Manage subscriptions (grant/revoke/extend)
- Activity logging and tracking

## User Features
- View UPI payment details with QR code
- Submit payment requests with screenshots
- Real-time access status updates
- Secure premium feature access

## Integration
```jsx
import { usePremiumAccess } from './hooks/usePremiumAccess';
import PremiumGate from './components/PremiumGate';

// Check access
const { hasAccess } = usePremiumAccess(userEmail);

// Protect features
<PremiumGate userEmail={userEmail}>
  <AIResumeBuilder />
</PremiumGate>
```

## Security
- RLS policies prevent unauthorized access
- Manual approval prevents payment bypass
- Real-time subscription validation
- Manual verification via transaction ID only