import { type ReactNode, useEffect } from 'react';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export default function Modal({ isOpen, title, children, footer, onClose }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-11/12 max-w-md mx-4 border"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="px-4 py-2">
            <h2 className="text-lg font-medium">{title}</h2>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
