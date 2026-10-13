import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AgePrivacyPopup({
  isOpen,
  onAccept,
}: {
  isOpen: boolean;
  onAccept: () => void;
}) {
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAccept = () => {
    if (acceptedAge && acceptedPrivacy) {
      localStorage.setItem('mocha_mogra_policy_accepted', 'true');
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-mocha-900/80 backdrop-blur-sm" />
      <div className="relative bg-[#FFFEF7] max-w-lg w-full p-8 shadow-2xl border border-mocha-200">
        <h2 className="font-cinzel text-xl text-mocha-900 mb-6 text-center tracking-widest uppercase">
          Welcome to Mocha & Mogra
        </h2>

        <div className="space-y-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-mocha-800"
              checked={acceptedAge}
              onChange={(e) => setAcceptedAge(e.target.checked)}
            />
            <span className="font-lora text-mocha-700 text-sm leading-relaxed group-hover:text-mocha-900 transition-colors">
              I confirm that I am 18 years of age or older.
            </span>
          </label>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-mocha-800"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              />
              <span className="font-lora text-mocha-700 text-sm leading-relaxed group-hover:text-mocha-900 transition-colors">
                I have read and accept the <button type="button" onClick={(e) => { e.preventDefault(); setShowPolicy(!showPolicy); }} className="underline font-medium hover:text-gold-600 transition-colors">Privacy Policy</button>.
              </span>
            </label>

            {showPolicy && (
              <div className="bg-mocha-50 p-4 text-xs font-lora text-mocha-600 h-32 overflow-y-auto border border-mocha-200 custom-scrollbar">
                <p className="mb-2"><strong>Privacy Policy Summary</strong></p>
                <p>We respect your privacy and are committed to protecting your personal data. We collect information necessary to process your orders, improve your shopping experience, and communicate with you.</p>
                <p className="mt-2">Your data is securely stored and never sold to third parties. For full details, please visit our <Link to="/privacy" target="_blank" className="underline hover:text-gold-600">Privacy Policy page</Link>.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAccept}
            disabled={!acceptedAge || !acceptedPrivacy}
            className="w-full btn-primary-filled py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enter Site
          </button>
        </div>
      </div>
    </div>
  );
}
