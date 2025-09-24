# Profile Management Setup Guide

This guide will help you set up the complete profile management system for your React web app with Supabase.

## 1. Database Setup

Run the following SQL scripts in your Supabase SQL editor in this order:

1. `scripts/004_create_profiles_table.sql` - Creates the profiles table with RLS policies
2. `scripts/005_create_resumes_storage.sql` - Creates the resumes storage bucket with policies

## 2. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Dependencies

Make sure you have the required dependencies installed:

```bash
npm install @supabase/supabase-js
```

## 4. File Structure

The following files have been created:

- `lib/supabase/supabaseClient.js` - Supabase client configuration
- `lib/profileHelpers.js` - Helper functions for profile operations
- `components/ProfileForm.jsx` - Complete React component for profile management
- `scripts/004_create_profiles_table.sql` - Database schema
- `scripts/005_create_resumes_storage.sql` - Storage bucket setup

## 5. Usage

Import and use the ProfileForm component in your app:

```jsx
import ProfileForm from './components/ProfileForm'

function App() {
  return (
    <div className="App">
      <ProfileForm />
    </div>
  )
}
```

## 6. Features

### Profile Management
- ✅ Create and update user profiles
- ✅ Resume upload (PDF, DOC, DOCX) with file validation
- ✅ Skills and interests as arrays
- ✅ Experience level selection
- ✅ Bio and location fields
- ✅ Social media links (GitHub, LinkedIn, Portfolio)

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own profiles
- ✅ Secure file upload with user-specific paths
- ✅ File type and size validation

### User Experience
- ✅ Loading states during operations
- ✅ Success/error notifications
- ✅ Form pre-filling with existing data
- ✅ Resume preview with download link
- ✅ Responsive design

## 7. API Functions

### `uploadResume(file, userId)`
Uploads a resume file to Supabase Storage with validation.

### `saveProfile(profileData)`
Saves or updates a user's profile data.

### `loadProfile(userId)`
Loads a user's existing profile data.

### `getCurrentUserWithProfile()`
Gets the current authenticated user and their profile.

## 8. Error Handling

All functions include comprehensive error handling for:
- Authentication errors
- File upload failures
- Database operation errors
- Network connectivity issues

## 9. File Validation

Resume uploads are validated for:
- File type (PDF, DOC, DOCX only)
- File size (max 10MB)
- User authentication

## 10. Security Features

- Row Level Security policies ensure users can only access their own data
- File uploads are stored in user-specific folders
- All database operations require authentication
- Input validation and sanitization
