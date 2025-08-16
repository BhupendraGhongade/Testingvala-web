import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, Users, CheckCircle, ArrowRight } from 'lucide-react';

const ContestSection = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  if (!data) return null;

  // Calculate time left until deadline
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date(data.deadline);
      const difference = deadline - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [data.deadline]);

  const openContestForm = () => {
    const contestUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdVsoGqy4FaSV5bHaCAQN4oCxxhG36NoiG4eGdNp8mjQMsJzw/viewform?usp=header';
    window.open(contestUrl, '_blank');
  };

  return (
    <section id="contest" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {data.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {data.theme}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contest Details */}
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {data.status}
            </div>

            {/* Prizes */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Prizes
              </h3>
              <p className="text-lg text-gray-700 whitespace-pre-line">
                {data.prizes}
              </p>
            </div>

            {/* Submission Guidelines */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Submission Guidelines</h3>
              <p className="text-gray-700 leading-relaxed">
                {data.submission}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Time Remaining
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-600">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-600">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contest Form */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl text-white">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Ready to Compete?</h3>
              <p className="text-blue-100 text-lg">
                Join thousands of QA professionals and showcase your skills!
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Free to participate</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Global recognition</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Network with experts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Win amazing prizes</span>
              </div>
            </div>

            <button
              onClick={openContestForm}
              className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Submit Your Entry
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center mt-6">
              <p className="text-blue-100 text-sm">
                Deadline: {new Date(data.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContestSection;
