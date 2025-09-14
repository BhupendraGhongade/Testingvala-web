import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, DollarSign, Download, Eye, Calendar, Award } from 'lucide-react';

const ResumeAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalResumes: 0,
    freeResumes: 0,
    premiumResumes: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    topSkills: [],
    recentActivity: []
  });

  useEffect(() => {
    // Load analytics data
    const mockData = {
      totalResumes: 1247,
      freeResumes: 892,
      premiumResumes: 355,
      totalRevenue: 7100,
      monthlyGrowth: 23.5,
      topSkills: [
        { skill: 'Selenium WebDriver', count: 234 },
        { skill: 'API Testing', count: 198 },
        { skill: 'JIRA', count: 187 },
        { skill: 'Automation Testing', count: 176 },
        { skill: 'Manual Testing', count: 165 }
      ],
      recentActivity: [
        { user: 'john.doe@email.com', type: 'Premium', role: 'QA Engineer', timestamp: '2 hours ago' },
        { user: 'sarah.smith@email.com', type: 'Free', role: 'Software Tester', timestamp: '4 hours ago' },
        { user: 'mike.wilson@email.com', type: 'Premium', role: 'SDET', timestamp: '6 hours ago' }
      ]
    };
    setAnalytics(mockData);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Resume Builder Analytics</h3>
        <p className="text-gray-600">Track usage, revenue, and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resumes</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalResumes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+{analytics.monthlyGrowth}%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Free Resumes</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.freeResumes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {((analytics.freeResumes / analytics.totalResumes) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Premium Resumes</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.premiumResumes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {((analytics.premiumResumes / analytics.totalResumes) * 100).toFixed(1)}% conversion rate
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              ${(analytics.totalRevenue / analytics.premiumResumes).toFixed(0)} avg per premium
            </div>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Popular QA Skills</h4>
        <div className="space-y-3">
          {analytics.topSkills.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FF6600] text-white rounded-lg flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{item.skill}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#FF6600] h-2 rounded-full" 
                    style={{ width: `${(item.count / analytics.topSkills[0].count) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Resume Activity</h4>
        <div className="space-y-4">
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'Premium' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.role} • {activity.type} Resume</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalytics;