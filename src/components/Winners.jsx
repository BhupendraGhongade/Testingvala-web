import React from 'react';
import { Trophy, Star, Award } from 'lucide-react';

const Winners = ({ data }) => {
  if (!data || !data.winners) return null;

  return (
    <section id="winners" className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Previous Winners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the talented QA professionals who have won our monthly contests and shared their innovative testing techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.winners.map((winner, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="p-8 text-center">
                {/* Winner Avatar */}
                <div className="w-20 h-20 mx-auto mb-6 text-4xl flex items-center justify-center">
                  {winner.avatar}
                </div>

                {/* Winner Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {winner.name}
                </h3>

                {/* Winner Title */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-lg font-semibold text-yellow-600">
                    {winner.title}
                  </span>
                </div>

                {/* QA Trick */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Winning QA Trick</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {winner.trick}
                  </p>
                </div>

                {/* Achievement Badge */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  {index === 0 && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4" />
                      1st Place
                    </div>
                  )}
                  {index === 1 && (
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Award className="w-4 h-4" />
                      2nd Place
                    </div>
                  )}
                  {index === 2 && (
                    <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Award className="w-4 h-4" />
                      3rd Place
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Join the Winners Circle?
            </h3>
            <p className="text-gray-600 mb-6">
              Share your QA expertise and compete with the best testing professionals worldwide.
            </p>
            <button 
              onClick={() => {
                const contestUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdVsoGqy4FaSV5bHaCAQN4oCxxhG36NoiG4eGdNp8mjQMsJzw/viewform?usp=header';
                window.open(contestUrl, '_blank');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Trophy className="w-5 h-5" />
              Submit Your Entry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Winners;
