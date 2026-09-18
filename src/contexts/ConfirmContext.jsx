import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const resolver = useRef(null);

  const confirm = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
    setProcessing(false);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setProcessing(true);
    if (resolver.current) resolver.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver.current) resolver.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleCancel}></div>
          <div className="relative bg-[#fff8f0] border border-[#c0c9c1] shadow-2xl rounded-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100 m-4">
            <h3 className="text-xl font-bold font-serif text-[#033621] mb-2">Confirmation Required</h3>
            <p className="text-[#414943] text-sm mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={processing}
                className="px-4 py-2 rounded-lg font-medium text-sm text-[#414943] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-[#033621] text-white shadow-sm hover:bg-[#1f4d36] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
