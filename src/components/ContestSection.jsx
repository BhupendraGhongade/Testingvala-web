import React from 'react';

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
    <section id="contest" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Monthly QA Contest</h2>
          <p className="text-xl text-gray-600">Compete with QA professionals worldwide</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{monthTitle}</h3>
                <p className="text-gray-600 mt-2">{safeData.theme || defaultData.theme}</p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
                <div className="text-sm text-gray-500 mt-2">{daysLeft}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prizes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>1st Place</span>
                    <span className="font-semibold">$500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2nd Place</span>
                    <span className="font-semibold">$300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3rd Place</span>
                    <span className="font-semibold">$200</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Start</span>
                    <span className="font-semibold">{contestStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End</span>
                    <span className="font-semibold">{contestEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Left</span>
                    <span className="font-semibold text-[#FF6600]">{daysLeft}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="text-center">
                <button
                  type="button"
                  onClick={status === 'Ended' || status === 'Starting Soon' ? undefined : openContestForm}
                  disabled={status === 'Ended' || status === 'Starting Soon'}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg ${
                    status === 'Ended' || status === 'Starting Soon'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-[#FF6600] text-white hover:bg-[#E55A00]'
                  }`}
                >
                  {status === 'Ended' ? 'Contest Ended' : status === 'Starting Soon' ? 'Starting Soon' : 'Submit Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContestSection;
