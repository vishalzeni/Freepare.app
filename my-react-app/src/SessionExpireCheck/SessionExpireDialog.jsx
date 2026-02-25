import { AlertTriangle } from "lucide-react";
import Modal from "../components/ui/Modal";
import { useSession } from "./SessionProvider";

const SessionExpireDialog = () => {
  const { openDialog, setOpenDialog, handleLoginClick } = useSession();

  return (
    <Modal
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      title="Session Expired"
      subtitle="Your session has expired. Please login again to continue."
      size="sm"
      footer={
        <button
          type="button"
          onClick={handleLoginClick}
          className="rounded-lg bg-[#066C98] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045472]"
        >
          Login
        </button>
      }
    >
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
        <AlertTriangle size={20} />
        <p className="text-sm font-medium">
          For your security, expired sessions are closed automatically.
        </p>
      </div>
    </Modal>
  );
};

export default SessionExpireDialog;

