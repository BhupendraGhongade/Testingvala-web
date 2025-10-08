import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BoardDiagnostics = () => {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      supabase: !!supabase,
      tests: {}
    };

    try {
      // Test 1: Check if user_boards table exists
      try {
        const { data, error } = await supabase.from('user_boards').select('id').limit(1);
        diagnostics.tests.tableExists = { success: true, error: null };
      } catch (error) {
        diagnostics.tests.tableExists = { success: false, error: error.message };
      }

      // Test 2: Try to create a test board
      if (user) {
        try {
          const testBoard = {
            user_id: user.id || user.email,
            name: 'Test Board',
            description: 'Diagnostic test board',
            is_private: true,
            position: 0
          };

          const { data, error } = await supabase
            .from('user_boards')
            .insert(testBoard)
            .select()
            .single();

          if (error) {
            diagnostics.tests.createBoard = { success: false, error: error.message };
          } else {
            diagnostics.tests.createBoard = { success: true, boardId: data.id };
            
            // Clean up test board
            await supabase.from('user_boards').delete().eq('id', data.id);
          }
        } catch (error) {
          diagnostics.tests.createBoard = { success: false, error: error.message };
        }
      }

      // Test 3: Check RLS policies
      try {
        const { data, error } = await supabase.from('user_boards').select('*').limit(1);
        diagnostics.tests.rlsAccess = { success: !error, error: error?.message };
      } catch (error) {
        diagnostics.tests.rlsAccess = { success: false, error: error.message };
      }

    } catch (error) {
      diagnostics.error = error.message;
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const fixIssues = async () => {
    toast.success('Please run the SQL script: fix-boards-table.sql in your Supabase dashboard');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Board Creation Diagnostics</h3>
      
      <div className="space-y-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>

        {results && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">User Info:</h4>
              <pre className="text-sm">{JSON.stringify(results.user, null, 2)}</pre>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Test Results:</h4>
              {Object.entries(results.tests).map(([test, result]) => (
                <div key={test} className="mb-2">
                  <span className="font-medium">{test}: </span>
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? '✅ PASS' : '❌ FAIL'}
                  </span>
                  {result.error && (
                    <div className="text-sm text-red-600 ml-4">{result.error}</div>
                  )}
                </div>
              ))}
            </div>

            {!results.tests.tableExists?.success && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">Fix Required:</h4>
                <p className="text-red-700 mb-2">The user_boards table doesn't exist.</p>
                <button
                  onClick={fixIssues}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Show Fix Instructions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDiagnostics;