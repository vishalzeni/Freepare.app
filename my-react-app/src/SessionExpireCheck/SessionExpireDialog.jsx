import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useSession } from '../SessionExpireCheck/SessionProvider';

const SessionExpireDialog = () => {
  const { openDialog, setOpenDialog, handleLoginClick } = useSession();

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Session Expired</DialogTitle>
      <DialogContent>
        <p>Your session has expired. Please log in again to continue.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLoginClick} color="primary">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpireDialog;
