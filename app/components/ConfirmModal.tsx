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
        className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
            danger ? "bg-error-container/10 text-error" : "bg-primary/10 text-primary"
          }`}>
            <span className="material-symbols-outlined text-2xl">
              {danger ? "warning" : "info"}
            </span>
          </div>
          <div className="pt-1">
            <h2 className="font-extrabold text-lg text-on-surface" style={{ fontFamily: "Outfit, sans-serif" }}>
              {title}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-highest">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 ${
              danger ? "bg-error hover:bg-error-container/80 shadow-red-500/20" : "bg-primary hover:bg-primary-dim shadow-blue-500/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
