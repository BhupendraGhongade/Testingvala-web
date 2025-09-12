import React from 'react';
import { 
  Bug, 
  Zap, 
  Wrench, 
  Briefcase, 
  BookOpen, 
  ArrowRight,
  Users,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

const CategoryNavigation = () => {
  const categories = [
    {
      id: 'manual-testing',
      name: 'Manual Testing',
      description: 'Learn manual testing techniques, test case design, and exploratory testing strategies.',
      icon: Bug,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      stats: '2.5k+ posts',
      topics: ['Test Cases', 'Bug Reports', 'Exploratory Testing', 'Test Planning']
    },
    {
      id: 'automation',
      name: 'Automation',
      description: 'Master test automation frameworks, tools, and best practices for efficient testing.',
      icon: Zap,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      stats: '3.2k+ posts',
      topics: ['Selenium', 'Cypress', 'Playwright', 'API Testing']
    },
    {
      id: 'tools',
      name: 'Tools & Technologies',
      description: 'Explore testing tools, CI/CD integration, and technology stack discussions.',
      icon: Wrench,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      stats: '1.8k+ posts',
      topics: ['JIRA', 'Postman', 'Jenkins', 'Docker']
    },
    {
      id: 'career',
      name: 'Career & Growth',
      description: 'Career advice, interview preparation, and professional development for QA engineers.',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      stats: '1.2k+ posts',
      topics: ['Interviews', 'Certifications', 'Leadership', 'Salary']
    },
    {
      id: 'best-practices',
      name: 'Best Practices',
      description: 'Industry best practices, methodologies, and quality assurance standards.',
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      stats: '2.1k+ posts',
      topics: ['Agile Testing', 'TDD', 'BDD', 'Quality Gates']
    }
  ];

  const handleCategoryClick = (categoryId) => {
    // Scroll to community section and filter by category
    const communitySection = document.getElementById('community');
    if (communitySection) {
      communitySection.scrollIntoView({ behavior: 'smooth' });
      
      // You can add logic here to filter posts by category
      // For now, we'll just scroll to the community section
      console.log(`Navigating to category: ${categoryId}`);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <BookOpen className="w-4 h-4" />
            Explore Topics
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#0057B7] to-[#FF6600] bg-clip-text text-transparent">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find relevant discussions and resources organized by testing categories. Connect with experts in your area of interest.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${category.bgColor} ${category.borderColor} border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 hover:scale-105`}
            >
              {/* Category Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>

              {/* Category Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6600] transition-colors">
                {category.name}
              </h3>

              {/* Category Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                {category.description}
              </p>

              {/* Category Stats */}
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#FF6600]" />
                <span className="text-sm font-medium text-gray-700">{category.stats}</span>
              </div>

              {/* Popular Topics */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Popular Topics
                </p>
                <div className="flex flex-wrap gap-1">
                  {category.topics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                    >
                      {topic}
                    </span>
                  ))}
                  {category.topics.length > 3 && (
                    <span className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                      +{category.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Explore Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#FF6600] group-hover:text-[#E55A00] transition-colors">
                  Explore Category
                </span>
                <ArrowRight className="w-4 h-4 text-[#FF6600] group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Overview</h3>
            <p className="text-gray-600">Join thousands of QA professionals sharing knowledge and experiences</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0057B7] to-[#004494] rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">15K+</div>
              <div className="text-sm text-gray-600">Discussions</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6600] to-[#E55A00] rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Solutions</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0057B7] to-[#004494] rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNavigation;
