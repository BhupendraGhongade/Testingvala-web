import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Filter, Search } from 'lucide-react';
import { getAllEvents } from '../lib/supabase';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const dummyEvents = [
    // (same dummy data as before to preserve local preview)
    {
      id: '1',
      title: 'QA Automation Masterclass 2025',
      short_description: 'Master the latest automation testing frameworks and tools in this intensive 3-hour session.',
      event_date: '2025-02-15',
      event_time: '14:00:00',
      duration_minutes: 180,
      event_type: 'masterclass',
      difficulty_level: 'advanced',
      image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop',
      registration_link: 'https://forms.google.com/automation-masterclass',
      is_featured: true,
      is_active: true
    },
    {
      id: '2',
      title: 'Mobile App Testing Workshop',
      short_description: 'Learn mobile app testing strategies and tools for iOS and Android applications.',
      event_date: '2025-02-20',
      event_time: '10:00:00',
      duration_minutes: 120,
      event_type: 'workshop',
      difficulty_level: 'intermediate',
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
      registration_link: 'https://forms.google.com/mobile-testing',
      is_featured: true,
      is_active: true
    }
  ];

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getAllEvents();
      if (eventsData && eventsData.length > 0) setEvents(eventsData);
      else setEvents(dummyEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(dummyEvents);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return 'Invalid Time';
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'masterclass': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'workshop': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seminar': return 'bg-green-100 text-green-800 border-green-200';
      case 'webinar': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-orange-100 text-orange-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isEventUpcoming = (eventDate) => {
    const d = new Date(eventDate);
    return d >= new Date();
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming' && !isEventUpcoming(event.event_date)) return false;
    if (filter === 'past' && isEventUpcoming(event.event_date)) return false;
    if (selectedType !== 'all' && event.event_type !== selectedType) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && !event.short_description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const eventTypes = [...new Set(events.map(e => e.event_type))];

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <Calendar className="w-4 h-4" />
            All Events
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
            Events & Workshops
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover upcoming workshops, seminars, and masterclasses to enhance your QA skills and advance your career.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent">
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-transparent">
              <option value="all">All Types</option>
              {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#FF6600]/30 group transform hover:-translate-y-1">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center mb-3 shadow-lg">
                          <Calendar className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Event Image</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 backdrop-blur-sm bg-white/90 ${getEventTypeColor(event.event_type)}`}>{event.event_type}</span>
                  </div>

                  {event.is_featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">⭐ Featured</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FF6600] transition-colors duration-200 leading-tight">{event.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-3 text-sm leading-relaxed">{event.short_description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(event.difficulty_level)}`}>{event.difficulty_level}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-600 font-medium"><Clock className="w-4 h-4 text-[#FF6600]" />{event.duration_minutes} min</div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-4 h-4 text-[#FF6600]" /><span className="font-medium">{formatDate(event.event_date)}</span></div>
                    <div className="flex items-center gap-2 text-gray-700"><Clock className="w-4 h-4 text-[#0057B7]" /><span>{formatTime(event.event_time)}</span></div>
                    <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-[#FF6600]" /><span>{event.location || 'Online'}</span></div>
                  </div>

                  {event.registration_link && isEventUpcoming(event.event_date) ? (
                    <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-[#0057B7] to-[#004494] text-white py-2 px-4 rounded-lg font-bold hover:from-[#FF6600] hover:to-[#E55A00] transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg transform group-hover:scale-102">
                      <span>Register Now</span>
                      <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                    </a>
                  ) : !isEventUpcoming(event.event_date) ? (
                    <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-medium text-center">Event Completed</div>
                  ) : (
                    <div className="w-full bg-orange-100 text-orange-700 py-2 px-4 rounded-lg font-medium text-center">Registration Coming Soon</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Statistics</h3>
            <p className="text-gray-600">Track our community engagement through events</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6600] mb-2">{events.filter(e => isEventUpcoming(e.event_date)).length}</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#0057B7] mb-2">{events.filter(e => !isEventUpcoming(e.event_date)).length}</div>
              <div className="text-sm text-gray-600">Past Events</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6600] mb-2">{eventTypes.length}</div>
              <div className="text-sm text-gray-600">Event Types</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-[#0057B7] mb-2">{events.filter(e => e.is_featured).length}</div>
              <div className="text-sm text-gray-600">Featured Events</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsPage;
