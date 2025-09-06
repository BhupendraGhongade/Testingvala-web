# Upcoming Events System Setup Guide

This guide will help you set up the new Upcoming Events system for your TestingVala website with full Supabase integration.

## 🚀 Quick Overview

The new system replaces the "Learn More" button with a dynamic "Upcoming Events" section that:
- Displays the latest 5 upcoming events
- Shows event details: title, date, time, description, registration link
- Supports optional event images
- Is fully managed through the admin panel
- Integrates seamlessly with your new Orange (#FF6600) and Blue (#0057B7) theme

## 📋 What's Been Added

### 1. **New Components**
- `UpcomingEvents.jsx` - Main events display component
- `EventsManagement.jsx` - Admin panel for managing events
- Updated `AdminPanel.jsx` with Events tab

### 2. **Database Integration**
- New `upcoming_events` table in Supabase
- Helper functions for CRUD operations
- Automatic date filtering (only future events)

### 3. **Updated Pages**
- Hero section now has "View Upcoming Events" button
- Events section appears after Hero
- Smooth scrolling navigation

## 🗄️ Database Setup

### Step 1: Run the SQL Script
Execute the `setup-events-table.sql` file in your Supabase SQL editor:

```sql
-- This creates the table with proper structure and sample data
-- Run this in your Supabase SQL Editor
```

### Step 2: Verify Table Creation
Check that the `upcoming_events` table was created with:
- `id` (UUID, Primary Key)
- `title` (VARCHAR, Required)
- `description` (TEXT)
- `event_date` (DATE, Required)
- `event_time` (TIME, Required)
- `registration_link` (VARCHAR)
- `image_url` (VARCHAR)
- `is_active` (BOOLEAN, Default: true)
- `created_at` and `updated_at` timestamps

## 🎨 Theme Integration

The events system uses your new color scheme:
- **Primary**: Orange (#FF6600) - Buttons, highlights, hover states
- **Secondary**: Blue (#0057B7) - Links, borders, secondary elements
- **Background**: White (#FFFFFF) - Clean, professional look
- **Text**: Dark grays for excellent readability

## 🔧 Admin Panel Features

### Events Management Tab
- **View All Events**: Table with event details and status
- **Add New Event**: Form with all event fields
- **Edit Events**: Click edit icon to modify existing events
- **Delete Events**: Remove events with confirmation
- **Toggle Status**: Activate/deactivate events

### Event Fields
1. **Title** (Required) - Event name
2. **Description** - Event details
3. **Date & Time** (Required) - When the event occurs
4. **Registration Link** - Google Forms or other registration URL
5. **Image URL** - Optional event banner image
6. **Active Status** - Show/hide from public view

## 📱 Responsive Design

The events section is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: Two-column grid
- **Desktop**: Three-column grid
- **Hover Effects**: Smooth animations and transitions

## 🖼️ Image Support

### How It Works
- Events can have optional banner images
- Images are stored as URLs (not uploaded to Supabase)
- Supports any image hosting service
- Automatic image scaling and hover effects

### Image Recommendations
- **Size**: 600x400px or similar aspect ratio
- **Format**: JPG, PNG, or WebP
- **Hosting**: Use services like:
  - Imgur
  - Cloudinary
  - AWS S3
  - Your own server

## 🔄 Data Flow

1. **Admin creates/edits events** → Supabase database
2. **Website fetches events** → Only active, future events
3. **Events display** → Responsive grid layout
4. **Users click registration** → External link opens

## 🚨 Important Notes

### Security
- Only authenticated admins can manage events
- Public users can only view active events
- Row Level Security (RLS) is enabled

### Performance
- Events are limited to 5 most recent
- Automatic date filtering (past events hidden)
- Efficient database queries with indexes

### Maintenance
- Events automatically hide when past due date
- Admin can manually deactivate events
- Regular cleanup of old events recommended

## 🎯 Usage Examples

### Creating a Workshop Event
1. Go to Admin Panel → Events tab
2. Click "Add Event"
3. Fill in:
   - Title: "QA Automation Workshop"
   - Description: "Learn Selenium and Appium"
   - Date: 2025-02-15
   - Time: 14:00
   - Registration: Google Forms link
   - Image: Workshop banner URL
4. Save and publish

### Managing Event Status
- **Active**: Visible to public
- **Inactive**: Hidden from public view
- Use this for events that are full or cancelled

## 🔧 Troubleshooting

### Common Issues

**Events not showing:**
- Check if events are marked as active
- Verify event dates are in the future
- Check browser console for errors

**Admin panel not working:**
- Ensure you're logged in as owner
- Check Supabase connection
- Verify table permissions

**Images not loading:**
- Check image URL is accessible
- Verify image format is supported
- Test URL in browser

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection
3. Test database queries directly
4. Check network tab for failed requests

## 🚀 Next Steps

### Immediate Actions
1. Run the SQL setup script
2. Test the admin panel
3. Create a few sample events
4. Verify public display

### Future Enhancements
- Event categories/tags
- Recurring events
- Event reminders
- Attendee management
- Event analytics

## 🎉 You're All Set!

Your TestingVala website now has a professional, dynamic events system that:
- ✅ Integrates seamlessly with your new theme
- ✅ Provides easy admin management
- ✅ Offers excellent user experience
- ✅ Scales with your needs
- ✅ Maintains security best practices

The system will automatically handle event lifecycle management and provide your users with up-to-date information about upcoming QA workshops, seminars, and events!
