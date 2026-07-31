import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { clearStoredInviteLink, getPendingInviteToken, hasStoredInviteLink, supabase } from '../lib/supabase';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import { useTranslate } from '../i18n/useTranslate';
import InfoModal from '../components/common/InfoModal';

type FeedbackModalState = {
  open: boolean;
  severity: AlertColor;
  title: string;
  message: string;
};

const closedFeedbackModal: FeedbackModalState = {
  open: false,
  severity: 'info',
  title: '',
  message: '',
};

type LoginProps = {
  onInviteCompleted?: () => void;
};

const Login = ({ onInviteCompleted }: LoginProps) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [isInviteRegistration] = useState(() => hasStoredInviteLink());
  const [pendingInviteToken] = useState(() => getPendingInviteToken());
  const [inviteReady, setInviteReady] = useState(
    () => isInviteRegistration && !getPendingInviteToken()
  );
  
  // Form State
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(closedFeedbackModal);
  const [navigateAfterFeedbackClose, setNavigateAfterFeedbackClose] = useState(false);

  const getFeedbackTitle = useCallback((severity: AlertColor) => {
    if (severity === 'success') return translate("feedback.successTitle");
    if (severity === 'error') return translate("feedback.errorTitle");
    if (severity === 'warning') return translate("feedback.warningTitle");
    return translate("feedback.infoTitle");
  }, [translate]);

  const showFeedbackModal = useCallback((severity: AlertColor, message: string) => {
    setFeedbackModal({
      open: true,
      severity,
      title: getFeedbackTitle(severity),
      message,
    });
  }, [getFeedbackTitle]);

  const handleFeedbackModalClose = () => {
    setFeedbackModal(closedFeedbackModal);

    if (navigateAfterFeedbackClose) {
      setNavigateAfterFeedbackClose(false);
      onInviteCompleted?.();
      navigate('/reserve', { replace: true });
    }
  };

  useEffect(() => {
    if (!isInviteRegistration || !inviteReady) return;

    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
      if (userError || !user) {
        showFeedbackModal('error', translate("auth.inviteInvalid"));
        return;
      }

      setEmail(user.email ?? '');
      setPreferredName(user.user_metadata?.preferred_name || user.user_metadata?.full_name || user.user_metadata?.name || '');
    });
  }, [inviteReady, isInviteRegistration, showFeedbackModal, translate]);

  const handleAcceptInvite = async () => {
    if (!pendingInviteToken) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: pendingInviteToken,
        type: 'invite',
      });

      if (error || !data.user) {
        console.error('Invite verification failed:', error);
        showFeedbackModal('error', translate("auth.inviteInvalid"));
        return;
      }

      const user = data.user;
      setEmail(user.email ?? '');
      setPreferredName(
        user.user_metadata?.preferred_name
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || ''
      );

      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('token_hash');
      cleanUrl.searchParams.delete('type');
      window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
      setInviteReady(true);
    } catch (error) {
      console.error('Invite verification failed:', error);
      showFeedbackModal('error', translate("auth.inviteInvalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isInviteRegistration) {
        const cleanPreferredName = preferredName.trim();
        const { error: updateError } = await supabase.auth.updateUser({
          password,
          data: {
            full_name: cleanPreferredName,
            name: cleanPreferredName,
            preferred_name: cleanPreferredName,
          },
        });

        if (updateError) throw updateError;
        clearStoredInviteLink();
        setNavigateAfterFeedbackClose(true);
        showFeedbackModal('success', translate("auth.inviteCompleteSuccess"));
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
    } catch {
      showFeedbackModal('error', translate("auth.authenticationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          {isInviteRegistration
            ? translate(inviteReady ? "auth.inviteTitle" : "auth.inviteAcceptTitle")
            : translate("auth.signInTitle")}
        </Typography>

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
          {isInviteRegistration
            ? translate(inviteReady ? "auth.inviteHint" : "auth.inviteAcceptHint")
            : translate("auth.existingUserHint")}
        </Typography>

        {!inviteReady && pendingInviteToken ? (
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            onClick={handleAcceptInvite}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? translate("auth.processing") : translate("auth.inviteAcceptAction")}
          </Button>
        ) : (
        <form onSubmit={handleSubmit}>
          {isInviteRegistration && (
            <TextField
              fullWidth
              label={translate("auth.preferredNameLabel")}
              type="text"
              variant="outlined"
              margin="normal"
              required
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
          )}

          <TextField
            fullWidth
            label={translate("auth.emailLabel")}
            type="email"
            variant="outlined"
            margin="normal"
            required
            disabled={isInviteRegistration}
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
            {loading ? translate("auth.processing") : (isInviteRegistration ? translate("auth.inviteCompleteAction") : translate("auth.signInAction"))}
          </Button>
        </form>
        )}
      </Paper>

      <InfoModal
        open={feedbackModal.open}
        severity={feedbackModal.severity}
        title={feedbackModal.title}
        message={feedbackModal.message}
        handleClose={handleFeedbackModalClose}
      />
    </Box>
  );
};

export default Login;
