import React, { useState } from 'react';
import { Trophy, Calendar, Clock, Award } from 'lucide-react';
import ContestSubmissionForm from './ContestSubmissionForm';

const ContestSection = ({ data, contestData }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const defaultData = {
    title: 'January 2025 QA Contest',
    theme: 'Advanced Testing Methodologies',
    submission: 'Share your innovative QA approach with detailed methodology and measurable impact',
    deadline: '2025-01-31',
    status: 'Active Now'
  };

  const safeData = contestData || data || defaultData;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const contestStart = new Date(currentYear, currentMonth, 1);
  const contestEnd = new Date(currentYear, currentMonth + 1, 0);
  const diffTime = contestEnd - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDaysRemaining = () => {
    if (diffDays < 0) return 'Contest Ended';
    if (diffDays === 0) return 'Final Day';
    if (diffDays === 1) return '1 Day Remaining';
    return `${diffDays} Days Remaining`;
  };

  const getContestStatus = () => {
    if (today < contestStart) return 'Opening Soon';
    if (today >= contestStart && today <= contestEnd) {
      if (diffDays <= 3) return 'Closing Soon';
      return 'Active';
    }
    return 'Closed';
  };

  const getCurrentMonthContestTitle = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[today.getMonth()]} ${today.getFullYear()} Professional QA Contest`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'closing soon': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'closed': return 'bg-slate-50 text-slate-600 border border-slate-200';
      case 'opening soon': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const status = getContestStatus();
  const daysLeft = getDaysRemaining();
  const monthTitle = getCurrentMonthContestTitle();

  // Contest statistics from website content or defaults
  const defaultStats = {
    participants: '2,500+',
    countries: '45+',
    submissions: '1,200+',
    winners: '36'
  };
  
  const contestStats = safeData.stats || defaultStats;

  return (
    <>
      {/* Main Contest Section */}
      <section id="contest" className="py-16 bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#FF6600] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#0057B7] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6600] to-[#E55A00] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
              <Trophy className="w-5 h-5" />
              Professional Excellence Program
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
              Monthly QA Excellence Contest
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join the world's largest QA professional community. Showcase your expertise, learn from industry leaders, and advance your career.
            </p>
          </div>

          {/* Main Contest Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-16">
            {/* Contest Header */}
            <div className="bg-gradient-to-r from-[#0057B7] to-[#FF6600] px-8 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="text-white mb-6 lg:mb-0">
                  <h3 className="text-2xl font-bold mb-2">{monthTitle}</h3>
                  <p className="text-blue-100 text-lg">{safeData.theme || defaultData.theme}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Ends {contestEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{daysLeft}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <span className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold ${getStatusColor(status)} shadow-lg`}>
                    {status}
                  </span>
                  <button
                    type="button"
                    onClick={status === 'Closed' || status === 'Opening Soon' ? undefined : () => setShowSubmissionForm(true)}
                    disabled={status === 'Closed' || status === 'Opening Soon'}
                    className={`mt-4 block w-full lg:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      status === 'Closed' || status === 'Opening Soon'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-[#FF6600] hover:bg-orange-50 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {status === 'Closed' ? 'Contest Closed' : status === 'Opening Soon' ? 'Opening Soon' : 'Submit Entry'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Contest Statistics */}
            <div className="p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                  <div className="text-3xl font-bold text-[#FF6600] mb-2">{contestStats.participants}</div>
                  <div className="text-sm font-medium text-gray-600">Active Participants</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="text-3xl font-bold text-[#0057B7] mb-2">{contestStats.countries}</div>
                  <div className="text-sm font-medium text-gray-600">Countries</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                  <div className="text-3xl font-bold text-gray-700 mb-2">{contestStats.submissions}</div>
                  <div className="text-sm font-medium text-gray-600">Total Submissions</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{contestStats.winners}</div>
                  <div className="text-sm font-medium text-gray-600">Certified Winners</div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-8 border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Why Participate?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#FF6600] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">Professional Recognition</h5>
                    <p className="text-sm text-gray-600">Get certified and showcase your expertise to employers worldwide</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#0057B7] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">Career Advancement</h5>
                    <p className="text-sm text-gray-600">Network with industry leaders and accelerate your QA career</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">Continuous Learning</h5>
                    <p className="text-sm text-gray-600">Stay updated with latest QA trends and methodologies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contest Submission Form Modal */}
      <ContestSubmissionForm 
        isOpen={showSubmissionForm}
        onClose={() => setShowSubmissionForm(false)}
        contestData={{
          theme: safeData.theme || defaultData.theme,
          deadline: safeData.deadline || defaultData.deadline
        }}
      />
    </>
  );
};

export default ContestSection;
