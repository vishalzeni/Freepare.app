import Modal from "../../components/ui/Modal";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#066C98] focus:ring-2 focus:ring-sky-100";

const AdditionalInfoDialog = ({
  open,
  onClose,
  additionalInfo,
  handleAdditionalInfoChange,
  handleAddInfoSubmit,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Additional Information"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddInfoSubmit}
            className="rounded-lg bg-[#066C98] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045472]"
          >
            Submit
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Institution Type</label>
          <select
            className={inputClass}
            name="institutionType"
            value={additionalInfo.institutionType || ""}
            onChange={handleAdditionalInfoChange}
          >
            <option value="">Select type</option>
            <option value="school">School</option>
            <option value="college">College/University</option>
          </select>
        </div>

        {additionalInfo.institutionType === "school" && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Class</label>
            <input
              className={inputClass}
              name="class"
              value={additionalInfo.class || ""}
              onChange={handleAdditionalInfoChange}
            />
          </div>
        )}

        {additionalInfo.institutionType === "college" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700">Institution Name</label>
              <input
                className={inputClass}
                name="institutionName"
                value={additionalInfo.institutionName || ""}
                onChange={handleAdditionalInfoChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Degree Name</label>
              <input
                className={inputClass}
                name="degreeName"
                value={additionalInfo.degreeName || ""}
                onChange={handleAdditionalInfoChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Passing Year</label>
              <input
                className={inputClass}
                name="passingYear"
                value={additionalInfo.passingYear || ""}
                onChange={handleAdditionalInfoChange}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AdditionalInfoDialog;

