import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = "Write a comment...", 
  className = "",
  onSubmit,
  disabled = false 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const searchUsers = async (query) => {
    if (!supabase || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, full_name, email')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowSuggestions(true);
      searchUsers(query);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const insertMention = (user) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const mention = `@${user.username || user.full_name || user.email.split('@')[0]}`;
      const newValue = beforeMention + mention + ' ' + textAfterCursor;
      
      onChange(newValue);
      setShowSuggestions(false);
      
      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeMention.length + mention.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} resize-none text-gray-900 placeholder-gray-500 bg-white`}
        rows={3}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs w-full z-20">
          <div className="p-2 text-xs text-gray-500 border-b">
            Mention someone
          </div>
          {suggestions.map((user, index) => (
            <button
              key={index}
              onClick={() => insertMention(user)}
              className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {(user.username || user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm">
                  {user.full_name || user.username || user.email.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  @{user.username || user.email.split('@')[0]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;