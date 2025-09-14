# TestingVala Admin Panel

A comprehensive admin panel for managing the TestingVala platform, including forum moderation, job management, user administration, and website content management.

## 🚀 Features

### Platform Management
- **User Management**: View and manage all platform users
- **Forum Moderation**: Approve/reject posts, manage categories, moderate discussions
- **Job Management**: Create, edit, and manage job postings and candidate applications
- **Analytics Dashboard**: Real-time insights and platform statistics
- **Audit Logs**: Track all admin actions and system events

### Website Content Management
- **Contest Management**: Configure monthly QA contests
- **Hero Section**: Update homepage content and statistics
- **Events Management**: Create and manage workshops, seminars, and events
- **Winners Showcase**: Manage previous contest winners
- **About & Contact**: Update company information and contact details

### Security & Authentication
- **Secure Admin Login**: Password-protected access with session management
- **Role-based Access**: Admin and moderator permissions
- **Audit Trail**: Complete logging of all administrative actions

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: Custom CSS with glassmorphism design

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project
- Admin credentials

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the admin-panel directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
cd admin-panel
npm install
```

### 3. Database Setup

Run the complete forum setup script in your Supabase SQL editor:

```bash
# Execute the SQL file in Supabase dashboard
cat setup-complete-forum.sql
```

This will create all necessary tables:
- `user_profiles` - User information and permissions
- `forum_categories` - Forum category management
- `forum_posts` - Community posts and discussions
- `forum_replies` - Post replies and comments
- `events` - Workshop and event management
- `job_postings` - Job listings
- `candidates` - Job applications
- `website_content` - Dynamic website content
- `audit_logs` - Admin action tracking

### 4. Admin User Setup

Create an admin user in your `user_profiles` table:

```sql
INSERT INTO user_profiles (
  id, 
  username, 
  full_name, 
  email, 
  is_admin, 
  is_verified
) VALUES (
  'your-user-id',
  'admin',
  'Admin User',
  'admin@testingvala.com',
  true,
  true
);
```

### 5. Start Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## 🔐 Admin Access

### Default Login
- **Password**: `Golu@2205` (change in `src/components/AdminLogin.jsx`)
- **Access URL**: `/login`

### Security Features
- Session-based authentication
- Automatic logout on inactivity
- Secure API endpoints with RLS policies
- Input validation and sanitization

## 📱 Admin Panel Sections

### 1. Platform Management
- **Overview**: Dashboard with key metrics and analytics
- **Users**: User management and role assignment
- **Jobs**: Job posting management and candidate tracking
- **Forum**: Community moderation and content management
- **Audit**: System logs and admin action tracking

### 2. Website Content Management
- **Contest**: Monthly contest configuration
- **Hero**: Homepage hero section management
- **Events**: Workshop and event management with image upload
- **Winners**: Previous contest winners showcase
- **About**: Company information and statistics
- **Contact**: Contact details and social media links

## 🎨 Key Components

### ForumModeration.jsx
- Complete forum management system
- Post approval/rejection workflow
- Category management (CRUD operations)
- User management and analytics
- Real-time content moderation

### JobManagement.jsx
- Job posting creation and management
- Candidate application tracking
- Status management and filtering
- Application analytics and reporting

### EventsManagement.jsx
- Event creation with image upload
- Workshop and seminar management
- Registration link management
- Event status and visibility controls

### WebsiteAdminPanel.jsx
- Dynamic website content management
- Real-time content updates
- Contest configuration
- Winners and statistics management

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the setup SQL script
3. Configure Row Level Security (RLS) policies
4. Set up storage bucket for images
5. Configure authentication settings

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Admin Configuration
Update admin credentials in `src/components/AdminLogin.jsx`:
```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

## 📊 Database Schema

### Core Tables
- **user_profiles**: User management with roles and permissions
- **forum_posts**: Community posts with moderation status
- **forum_categories**: Organized discussion categories
- **events**: Workshop and event management
- **job_postings**: Job listings with full details
- **candidates**: Job applications and candidate tracking
- **website_content**: Dynamic website content (JSON)
- **audit_logs**: Complete admin action logging

### Security Policies
- Row Level Security (RLS) enabled on all tables
- Admin-only access to sensitive operations
- User-specific data access controls
- Audit trail for all modifications

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with automatic builds

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🔒 Security Best Practices

### Authentication
- Strong password requirements
- Session timeout management
- Secure cookie handling
- CSRF protection

### Database Security
- Row Level Security (RLS) policies
- Prepared statements for SQL queries
- Input validation and sanitization
- Audit logging for all operations

### API Security
- Rate limiting on sensitive endpoints
- Input validation on all forms
- Secure file upload handling
- Error message sanitization

## 📈 Analytics & Monitoring

### Built-in Analytics
- User registration trends
- Forum activity metrics
- Job posting performance
- Event attendance tracking
- Content engagement statistics

### Audit Trail
- All admin actions logged
- User activity monitoring
- System event tracking
- Security incident logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper testing
4. Update documentation as needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- **Email**: admin@testingvala.com
- **Documentation**: Check inline code comments
- **Issues**: Create an issue on GitHub

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Bulk operations for content management
- [ ] Advanced user role management
- [ ] API documentation generator
- [ ] Mobile app admin interface
- [ ] Multi-language support
- [ ] Advanced reporting system

### Performance Improvements
- [ ] Caching layer implementation
- [ ] Database query optimization
- [ ] Image optimization and CDN
- [ ] Real-time updates with WebSockets

---

**Built with ❤️ for the TestingVala Community**

This admin panel provides comprehensive management capabilities for the entire TestingVala platform, ensuring smooth operations and excellent user experience.