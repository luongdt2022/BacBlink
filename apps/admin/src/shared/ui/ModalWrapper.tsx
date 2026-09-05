import type { ReactNode } from "react";

interface ModalWrapperProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
}

export function ModalWrapper({
  onClose,
  children,
  className = "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
  backdropClassName = "bg-gray-900/40 backdrop-blur-sm",
}: ModalWrapperProps) {
  return (
    <div
      className={`fixed inset-0 ${backdropClassName} z-50 flex items-center justify-center`}
      onClick={onClose}
    >
      <div
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
