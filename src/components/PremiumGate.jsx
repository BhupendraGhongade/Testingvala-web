import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { usePremiumAccess } from '../hooks/usePremiumAccess';
import PremiumAccess from './PremiumAccess';

const PremiumGate = ({ userEmail, children, fallback = null }) => {
  const { hasAccess, loading } = usePremiumAccess(userEmail);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Checking access...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-8 border border-purple-200 text-center">
        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-purple-900 mb-2">Premium Feature</h3>
        <p className="text-purple-700 mb-6">This feature requires premium access to use.</p>
        <PremiumAccess userEmail={userEmail} />
      </div>
    );
  }

  return children;
};

export default PremiumGate;