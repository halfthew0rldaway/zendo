"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 24px 48px rgba(43,52,55,0.12)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
            danger ? "bg-[#fe8983]/10 text-[#9f403d]" : "bg-[#0c56d0]/10 text-[#0c56d0]"
          }`}>
            <span className="material-symbols-outlined text-2xl">
              {danger ? "warning" : "info"}
            </span>
          </div>
          <div className="pt-1">
            <h2 className="font-extrabold text-lg text-[#2b3437]" style={{ fontFamily: "Outfit, sans-serif" }}>
              {title}
            </h2>
            <p className="text-sm text-[#586064] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f4f6]">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#586064] hover:bg-[#f1f4f6] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${
              danger ? "bg-[#e11d48] hover:bg-[#be123c] shadow-red-500/20" : "bg-[#0c56d0] hover:bg-[#004ab9] shadow-blue-500/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
