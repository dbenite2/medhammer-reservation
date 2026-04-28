import { use, useEffect, useState } from 'react' 
import './App.css'
import Reserve from './pages/Reserve'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase';
import { CircularProgress, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from './pages/Login'



const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  //   // document.documentElement.classList.toggle("dark", theme === "dark");
  //   // localStorage.setItem("theme", theme);
  // }, [theme]);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  const theme = createTheme({
    palette: {
      mode: mode,  // 'light' or 'dark'
    },
  });


useEffect(() => {
  document.documentElement.dataset.theme = mode;
}, [mode]);

  useEffect(() => {
    // 1. Get the session right when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Set up a listener so React updates instantly if they log in or out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const systemDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    setMode(systemDark ? 'dark' : 'light');

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Show a clean MUI loading spinner while checking the database
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <ThemeProvider theme={theme} data-theme={mode}>
    <Router>
      <Routes>
        {/* Public Route: If they have a session, send them away from the login page */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/reserve" replace />} 
        />

        {/* Protected Route: If they don't have a session, send them to login */}
        <Route 
          path="/reserve" 
          element={session ? <Reserve /> : <Navigate to="/login" replace />} 
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
