import { supabase } from '../lib/supabase';
import { Alert, Box, Button, Divider, Link, Paper, TextField, Typography } from '@mui/material';
import { useState } from "react";
import { useTranslate } from '../i18n/useTranslate';

const Login = () => {
  const translate = useTranslate();
    // Toggle between Login and Registration mode
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/reserve`,
      },
    });

    if (googleError) {
      setError(translate("auth.googleSignInError"));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Create a new user
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (signUpError) throw signUpError;
        
        // Supabase requires email verification by default
        alert(translate("auth.signUpSuccess")); 
      } else {
        // Log in an existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (signInError) throw signInError;
        
        // Note: You do NOT need a redirect here! 
        // The listener we set up in App.tsx will catch the successful login 
        // and automatically route the user to the calendar.
      }
    } catch {
      setError(translate("auth.authenticationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          {isSignUp ? translate("auth.signUpTitle") : translate("auth.signInTitle")}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="large"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          sx={{ mt: 2, mb: 2 }}
        >
          {googleLoading ? translate("auth.googleProcessing") : translate("auth.continueWithGoogle")}
        </Button>

        <Divider sx={{ my: 2 }}>
          {translate("auth.emailDivider")}
        </Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={translate("auth.emailLabel")}
            type="email"
            variant="outlined"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label={translate("auth.passwordLabel")}
            type="password"
            variant="outlined"
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? translate("auth.processing") : (isSignUp ? translate("auth.signUpAction") : translate("auth.signInAction"))}
          </Button>
        </form>

        <Box textAlign="center">
          <Typography variant="body2">
            {isSignUp ? translate("auth.hasAccountQuestion") : translate("auth.noAccountQuestion")}{' '}
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
            >
              {isSignUp ? translate("auth.signInAction") : translate("auth.signUpAction")}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
