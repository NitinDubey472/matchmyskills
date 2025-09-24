import React, { useState, useEffect } from 'react'
import { getCurrentUserWithProfile, saveProfile, uploadResume } from '../lib/profileHelpers'
import { supabase } from '../lib/supabase/supabaseClient'

const ProfileForm = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [existingResumeUrl, setExistingResumeUrl] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    skills: '',
    interests: '',
    experience_level: '',
    preferred_location: '',
    bio: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: ''
  })

  const experienceLevels = [
    { value: 'intern', label: 'Intern' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' }
  ]

  // Load user and profile data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const result = await getCurrentUserWithProfile()
      
      if (!result.success) {
        setError(result.error)
        return
      }

      setUser(result.user)
      
      if (result.profile) {
        setProfile(result.profile)
        setExistingResumeUrl(result.profile.resume_url || '')
        
        // Pre-fill form with existing profile data
        setFormData({
          skills: result.profile.skills ? result.profile.skills.join(', ') : '',
          interests: result.profile.interests ? result.profile.interests.join(', ') : '',
          experience_level: result.profile.experience_level || '',
          preferred_location: result.profile.preferred_location || '',
          bio: result.profile.bio || '',
          github_url: result.profile.github_url || '',
          linkedin_url: result.profile.linkedin_url || '',
          portfolio_url: result.profile.portfolio_url || ''
        })
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setResumeFile(file)
      setExistingResumeUrl('') // Clear existing resume URL when new file is selected
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      let resumeUrl = existingResumeUrl

      // Upload resume if a new file is selected
      if (resumeFile) {
        const uploadResult = await uploadResume(resumeFile, user.id)
        
        if (!uploadResult.success) {
          setError(uploadResult.error)
          return
        }
        
        resumeUrl = uploadResult.url
      }

      // Convert comma-separated strings to arrays
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      const interestsArray = formData.interests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0)

      // Prepare profile data
      const profileData = {
        resume_url: resumeUrl,
        skills: skillsArray,
        interests: interestsArray,
        experience_level: formData.experience_level,
        preferred_location: formData.preferred_location,
        bio: formData.bio,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url
      }

      // Save profile
      const saveResult = await saveProfile(profileData)
      
      if (!saveResult.success) {
        setError(saveResult.error)
        return
      }

      setProfile(saveResult.data)
      setSuccess('Profile saved successfully!')
      setResumeFile(null)
      
      // Clear file input
      const fileInput = document.getElementById('resume-upload')
      if (fileInput) fileInput.value = ''

    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Authentication Required
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Please sign in to access your profile.
        </p>
        <div className="text-center">
          <a
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Upload
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, or DOCX files only. Max size: 10MB
            </p>
            {existingResumeUrl && !resumeFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current resume:</p>
                <a
                  href={existingResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View Current Resume
                </a>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="React, JavaScript, Python, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple skills with commas
            </p>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              placeholder="Machine Learning, Web Development, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple interests with commas
            </p>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select experience level</option>
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Location
            </label>
            <input
              type="text"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleInputChange}
              placeholder="San Francisco, CA or Remote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              name="github_url"
              value={formData.github_url}
              onChange={handleInputChange}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio URL
            </label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm
