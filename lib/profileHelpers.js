import { supabase } from './supabase/supabaseClient'

/**
 * Upload a resume file to Supabase Storage
 * @param {File} file - The resume file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadResume = async (file, userId) => {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.'
      }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload a file smaller than 10MB.'
      }
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${timestamp}.${fileExtension}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: `Upload failed: ${error.message}`
    }
  }
}

/**
 * Save or update a user's profile
 * @param {Object} profileData - The profile data to save
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const saveProfile = async (profileData) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    // Prepare data for upsert
    const profileToSave = {
      user_id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    }

    // Upsert profile data
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileToSave, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.error('Save profile error:', error)
      return {
        success: false,
        error: `Failed to save profile: ${error.message}`
      }
    }

    return {
      success: true,
      data: data[0]
    }
  } catch (error) {
    console.error('Save profile error:', error)
    return {
      success: false,
      error: `Failed to save profile: ${error.message}`
    }
  }
}

/**
 * Load a user's profile
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const loadProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found - this is not an error
        return {
          success: true,
          data: null
        }
      }
      console.error('Load profile error:', error)
      return {
        success: false,
        error: `Failed to load profile: ${error.message}`
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Load profile error:', error)
    return {
      success: false,
      error: `Failed to load profile: ${error.message}`
    }
  }
}

/**
 * Get current user and their profile
 * @returns {Promise<{success: boolean, user?: any, profile?: any, error?: string}>}
 */
export const getCurrentUserWithProfile = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    // Load user's profile
    const profileResult = await loadProfile(user.id)
    
    if (!profileResult.success) {
      return {
        success: false,
        error: profileResult.error
      }
    }

    return {
      success: true,
      user,
      profile: profileResult.data
    }
  } catch (error) {
    console.error('Get current user with profile error:', error)
    return {
      success: false,
      error: `Failed to get user data: ${error.message}`
    }
  }
}
