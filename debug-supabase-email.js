// Debug Supabase Email Configuration
// Run this in browser console on Supabase dashboard

console.log('=== SUPABASE EMAIL DEBUG ===');

// Check if we're on the right page
if (window.location.href.includes('supabase.co')) {
    console.log('✅ On Supabase dashboard');
    
    // Check current URL
    console.log('Current URL:', window.location.href);
    
    // Look for email template elements
    const templateTextarea = document.querySelector('textarea[placeholder*="template"], textarea[name*="template"], textarea[id*="template"]');
    if (templateTextarea) {
        console.log('✅ Found template textarea');
        console.log('Template length:', templateTextarea.value.length);
        console.log('First 200 chars:', templateTextarea.value.substring(0, 200));
    } else {
        console.log('❌ Template textarea not found');
    }
    
    // Check for save button
    const saveButton = document.querySelector('button[type="submit"], button:contains("Save"), button:contains("Update")');
    if (saveButton) {
        console.log('✅ Found save button');
    } else {
        console.log('❌ Save button not found');
    }
    
    // Check for SMTP settings
    const smtpInputs = document.querySelectorAll('input[name*="smtp"], input[placeholder*="smtp"]');
    console.log('SMTP inputs found:', smtpInputs.length);
    
} else {
    console.log('❌ Not on Supabase dashboard');
    console.log('Go to: https://supabase.com/dashboard/project/[your-project]/auth/templates');
}

// Instructions
console.log(`
=== INSTRUCTIONS ===
1. Go to: Authentication → Settings → Email Templates
2. Select "Magic Link" template
3. Paste the simple-test-template.html content
4. Save and test with a new email address
5. Check if you receive the updated template
`);