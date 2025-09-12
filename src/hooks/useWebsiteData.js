import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useWebsiteData = () => {
  const defaultData = useMemo(() => ({
    hero: { headline: 'Win Big with Your Testing Expertise', subtitle: 'Show off your QA skills in our monthly contest!', stats: { participants: '500+', prizes: '$2,000+', support: '24/7' } },
    contest: { title: 'January 2025 QA Contest', theme: 'Testing Hacks & Smart Techniques', prizes: '', submission: '', deadline: '', status: 'Coming Soon' },
    winners: [],
    about: { description: '', features: [], stats: {} },
    contact: { email: 'info@testingvala.com', website: 'www.testingvala.com', location: 'Global QA Community', socialMedia: {} },
    footer: {
      brand: { name: 'TestingVala', logoLetter: 'T', tagline: 'QA Excellence Platform' },
      description: 'Empowering QA professionals worldwide through knowledge sharing, skill development, and competitive excellence.',
      contact: { email: 'info@testingvala.com', phone: '+1 (555) 123-4567', website: 'https://www.testingvala.com' },
      quickLinks: [
        { label: 'Home', href: '#home' },
        { label: 'Events', href: '#events' },
        { label: 'Winners', href: '#winners' },
        { label: 'Community', href: '#community' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' }
      ],
      resources: [
        { label: 'QA Tips & Tricks', href: '/resources/tips' },
        { label: 'Interview Preparation', href: '/resources/interview' },
        { label: 'Privacy Policy', href: '/privacy' }
      ],
      socialMedia: { twitter: '', linkedin: '', youtube: '', instagram: '' },
      copyright: '© 2025 TestingVala. All rights reserved.'
    },
    messages: []
  }), [])

  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(false)

  const mergeDataWithDefaults = (base, backend = {}) => {
    const merged = { ...base }
    Object.keys(base).forEach((k) => {
      if (backend[k] !== undefined) {
        if (Array.isArray(base[k])) merged[k] = Array.isArray(backend[k]) ? backend[k] : base[k]
        else if (typeof base[k] === 'object' && base[k] !== null) merged[k] = { ...base[k], ...backend[k] }
        else merged[k] = backend[k]
      }
    })
    return merged
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const raw = localStorage.getItem('local_website_content')
        if (raw) setData(mergeDataWithDefaults(defaultData, JSON.parse(raw)))
        else setData(defaultData)
        setIsOnline(false)
        setLoading(false)
        return
      }

      const { data: websiteData, error: fetchErr } = await supabase.from(TABLES.WEBSITE_CONTENT).select('*').single()
      if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr
      if (websiteData && websiteData.content) {
        setData(mergeDataWithDefaults(defaultData, websiteData.content))
        setIsOnline(true)
      } else {
        await supabase.from(TABLES.WEBSITE_CONTENT).insert({ id: 1, content: defaultData })
        setIsOnline(true)
      }
    } catch (err) {
      console.error('Error loading website data:', err)
      setError(err?.message || String(err))
      setIsOnline(false)
    } finally {
      setLoading(false)
    }
  }, [defaultData])

  const validateSectionData = (section, val) => {
    try {
      switch (section) {
        case 'hero': return val && val.headline !== undefined
        case 'contest': return val && val.title !== undefined
  case 'winners': return Array.isArray(val)
        case 'about': return val && val.description !== undefined
  case 'contact': return val && val.email !== undefined
  case 'footer': return val && typeof val === 'object'
  case 'messages': return Array.isArray(val)
        default: return true
      }
    } catch (e) { console.error('Validation error', e); return false }
  }

  const saveData = async (section, newData) => {
    try {
      if (!validateSectionData(section, newData)) { toast.error('Invalid data'); return false }
      const updated = { ...data, [section]: newData }
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        localStorage.setItem('local_website_content', JSON.stringify(updated))
        setData(updated)
        toast.success(`${section} updated locally`)
        return true
      }
      const { error } = await supabase.from(TABLES.WEBSITE_CONTENT).upsert({ id: 1, content: updated, updated_at: new Date().toISOString() })
      if (error) throw error
      setData(updated)
      toast.success(`${section} updated successfully`)
      return true
    } catch (err) {
      console.error('Error saving data', err)
      toast.error('Failed to save')
      return false
    }
  }

  const saveMultipleSections = async (sectionsData) => {
    try {
      const updated = { ...data, ...sectionsData }
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        localStorage.setItem('local_website_content', JSON.stringify(updated))
        setData(updated)
        toast.success('Saved locally')
        return true
      }
      const { error } = await supabase.from(TABLES.WEBSITE_CONTENT).upsert({ id: 1, content: updated, updated_at: new Date().toISOString() })
      if (error) throw error
      setData(updated)
      toast.success('Saved successfully')
      return true
    } catch (err) {
      console.error('Error saving multiple', err)
      toast.error('Failed to save')
      return false
    }
  }

  const addMessage = async (messageObj) => {
    try {
      const newMessage = { id: Date.now(), name: messageObj.name || 'Anonymous', email: messageObj.email || '', subject: messageObj.subject || '', message: messageObj.message || '', read: false, created_at: new Date().toISOString() }
      const existing = Array.isArray(data.messages) ? data.messages : []
      return await saveData('messages', [newMessage, ...existing])
    } catch (err) { console.error('Error adding message', err); return false }
  }

  useEffect(() => { loadData() }, [loadData])

  const getSectionData = (section) => data[section] || null
  const updateSectionLocally = (section, newData) => setData(prev => ({ ...prev, [section]: newData }))
  return { data, loading, error, isOnline, saveData, saveMultipleSections, refreshData: loadData, getSectionData, updateSectionLocally, mergeDataWithDefaults, addMessage }
}
