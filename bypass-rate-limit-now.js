// BYPASS SUPABASE RATE LIMIT - DIRECT ZEPTOMAIL
// Add this to your AuthModal.jsx

const sendDirectEmail = async (email) => {
  try {
    const response = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) throw new Error('Failed to send email');
    return await response.json();
  } catch (error) {
    console.error('Direct email error:', error);
    throw error;
  }
};

// Replace the handleEmailSubmit function in AuthModal.jsx:
const handleEmailSubmit = async (e) => {
  e.preventDefault();
  if (!email.trim()) {
    toast.error('Please enter your email address');
    return;
  }

  setLoading(true);
  try {
    // Try direct email first (bypasses Supabase rate limit)
    await sendDirectEmail(email.trim());
    setStep('verify');
    toast.success('Magic link sent! Check your email to verify and continue.');
  } catch (error) {
    // Fallback to Supabase if direct email fails
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (supabaseError) throw supabaseError;
      setStep('verify');
      toast.success('Magic link sent! Check your email to verify and continue.');
    } catch (fallbackError) {
      toast.error('Rate limit exceeded. Please try a different email or wait 1 hour.');
    }
  } finally {
    setLoading(false);
  }
};