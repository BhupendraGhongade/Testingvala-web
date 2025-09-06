import React from 'react';
import { Calendar, Clock, Trophy, Target, Users, Award } from 'lucide-react';

const ContestSection = ({ data }) => {
  // Default fallback data
  const defaultData = {
    title: 'January 2025 QA Contest',
    theme: 'Testing Hacks & Smart Techniques',
    prizes: '1st Place: $500 | 2nd Place: $300 | 3rd Place: $200',
    submission: 'Share your QA trick with detailed explanation and impact',
    deadline: '2025-01-31',
    status: 'Active Now'
  };

  // Use provided data or fallback to defaults
  const safeData = data || defaultData;

  // Compute contest dates and derived values once to avoid repeated calls and jitter
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const contestStart = new Date(currentYear, currentMonth, 1);
  const contestEnd = new Date(currentYear, currentMonth + 1, 0);

  const diffTime = contestEnd - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDaysRemaining = () => {
    if (diffDays < 0) return 'Contest Ended';
    if (diffDays === 0) return 'Last Day!';
    if (diffDays === 1) return '1 Day Left';
    return `${diffDays} Days Left`;
  };

  const getContestStatus = () => {
    if (today < contestStart) return 'Starting Soon';
    if (today >= contestStart && today <= contestEnd) {
      if (diffDays <= 7) return 'Ending Soon';
      if (diffDays === 0) return 'Last Day';
      return 'Active Now';
    }
    return 'Ended';
  };

  // Get current month name and year for contest title
  const getCurrentMonthContestTitle = () => {
    const today = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[today.getMonth()]} ${today.getFullYear()} QA Contest`;
  };

  // Get next month's contest start date
  const getNextMonthContestStart = () => new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active now':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ending soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'last day':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'starting soon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'coming soon':
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openContestForm = () => {
    const contestUrl = (data?.form_link) ? data.form_link : 'https://docs.google.com/forms/d/e/1FAIpQLSdVsoGqy4FaSV5bHaCAQN4oCxxhG36NoiG4eGdNp8mjQMsJzw/viewform?usp=header';
    if (!contestUrl) {
      console.warn('No contest link configured')
      return
    }
    window.open(contestUrl, '_blank');
  };

  const status = getContestStatus();
  const daysLeft = getDaysRemaining();
  const monthTitle = getCurrentMonthContestTitle();

  return (
    <section id="contest" className="py-12 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Monthly QA Contest</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">Compete with QA professionals worldwide and showcase your testing expertise.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Title & Theme */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{monthTitle}</h3>
                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
                    <Target className="w-5 h-5 text-[#FF6600]" />
                    <span className="font-medium">Theme: {safeData.theme || defaultData.theme}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                    {status}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">{daysLeft}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Prizes</h4>
                  <ul className="text-sm text-gray-800 list-disc list-inside">
                    {(safeData.prize_breakdown || []).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Submission Format</h4>
                  <p className="text-sm text-gray-800">{safeData.submission_format || safeData.submission}</p>
                  <div className="mt-2 text-xs text-gray-500">Judging: {safeData.judging_criteria}</div>
                </div>
              </div>

              {safeData.description && (
                <div className="mt-4 text-sm text-gray-700">
                  {safeData.description}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Contest Rules</h4>

              <div className="text-sm text-gray-700">
                {Array.isArray(safeData.rules) && safeData.rules.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {safeData.rules.map((r, i) => (
                      <li key={i} className="text-sm text-gray-700">{r}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    <li>One submission per person (unless the contest specifies teams).</li>
                    <li>Submissions must be original work by the entrant.</li>
                    <li>Provide a clear explanation and any supporting screenshot or code.</li>
                    <li>Winners are selected by the judging panel and announced as scheduled.</li>
                  </ul>
                )}

                
              </div>
            </div>
          </div>

          {/* Right Column: Timer & CTA */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Contest Timeline</h4>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Start</div>
                  <div className="font-semibold text-gray-900">
                    {contestStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">End</div>
                  <div className="font-semibold text-gray-900">
                    {contestEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500">Time Remaining</div>
                <div className={`text-lg font-bold ${status === 'Ended' ? 'text-red-600' : 'text-[#0057B7]'}`}>{daysLeft}</div>
              </div>

              <button
                type="button"
                onClick={status === 'Ended' || status === 'Starting Soon' ? undefined : openContestForm}
                disabled={status === 'Ended' || status === 'Starting Soon'}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-lg transition-all duration-200 inline-flex items-center justify-center gap-2 ${
                  status === 'Ended' || status === 'Starting Soon'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white hover:shadow-lg'
                }`}
              >
                <Award className="w-5 h-5" />
                {status === 'Ended' ? 'Contest Ended' : status === 'Starting Soon' ? 'Starting Soon' : 'Submit Your Hacks/Tricks'}
              </button>
            </div>

            {status === 'Ended' && (
              <div className="bg-gradient-to-br from-[#FF6600] to-[#E55A00] rounded-xl p-4 text-white text-center">
                <h4 className="text-md font-bold mb-1">🎉 Next Contest Coming Soon!</h4>
                <div className="text-sm">
                  {getNextMonthContestStart().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContestSection;
