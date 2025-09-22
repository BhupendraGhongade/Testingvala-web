// Professional email templates for ZeptoMail
export const getEmailTemplate = (email, magicLink, templateType = 'professional') => {
  const templates = {
    professional: {
      subject: '🚀 Verify Your TestingVala Account',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TestingVala Verification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; color: #1e40af; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #4b5563; margin-bottom: 30px; line-height: 1.7; }
        .cta-container { text-align: center; margin: 40px 0; }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(30, 64, 175, 0.4); }
        .security-info { background: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
        .security-title { font-weight: 600; color: #1e40af; margin-bottom: 8px; }
        .security-text { font-size: 14px; color: #64748b; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-text { font-size: 14px; color: #64748b; margin-bottom: 15px; }
        .social-links { margin: 20px 0; }
        .social-link { display: inline-block; margin: 0 10px; color: #1e40af; text-decoration: none; font-size: 14px; }
        .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
        @media (max-width: 600px) {
            .header, .content, .footer { padding: 30px 20px; }
            .title { font-size: 20px; }
            .cta-button { padding: 14px 28px; font-size: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 TestingVala</div>
            <div class="tagline">Professional QA Community Platform</div>
        </div>
        
        <div class="content">
            <h1 class="title">Verify Your Account</h1>
            
            <p class="message">
                Welcome to TestingVala! We're excited to have you join our community of QA professionals. 
                To complete your registration and access all features, please verify your email address.
            </p>
            
            <div class="cta-container">
                <a href="${magicLink}" class="cta-button">Verify My Account</a>
            </div>
            
            <div class="security-info">
                <div class="security-title">🔒 Security Information</div>
                <div class="security-text">
                    This verification link is valid for 24 hours and can only be used once. 
                    If you didn't request this verification, please ignore this email.
                </div>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #64748b; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${magicLink}" style="color: #1e40af; word-break: break-all;">${magicLink}</a>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © ${new Date().getFullYear()} TestingVala. All rights reserved.
            </p>
            
            <div class="social-links">
                <a href="https://www.linkedin.com/company/testingvala" class="social-link">LinkedIn</a>
                <a href="https://twitter.com/testingvala" class="social-link">Twitter</a>
                <a href="https://www.youtube.com/@TestingvalaOfficial" class="social-link">YouTube</a>
                <a href="https://www.instagram.com/testingvala" class="social-link">Instagram</a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                TestingVala - Building the future of QA professionals worldwide
            </p>
        </div>
    </div>
</body>
</html>`
    },
    
    minimal: {
      subject: 'Verify Your TestingVala Account',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TestingVala Verification</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; }
        .button { background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">🚀 TestingVala</h1>
        <p style="margin: 10px 0 0 0;">Professional QA Platform</p>
    </div>
    <div class="content">
        <h2 style="color: #1e40af;">Verify Your Account</h2>
        <p>Click the button below to verify your email and access TestingVala:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${magicLink}" class="button">Verify Account</a>
        </div>
        <p class="footer">
            Link expires in 24 hours. If you didn't request this, please ignore this email.<br>
            © ${new Date().getFullYear()} TestingVala
        </p>
    </div>
</body>
</html>`
    }
  };
  
  return templates[templateType] || templates.professional;
};

// ZeptoMail template creation
export const createZeptoMailTemplate = async (apiKey, templateData) => {
  try {
    const response = await fetch('https://api.zeptomail.in/v1.1/email/template', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_name: templateData.name,
        template_subject: templateData.subject,
        template_body: templateData.html,
        template_type: 'html'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Template creation failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ZeptoMail template creation error:', error);
    throw error;
  }
};

// Send email using ZeptoMail API with template
export const sendZeptoMailWithTemplate = async (apiKey, emailData) => {
  try {
    const payload = {
      from: {
        address: emailData.fromEmail,
        name: emailData.fromName
      },
      to: [{
        email_address: {
          address: emailData.toEmail,
          name: emailData.toName || ''
        }
      }],
      subject: emailData.subject,
      htmlbody: emailData.html,
      textbody: emailData.text || '',
      track_opens: true,
      track_clicks: true
    };
    
    const response = await fetch('https://api.zeptomail.in/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ZeptoMail API error: ${response.status} - ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ZeptoMail send error:', error);
    throw error;
  }
};