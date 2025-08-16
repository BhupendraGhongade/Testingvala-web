import { useState, useEffect } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useWebsiteData = () => {
  const [data, setData] = useState({
    contest: {
      title: 'January 2025 QA Contest',
      theme: 'Testing Hacks & Smart Techniques',
      prizes: '1st Place: $500 | 2nd Place: $300 | 3rd Place: $200',
      submission: 'Share your QA trick with detailed explanation and impact',
      deadline: '2025-01-31',
      status: 'Active Now'
    },
    hero: {
      headline: 'Win Big with Your Testing Expertise',
      subtitle: 'Show off your QA skills in our monthly contest! Share your best testing hacks, automation tricks, and innovative approaches.',
      badge: '🚀 Test Your QA Skills. Win Rewards. Build Your Career',
      stats: {
        participants: '500+',
        prizes: '$2,000+',
        support: '24/7'
      }
    },
    winners: [
      {
        name: 'Sarah Chen',
        title: 'December 2024 Winner',
        trick: 'AI-Powered Test Case Generation',
        avatar: '👑'
      },
      {
        name: 'Mike Rodriguez',
        title: 'November 2024 Winner',
        trick: 'Cross-Browser Testing Automation',
        avatar: '🥈'
      },
      {
        name: 'Emma Thompson',
        title: 'October 2024 Winner',
        trick: 'Performance Testing Optimization',
        avatar: '🥉'
      }
    ],
    about: {
      description: 'TestingVala.com is your go-to platform for daily QA tricks, hacks, and interview preparation tips.',
      features: [
        'Daily QA tips and best practices',
        'Interview preparation resources',
        'Process improvement techniques',
        'Monthly QA contests with prizes'
      ],
      stats: {
        members: '10,000+',
        tips: '500+',
        contests: '12+',
        countries: '50+'
      }
    },
    contact: {
      email: 'info@testingvala.com',
      website: 'www.testingvala.com',
      location: 'Global QA Community',
      socialMedia: {
        instagram: 'https://www.instagram.com/testingvala',
        youtube: 'https://www.youtube.com/@TestingvalaOfficial',
        twitter: 'https://twitter.com/testingvala',
        linkedin: 'https://www.linkedin.com/company/testingvala'
      }
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(false)

  // Load data from Supabase
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using fallback data')
        setIsOnline(false)
        setLoading(false)
        return
      }

      const { data: websiteData, error } = await supabase
        .from(TABLES.WEBSITE_CONTENT)
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (websiteData) {
        setData(websiteData.content)
        setIsOnline(true)
      } else {
        // If no data exists, initialize it
        await initializeData()
        setIsOnline(true)
      }
    } catch (err) {
      console.error('Error loading website data:', err)
      setError(err.message)
      setIsOnline(false)
      // Don't show error toast for fallback mode
      if (import.meta.env.VITE_SUPABASE_URL) {
        toast.error('Failed to load website data, using fallback mode')
      }
    } finally {
      setLoading(false)
    }
  }

  // Save data to Supabase
  const saveData = async (section, newData) => {
    try {
      if (!isOnline) {
        toast.error('Backend not connected. Changes will not be saved.')
        return false
      }

      const updatedData = { ...data, [section]: newData }
      
      const { error } = await supabase
        .from(TABLES.WEBSITE_CONTENT)
        .upsert({
          id: 1,
          content: updatedData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setData(updatedData)
      toast.success(`${section} updated successfully!`)
      return true
    } catch (err) {
      console.error('Error saving data:', err)
      toast.error('Failed to save changes')
      return false
    }
  }

  // Initialize data if not exists
  const initializeData = async () => {
    try {
      const { data: existingData } = await supabase
        .from(TABLES.WEBSITE_CONTENT)
        .select('*')
        .single()

      if (!existingData) {
        const { error } = await supabase
          .from(TABLES.WEBSITE_CONTENT)
          .insert({
            id: 1,
            content: data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }
    } catch (err) {
      console.error('Error initializing data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    loading,
    error,
    isOnline,
    saveData,
    refreshData: loadData
  }
}
