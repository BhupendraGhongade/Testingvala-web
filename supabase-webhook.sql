-- Create function to send magic link via webhook
CREATE OR REPLACE FUNCTION send_magic_link_webhook()
RETURNS TRIGGER AS $$
DECLARE
  magic_link_url TEXT;
BEGIN
  -- Generate magic link URL
  magic_link_url := 'https://qxsardezvxsquvejvsso.supabase.co/auth/v1/verify?token=' || NEW.confirmation_token || '&type=signup&redirect_to=' || 'http://localhost:5173';
  
  -- Call webhook to send email
  PERFORM net.http_post(
    url := 'http://localhost:3001/send-magic-link',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'email', NEW.email,
      'magic_link', magic_link_url,
      'user_metadata', NEW.raw_user_meta_data
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_magic_link_webhook();