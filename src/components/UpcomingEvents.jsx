import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, ChevronRight, Users, DollarSign, Star, AlertCircle, MapPin, User } from 'lucide-react';
import { getUpcomingEvents } from '../lib/supabase';
import toast from 'react-hot-toast';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_usingDemo, setUsingDemo] = useState(false);

  const DEMO_EVENTS = [
    {
      id: 'demo-1',
      title: 'QA Automation Masterclass',
      short_description: 'Hands-on automation patterns and frameworks.',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      event_time: '10:00:00',
      duration_minutes: 120,
      event_type: 'masterclass',
      price: '$49',
      capacity: 100,
      registered_count: 12,
      speaker: 'A. Tester',
      speaker_title: 'Senior QA Engineer',
      company: 'TestingVala',
      registration_link: '#',
      image_url: null,
      location: 'Online',
      featured: true,
      __demo: true
    },
    {
      id: 'demo-2',
      title: 'Performance Testing Workshop',
      short_description: 'Learn load testing with open-source tools.',
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      event_time: '15:00:00',
      duration_minutes: 90,
      event_type: 'workshop',
      price: 'Free',
      capacity: 50,
      registered_count: 5,
      speaker: 'B. Load',
      speaker_title: 'Performance Specialist',
      company: 'TestingVala',
      registration_link: '#',
      image_url: null,
      location: 'Online',
      featured: false,
      __demo: true
    }
  ];

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingEvents()

      if (!data || data.length === 0) {
        console.log('No upcoming events found')
        setEvents([])
      } else {
        setEvents(data || [])
      }
    } catch (err) {
      console.error('Error fetching events', err);
      setError('Failed to load upcoming events');
      toast.error('Failed to load upcoming events');

      // On fetch error, show empty events
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'Time TBD';
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return 'Time TBD';
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'workshop': 'bg-purple-100 text-purple-800 border-purple-200',
      'masterclass': 'bg-blue-100 text-blue-800 border-blue-200',
      'seminar': 'bg-green-100 text-green-800 border-green-200',
      'conference': 'bg-orange-100 text-orange-800 border-orange-200',
      'webinar': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'workshop': '🔧',
      'masterclass': '🎓',
      'seminar': '📚',
      'conference': '🎤',
      'webinar': '💻'
    };
    return icons[type?.toLowerCase()] || '📅';
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              Loading Events
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Professional Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join industry experts and advance your QA career with our premium events
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - Minimal display
  if (error) {
    return (
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Events temporarily unavailable</span>
              <button
                onClick={fetchEvents}
                className="ml-2 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No events state - Minimal professional display
  if (events.length === 0) {
    return (
      <section className="py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events Coming Soon - Stay Tuned!</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Display events in a grid
  const displayEvents = events.slice(0, 3); // Show first 3 events

  return (
    <section id="events" className="bg-gradient-to-br from-gray-50 via-white to-blue-50 relative z-20 pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Calendar className="w-4 h-4" />
            Professional Events
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upcoming Professional Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join industry experts and advance your QA career with our premium events
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {displayEvents.map((event, index) => {
            // Add fallbacks for missing data
            const safeEvent = {
              title: event.title || 'Upcoming QA Event',
              short_description: event.short_description || event.description || 'Join us for an exciting QA event!',
              event_date: event.event_date || new Date().toISOString().split('T')[0],
              event_time: event.event_time || '14:00:00',
              duration_minutes: event.duration_minutes || 120,
              event_type: event.event_type || 'workshop',
              price: event.price || '$99',
              capacity: event.capacity || 50,
              registered_count: event.registered_count || 0,
              speaker: event.speaker || 'QA Expert',
              speaker_title: event.speaker_title || 'Senior QA Professional',
              company: event.company || 'TestingVala',
              registration_link: event.registration_link || '#',
              image_url: event.image_url || null,
              location: event.location || 'Online',
              featured: event.featured || false
            };

            const registrationPercentage = safeEvent.capacity ? Math.round((safeEvent.registered_count || 0) / safeEvent.capacity * 100) : 0;

            return (
              <div key={event.id || index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Event Image */}
                <div className="relative h-40 bg-gradient-to-br from-[#0057B7] to-[#004494] overflow-hidden">
                  {safeEvent.image_url ? (
                    <img 
                      src={safeEvent.image_url} 
                      alt={safeEvent.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl">{getEventTypeIcon(safeEvent.event_type)}</div>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {safeEvent.featured && (
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  
                  {/* Event Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEventTypeColor(safeEvent.event_type)}`}>
                      {safeEvent.event_type.toUpperCase()}
                    </span>
                    </div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="text-lg font-bold text-primary">{safeEvent.price}</div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-5">
                  {/* Event Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {safeEvent.title}
                  </h3>
                  
                  {/* Event Description */}
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {safeEvent.short_description}
                  </p>

              {/* Speaker Info */}
                  <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {safeEvent.speaker.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{safeEvent.speaker}</div>
                      <div className="text-gray-600 text-xs">{safeEvent.speaker_title}</div>
                </div>
              </div>

              {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(safeEvent.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{formatTime(safeEvent.event_time)} • {safeEvent.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{safeEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{safeEvent.registered_count}/{safeEvent.capacity} Registered ({registrationPercentage}% Full)</span>
                    </div>
                  </div>

              {/* Registration Button */}
                <a
                    href={safeEvent.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="w-full btn-primary py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <DollarSign className="w-4 h-4" />
                    Register Now - {safeEvent.price}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Events Link */}
        {events.length > 3 && (
          <div className="text-center">
          <a
            href="/events"
            onClick={(e) => {
              // Ensure reliable navigation to the events page across browsers and SPA timing
              try {
                e.preventDefault();
              } catch {
                // ignore
              }
              // Use full navigation so browser always loads /events
              window.location.href = '/events';
            }}
            className="inline-flex items-center gap-2 text-[#FF6600] hover:text-[#E55A00] transition-colors font-semibold text-lg"
          >
            <span>View all {events.length} upcoming events</span>
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvents;
