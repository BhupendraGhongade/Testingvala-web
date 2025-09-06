import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose, categories = [], onPostCreated }) => {
  const [formData, setFormData] = useState({ title: '', content: '', category_id: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailForLogin, setEmailForLogin] = useState('');
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setAuthUser(data?.user || null);

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          setAuthUser(session?.user || null);
        });

        // store subscription to unsubscribe later
        // @ts-ignore
        init._sub = sub?.subscription;
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      try {
        if (init._sub) init._sub.unsubscribe();
      } catch {
        // ignore unsubscribe errors
      }
    };
  }, []);

  const isUserVerified = (user) => {
    if (!user) return false;
    // Prefer an explicit verification flag if available
    if (typeof user.user_metadata?.is_verified !== 'undefined') return Boolean(user.user_metadata.is_verified);
    if (typeof user.app_metadata?.is_verified !== 'undefined') return Boolean(user.app_metadata.is_verified);
    // Common Supabase fields
    if (user?.email_confirmed_at || user?.confirmed_at) return true;
    // Fallback: treat authenticated users as verified by default (avoids blocking normal OAuth users)
    return true;
  };

  const _persistLastPostError = (err) => {
    try {
      localStorage.setItem('last_post_error', JSON.stringify({ time: new Date().toISOString(), error: err }));
    } catch (e) {
      console.debug('persist last post error failed', e?.message || e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Debug: Log the selected category and available categories
    console.log('Selected category_id:', formData.category_id);
    console.log('Available categories:', categories);

    // If supabase isn't available, save locally to localStorage so the UI can show demo/local posts.
    const supabaseAvailable = !!supabase;
    if (!supabaseAvailable) {
      try {
        const local = JSON.parse(localStorage.getItem('local_forum_posts') || '[]');
        const newPost = {
          id: `local-${Date.now()}`,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category_id: formData.category_id,
          category_name: categories.find(c => c.id === formData.category_id)?.name || 'General',
          created_at: new Date().toISOString(),
          user_profiles: { username: 'local-user', full_name: 'Local User', avatar_url: null },
          replies_count: 0,
          likes_count: 0,
          image_url: formData.image_url || null,
          status: 'active'
        };
        local.unshift(newPost);
        localStorage.setItem('local_forum_posts', JSON.stringify(local));
        toast.success('Post saved locally for demo purposes');
        setFormData({ title: '', content: '', category_id: '', image_url: '' });
        onPostCreated && onPostCreated();
        onClose && onClose();
        return;
      } catch (err) {
        console.error('Failed to save post locally:', err);
        toast.error('Failed to save post locally');
        return;
      }
    }

    try {
      setLoading(true);
      const { data: ud } = await supabase.auth.getUser();
      const user = ud?.user || null;
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }

      // Only allow verified users to submit posts
      const verified = isUserVerified(user);
      if (!verified) {
        toast.error('Only verified users can create posts. Please verify your account.');
        return;
      }

      // Simplified category resolution: just use the selected category_id directly
      // The categories passed to this component should already have proper UUIDs
      let resolvedCategoryId = formData.category_id;
      
      // If the category_id is not a UUID, try to find it in the categories array
      const isUUID = (s) => typeof s === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s);
      
      if (!isUUID(resolvedCategoryId)) {
        // Try to find the category by slug or name in the local categories array
        const localMatch = categories.find(c => {
          if (!c) return false;
          if (c.id === resolvedCategoryId) return true;
          if (c.slug === resolvedCategoryId) return true;
          if (c.name === resolvedCategoryId) return true;
          return false;
        });
        
        if (localMatch?.id) {
          resolvedCategoryId = localMatch.id;
        } else {
          console.error('Category not found locally:', resolvedCategoryId);
          toast.error('Selected category is invalid. Please choose a category from the list.');
          setLoading(false);
          return;
        }
      }

      const { data: _inserted, error } = await supabase
        .from('forum_posts')
        .insert([{ title: formData.title.trim(), content: formData.content.trim(), category_id: resolvedCategoryId, user_id: user.id, image_url: formData.image_url || null, status: 'pending_approval' }])
        .select();

      if (error) throw error;

      toast.success('Post submitted successfully! It will be reviewed by admin before publishing.');
      setFormData({ title: '', content: '', category_id: '', image_url: '' });
      onPostCreated && onPostCreated();
      onClose && onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      // Save last raw error to localStorage for developer debugging in local/dev
      _persistLastPostError(err);
      // Prefer Supabase error message when available for easier debugging
      const message = err?.message || err?.error || err?.details || String(err) || 'Failed to create post. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!supabase) {
      toast.error('Backend not configured');
      return;
    }

    try {
      setImageUploading(true);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `forum-${timestamp}-${randomString}.${fileExt}`;
      const filePath = `forum-images/${fileName}`;

      const { data: _uploadRes, error } = await supabase.storage.from('testingvala-bucket').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;

      const { data: urlRes } = supabase.storage.from('testingvala-bucket').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: urlRes.publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!emailForLogin) return toast.error('Please enter your email');
    try {
      setSendingMagicLink(true);
      const { error } = await supabase.auth.signInWithOtp({ email: emailForLogin });
      if (error) {
        toast.error(error.message);
      } else {
        setMagicLinkSent(true);
        toast.success('Magic link sent — check your email');
      }
    } catch (err) {
      console.error('Magic link error:', err);
      toast.error('Failed to send magic link');
    } finally { setSendingMagicLink(false); }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
      if (error) toast.error(error.message);
    } catch (err) {
      console.error('OAuth error:', err);
      toast.error('Failed to start GitHub login');
    }
  };

  if (!isOpen) return null;

  if (!supabase) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Create Post (Local Dev)</h3>
          <p className="text-gray-700 mb-6">Supabase is not configured. Post creation is disabled in local dev mode.</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#FF6600] text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Create New Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {authLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
              <div className="text-gray-600">Checking authentication...</div>
            </div>
          ) : (!authUser || showLoginPrompt) && !!supabase ? (
            <div>
              {!magicLinkSent ? (
                <>
                  <h4 className="text-lg font-semibold mb-2">Sign in to create a post</h4>
                  <p className="text-sm text-gray-600 mb-4">You need to sign in to submit posts. Choose a sign-in method below.</p>

                  <div className="space-y-3 mb-4">
                    <input type="email" placeholder="Your email" value={emailForLogin} onChange={(e) => { setEmailForLogin(e.target.value); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" />
                    {emailForLogin.trim() !== '' && (
                      <div className="text-sm text-[#0f172a]">Verify your email to start posting and inspire others!</div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={sendMagicLink} className="flex-1 bg-brand text-white px-4 py-3 rounded-lg" disabled={sendingMagicLink}>{sendingMagicLink ? 'Sending...' : 'Send'}</button>
                      <button onClick={signInWithGithub} className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg">Sign in with GitHub</button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">After signing in you'll be able to submit your post. Close this dialog and continue once authenticated.</div>
                </>
              ) : (
                <div className="text-center py-6">
                  <h4 className="text-lg font-semibold mb-2">Magic link sent</h4>
                  <p className="text-sm text-gray-700 mb-4">Please verify your email and start posting your blogs. Learn more, grow more!</p>
                  <div className="flex justify-center">
                    <button onClick={() => { setShowLoginPrompt(false); onClose && onClose(); }} className="px-4 py-2 bg-brand text-white rounded-lg">Close</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  {categories.length === 0 ? (
                    <div className="text-red-600 text-sm py-2">
                      No categories available. Please contact an administrator to set up forum categories.
                    </div>
                  ) : (
                    <select value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" required>
                      <option value="">Select a category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter your post title..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" maxLength={100} required />
                  <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Content *</label>
                  <textarea value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent resize-none" maxLength={2000} required />
                  <div className="text-xs text-gray-500 mt-1">{formData.content.length}/2000 characters</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Image (Optional)</label>
                  <div className="space-y-3">
                    {formData.image_url && (
                      <div className="relative">
                        <img src={formData.image_url} alt="Post preview" className="w-full h-32 object-cover rounded-lg border border-gray-300" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                        <ImageIcon className="w-4 h-4 text-brand" />
                        <span className="text-sm font-medium">Choose Image</span>
                        <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} className="hidden" />
                      </label>
                      {imageUploading && <div className="flex items-center gap-2 text-sm text-gray-600"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>Uploading...</div>}
                    </div>
                  </div>
                </div>
              </form>

              {/* Sticky footer inside scrollable area so actions remain visible on small screens */}
              <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" form="create-post-form" disabled={loading || categories.length === 0} className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Creating...</>) : (<><Send className="w-4 h-4" />Create Post</>)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
