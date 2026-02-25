import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
Upload as UploadCloud,
  FileText,
  Trash2,
  Copy,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const processData = (text = "") => {
  if (!text) return "";
  return text
    .replace(/\n/g, "<br />")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/~(.*?)~/g, "<u>$1</u>");
};

export default function ExamUpload() {
  const [files, setFiles] = useState([]); // {name, size, error?}
  const [excelData, setExcelData] = useState([]); // parsed rows
  const [examName, setExamName] = useState("");
  const [examId, setExamId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showIdDialog, setShowIdDialog] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const formatFileSize = (bytes) =>
    bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(2)} KB`;

  const addFiles = useCallback((newFiles) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const processed = [];

    newFiles.forEach((file) => {
      let error = null;
      if (file.size > MAX_FILE_SIZE) {
        error = "File exceeds 5MB limit";
      } else if (!validTypes.includes(file.type)) {
        error = "Only .xlsx and .xls files are allowed";
      }

      processed.push({
        name: file.name,
        size: formatFileSize(file.size),
        error,
      });

      if (!error) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            setExcelData(json);
          } catch (err) {
            console.error("Excel parse error:", err);
            showToast("Failed to parse Excel file", "error");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        showToast(error, "error");
      }
    });

    setFiles((prev) => [...prev, ...processed]);

    if (processed.some((f) => !f.error)) {
      showToast("File(s) added successfully");
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    (e) => addFiles(Array.from(e.target.files)),
    [addFiles]
  );

  const removeFile = (index) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setExcelData([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return updated;
    });
  };

  const handleUpload = () => {
    if (files.length === 0 || files.every((f) => f.error)) {
      showToast("No valid files to upload", "error");
      return;
    }
    setShowNameDialog(true);
  };

  const submitExam = async () => {
    if (!examName.trim()) {
      showToast("Please enter a test code", "error");
      return;
    }

    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    setExamId(id);
    setIsUploading(true);

    try {
      const res = await fetch(`${API_URL}/api/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetData: excelData,
          examId: id,
          examName: examName.trim(),
        }),
      });

      if (!res.ok) throw new Error("Upload failed");

      showToast("Exam uploaded successfully!", "success");
      setShowNameDialog(false);
      setShowIdDialog(true);

      // Reset after success
      setFiles([]);
      setExcelData([]);
      setExamName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      showToast(err.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(examId);
    showToast("Exam ID copied to clipboard");
  };

  const resetAfterIdDialogClose = () => {
    setShowIdDialog(false);
    setExamId("");
    setExamName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Upload Zone - shown when no files */}
        {files.length === 0 && (
          <div
            className={`p-10 sm:p-16 border-2 border-dashed rounded-3xl text-center transition-all duration-200 ${
              dragging
                ? "border-[#003366] bg-blue-50 shadow-lg scale-[1.01]"
                : "border-[#066C98] hover:border-[#055a80] hover:bg-blue-50/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto w-20 h-20 sm:w-24 sm:h-24 text-[#066C98] mb-6" />

            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Upload Excel File
            </h2>

            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Drag & drop your .xlsx / .xls file here
              <br className="hidden sm:block" />
              or click to browse
            </p>

            <label className="inline-flex items-center px-8 py-4 bg-[#066C98] hover:bg-[#055a80] text-white font-medium rounded-2xl cursor-pointer transition shadow-md hover:shadow-lg">
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-6 text-sm text-gray-500">
              Maximum file size: 5 MB
            </p>
          </div>
        )}

        {/* Selected Files + Upload Button */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Selected Files ({files.length})
              </h2>
              <span className="text-sm text-gray-500">
                {files.filter((f) => !f.error).length} valid
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    file.error
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  } transition`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-[#066C98]" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${file.error ? "text-red-700" : "text-gray-900"}`}>
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">{file.size}</p>
                      {file.error && (
                        <p className="text-xs text-red-600 mt-0.5">{file.error}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(idx)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    disabled={isUploading}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading || files.every((f) => f.error)}
              className="w-full py-4 bg-[#066C98] hover:bg-[#055a80] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition flex items-center justify-center gap-3 shadow-md"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload to Server"
              )}
            </button>
          </div>
        )}

        {/* Live Preview - shown when excelData exists */}
        {excelData.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              File Preview
            </h2>

            <div className="space-y-10">
              {excelData.map((row, idx) => (
                <div key={idx} className="border-b pb-8 last:border-b-0 last:pb-0">
                  {/* Question */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#066C98]/10 text-[#066C98] font-bold flex items-center justify-center shrink-0 text-lg">
                      {row["Question No."] || idx + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-lg font-medium text-gray-900"
                        dangerouslySetInnerHTML={{
                          __html: processData(row["Question"] || ""),
                        }}
                      />

                      {row["Question Image"] && row["Question Image"].trim() && (
                        <img
                          src={row["Question Image"]}
                          alt="Question visual"
                          className="mt-4 max-w-full sm:max-w-2xl rounded-lg border shadow-sm"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="ml-14 space-y-4">
                    {["A", "B", "C", "D"].map((opt) => {
                      const textKey = `Option ${opt}`;
                      const imgKey = `Option ${opt} Image`;
                      const text = row[textKey];
                      const img = row[imgKey];

                      if (!text && !img) return null;

                      return (
                        <div key={opt} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium shrink-0">
                            {opt}
                          </div>
                          <div className="flex-1">
                            {text && <p className="text-gray-800">{text}</p>}
                            {img && img.trim() && (
                              <img
                                src={img}
                                alt={`Option ${opt}`}
                                className="mt-2 max-h-40 object-contain rounded border"
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Correct Answer */}
                  {(row["Correct Answer"] || row["Explanation"] || row["Explanation Image"]) && (
                    <div className="mt-6 ml-14 bg-green-50/40 p-5 rounded-xl border border-green-200">
                      {row["Correct Answer"] && (
                        <p className="font-bold text-green-700 mb-3">
                          Correct Answer: {row["Correct Answer"]}
                        </p>
                      )}

                      {(row["Explanation"] || row["Explanation Image"]) && (
                        <div>
                          <p className="text-gray-700 font-medium mb-2">Explanation:</p>
                          {row["Explanation"] && (
                            <div
                              className="text-gray-800"
                              dangerouslySetInnerHTML={{
                                __html: processData(row["Explanation"]),
                              }}
                            />
                          )}
                          {row["Explanation Image"] && row["Explanation Image"].trim() && (
                            <img
                              src={row["Explanation Image"]}
                              alt="Explanation"
                              className="mt-4 max-w-full sm:max-w-xl rounded-lg border shadow-sm"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Toast */}
        {toast.show && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white min-w-[340px] ${
                toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => setToast({ ...toast, show: false })}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Exam Name Dialog */}
        {showNameDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold mb-6 text-center">
                Enter Test Code
              </h3>
              <input
                autoFocus
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. NEET2025-MOCK01"
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-[#066C98]"
              />
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="flex-1 py-4 border border-gray-300 hover:bg-gray-50 rounded-2xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitExam}
                  disabled={isUploading || !examName.trim()}
                  className="flex-1 py-4 bg-[#066C98] hover:bg-[#055a80] text-white font-semibold rounded-2xl disabled:opacity-60 transition flex items-center justify-center gap-2"
                >
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam ID Success Dialog */}
        {showIdDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold mb-4">Exam Created!</h3>

              <p className="text-gray-600 mb-6">
                Save this Exam ID — you'll need it to access the test:
              </p>

              <div className="bg-gray-100 p-6 rounded-2xl font-mono text-4xl font-bold tracking-widest text-[#066C98] border border-gray-200 mb-8">
                {examId}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={copyId}
                  className="flex-1 flex items-center justify-center gap-3 py-4 border border-gray-300 hover:bg-gray-50 rounded-2xl font-medium transition"
                >
                  <Copy className="w-5 h-5" />
                  Copy ID
                </button>
                <button
                  onClick={resetAfterIdDialogClose}
                  className="flex-1 py-4 bg-[#066C98] hover:bg-[#055a80] text-white font-semibold rounded-2xl transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}