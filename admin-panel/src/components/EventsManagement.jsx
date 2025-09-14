import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Link, Image as ImageIcon, X, Upload, Eye, EyeOff, TestTube } from 'lucide-react';
import { getUpcomingEvents, createEvent, updateEvent, deleteEvent, uploadEventImage, testSupabaseConnection } from '../lib/supabase';
import toast from 'react-hot-toast';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    event_date: '',
    event_time: '',
    duration_minutes: 120,
    registration_link: '',
    image_url: '',
    image_file: null,
    event_type: 'workshop',
    difficulty_level: 'beginner',
    max_participants: '',
    is_featured: false,
    is_active: true,
    price: '$99',
    capacity: 50,
    registered_count: 0,
    speaker: '',
    speaker_title: '',
    company: 'TestingVala',
    location: 'Online',
    featured: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getUpcomingEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      console.log('🧪 Testing Supabase connection...');
      
      const result = await testSupabaseConnection();
      
      if (result.success) {
        toast.success('✅ Supabase connection test passed!');
        console.log('🎉 Connection test successful');
      } else {
        toast.error(`❌ Connection test failed: ${result.error}`);
        console.error('❌ Connection test failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Test function error:', error);
      toast.error('❌ Test function error: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, GIF, WebP, etc.)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    try {
      setImageUploading(true);
      
      if (!editingEvent?.id) {
        const previewUrl = URL.createObjectURL(file);
        
        setFormData(prev => ({ 
          ...prev, 
          image_file: file,
          image_url: previewUrl
        }));
        
        toast.success('Image selected! It will be uploaded when you save the event.');
      } else {
        const imageUrl = await uploadEventImage(file, editingEvent.id);
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        event_date: formData.event_date,
        event_time: formData.event_time,
        duration_minutes: formData.duration_minutes,
        registration_link: formData.registration_link,
        image_url: formData.image_url,
        event_type: formData.event_type,
        difficulty_level: formData.difficulty_level,
        max_participants: formData.max_participants,
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success('Event updated successfully!');
      } else {
        if (formData.image_file) {
          const newEvent = await createEvent(eventData);
          
          if (newEvent?.id) {
            try {
              const imageUrl = await uploadEventImage(formData.image_file, newEvent.id);
              await updateEvent(newEvent.id, { image_url: imageUrl });
              toast.success('Event created with image successfully!');
            } catch (imageError) {
              console.error('Image upload failed:', imageError);
              toast.error('Event created but image upload failed. You can add an image later.');
            }
          }
        } else {
          try {
            await createEvent(eventData);
            toast.success('Event created successfully!');
          } catch (createErr) {
            console.error('Create event failed:', createErr);
            if (import.meta.env.MODE !== 'production') {
              const localEvent = {
                id: `local-${Date.now()}`,
                ...eventData,
                registered_count: 0,
                image_url: formData.image_url || null
              };
              setEvents(prev => [localEvent, ...prev]);
              toast.success('Event added locally (dev fallback)');
            } else {
              toast.error('Failed to create event');
              throw createErr;
            }
          }
        }
      }
      
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event. Please try again.');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      short_description: event.short_description,
      event_date: event.event_date,
      event_time: event.event_time,
      duration_minutes: event.duration_minutes || 120,
      registration_link: event.registration_link,
      image_url: event.image_url,
      image_file: null,
      event_type: event.event_type || 'workshop',
      difficulty_level: event.difficulty_level || 'beginner',
      max_participants: event.max_participants,
      is_featured: event.is_featured,
      is_active: event.is_active,
      price: event.price || '$99',
      capacity: event.capacity || 50,
      registered_count: event.registered_count || 0,
      speaker: event.speaker || '',
      speaker_title: event.speaker_title || '',
      company: event.company || 'TestingVala',
      location: event.location || 'Online',
      featured: event.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        toast.success('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      event_date: '',
      event_time: '',
      duration_minutes: 120,
      registration_link: '',
      image_url: '',
      image_file: null,
      event_type: 'workshop',
      difficulty_level: 'beginner',
      max_participants: '',
      is_featured: false,
      is_active: true,
      price: '$99',
      capacity: 50,
      registered_count: 0,
      speaker: '',
      speaker_title: '',
      company: 'TestingVala',
      location: 'Online',
      featured: false
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Events Management</h3>
          <p className="text-gray-600 text-sm mt-1">Manage upcoming workshops, seminars, and events</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={testConnection}
            disabled={testingConnection}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Test Supabase connection and storage"
          >
            <TestTube className="w-4 h-4" />
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#E55A00] transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No events found</p>
                    <p className="text-sm">Create your first event to get started</p>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.image_url && (
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          {event.short_description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {event.short_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#FF6600]" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-[#0057B7]" />
                        <span>{formatTime(event.event_time)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="capitalize text-gray-900">{event.event_type}</span>
                        <span className="capitalize text-gray-600">{event.difficulty_level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {event.is_featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#FF6600] text-white">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-[#0057B7] hover:text-[#FF6600] transition-colors p-1 rounded"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Brief description (max 200 characters)"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.short_description.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="Detailed event description"
                  />
                </div>
              </div>

              {/* Date, Time, and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 120 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="120"
                    min="30"
                    max="480"
                  />
                </div>
              </div>

              {/* Difficulty and Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                    placeholder="50"
                    min="1"
                  />
                </div>
              </div>

              {/* Registration Link and Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Link
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                      placeholder="https://forms.google.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image
                  </label>
                  <div className="space-y-3">
                    {formData.image_url && (
                      <div className="relative">
                        <img 
                          src={formData.image_url} 
                          alt="Event preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '', image_file: null })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                        <Upload className="w-4 h-4 text-[#FF6600]" />
                        <span className="text-sm font-medium">Choose Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              console.log('Selected file:', {
                                name: file.name,
                                type: file.type,
                                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
                              });
                              handleImageUpload(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {imageUploading && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6600]"></div>
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Options */}
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Event is active and visible to public
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                    Mark as featured event
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#E55A00] transition-colors font-medium"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;