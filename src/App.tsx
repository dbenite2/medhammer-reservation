import { useEffect, useState } from 'react' 
import './App.css'
import Reserve from './pages/Reserve'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js'
import { hasStoredInviteLink, supabase } from './lib/supabase';
import { CircularProgress, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login'


const InviteRedirectToLogin = () => {
  const { search, hash } = useLocation();

  return (
    <Navigate
      to={{ pathname: '/login', search, hash }}
      replace
    />
  );
};


const App = () => {
  const [isInviteFlow, setIsInviteFlow] = useState(() => hasStoredInviteLink());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  //   // document.documentElement.classList.toggle("dark", theme === "dark");
  //   // localStorage.setItem("theme", theme);
  // }, [theme]);
  const [mode] = useState<'light' | 'dark'>('light');
  
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#2D4059',
        light: '#53677F',
        dark: '#1F2D40',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#EA5455',
        light: '#F07B7C',
        dark: '#C53F46',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#EA5455',
      },
      warning: {
        main: '#F07B3F',
        contrastText: '#2D4059',
      },
      success: {
        main: '#2D4059',
      },
      background: {
        default: '#FFF9EC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#2D4059',
        secondary: '#657184',
      },
      divider: 'rgba(45, 64, 89, 0.18)',
    },
    shape: {
      borderRadius: 8,
    },
  });


  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // setMode(systemDark ? 'dark' : 'light');

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <ThemeProvider theme={theme} data-theme={mode}>
    <CssBaseline />
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!session || isInviteFlow
            ? <Login onInviteCompleted={() => setIsInviteFlow(false)} />
            : <Navigate to="/reserve" replace />}
        />

        <Route 
          path="/reserve" 
          element={isInviteFlow ? <InviteRedirectToLogin /> : <Reserve />}
        />
        <Route 
          path="/" 
          element={isInviteFlow
            ? <InviteRedirectToLogin />
            : <Navigate to="/reserve" replace />}
        />
        {/* <Route
          path='/'
          element={
            <button onClick={() => {}}>
              {theme === "dark" ?  "🌙 Dark" : "☀️ Light" }
            </button>
          }
        /> */}
      </Routes>
    </Router>
    </ThemeProvider>
  )
}

export default App
