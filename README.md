# TestingVala - QA Contest Platform

A modern, full-stack website for QA professionals to participate in monthly contests, share testing expertise, and build a global community.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Real-time Data**: Cloud-based backend with Supabase
- **Admin Panel**: Full control over website content for owners
- **Contest Management**: Dynamic contest creation and management
- **User Registration**: Support for 5000+ users
- **Social Integration**: Social media links and sharing
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd testingvala-website
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase Backend

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Website content table
CREATE TABLE website_content (
  id BIGINT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contest submissions table
CREATE TABLE contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  contest_title TEXT NOT NULL,
  submission_text TEXT NOT NULL,
  submission_file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Insert initial website content
INSERT INTO website_content (id, content) VALUES (1, '{
  "contest": {
    "title": "January 2025 QA Contest",
    "theme": "Testing Hacks & Smart Techniques",
    "prizes": "1st Place: $500 | 2nd Place: $300 | 3rd Place: $200",
    "submission": "Share your QA trick with detailed explanation and impact",
    "deadline": "2025-01-31",
    "status": "Active Now"
  },
  "hero": {
    "headline": "Win Big with Your Testing Expertise",
    "subtitle": "Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.",
    "badge": "🚀Test Your QA Skills. Win Rewards. Build Your Career.",
    "stats": {
      "participants": "500+",
      "prizes": "$2,000+",
      "support": "24/7"
    }
  },
  "winners": [
    {
      "name": "Sarah Chen",
      "title": "December 2024 Winner",
      "trick": "AI-Powered Test Case Generation",
      "avatar": "👑"
    },
    {
      "name": "Mike Rodriguez",
      "title": "November 2024 Winner",
      "trick": "Cross-Browser Testing Automation",
      "avatar": "🥈"
    },
    {
      "name": "Emma Thompson",
      "title": "October 2024 Winner",
      "trick": "Performance Testing Optimization",
      "avatar": "🥉"
    }
  ],
  "about": {
    "description": "TestingVala.com is your go-to platform for daily QA tricks, hacks, and interview preparation tips.",
    "features": [
      "Daily QA tips and best practices",
      "Interview preparation resources",
      "Process improvement techniques",
      "Monthly QA contests with prizes"
    ],
    "stats": {
      "members": "10,000+",
      "tips": "500+",
      "contests": "12+",
      "countries": "50+"
    }
  },
  "contact": {
    "email": "info@testingvala.com",
    "website": "www.testingvala.com",
    "location": "Global QA Community",
    "socialMedia": {
      "instagram": "https://www.instagram.com/testingvala",
      "youtube": "https://www.youtube.com/@TestingvalaOfficial",
      "twitter": "https://twitter.com/testingvala",
      "linkedin": "https://www.linkedin.com/company/testingvala"
    }
  }
}');
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view the website.

## 🔧 Admin Panel Access

- **Password**: `Golu@2205` (change this in `src/components/AdminPanel.jsx`)
- **Access**: Click the settings icon in the bottom-right corner
- **Features**: Edit contest details, hero section, winners, about, and contact info

## 📱 Features Overview

### For Users
- View current contest details
- Submit contest entries via Google Forms
- Browse previous winners
- Contact support
- Follow social media channels

### For Admins
- Full website content management
- Real-time updates
- Contest configuration
- Winner management
- Contact information updates

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## 🔒 Security Features

- Admin authentication with session management
- Secure API endpoints with Supabase RLS
- Environment variable protection
- Input validation and sanitization

## 📊 Database Schema

The application uses 4 main tables:

1. **website_content**: Stores all website content (JSON)
2. **users**: User registrations and profiles
3. **contest_submissions**: Contest entries
4. **admin_sessions**: Admin authentication sessions

## 🎨 Customization

### Colors & Branding
- Update colors in `tailwind.config.js`
- Modify logo in `src/components/Logo.jsx`
- Change gradients and themes throughout components

### Content Management
- All content is managed through the admin panel
- No code changes needed for content updates
- Real-time updates across all users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Email**: info@testingvala.com
- **Documentation**: Check the code comments
- **Issues**: Create an issue on GitHub

## 🎯 Roadmap

- [ ] User authentication system
- [ ] Contest voting mechanism
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API documentation
- [ ] Multi-language support

---

**Built with ❤️ for the QA Community**
