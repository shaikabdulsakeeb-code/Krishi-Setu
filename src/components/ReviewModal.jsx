import { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, onSubmit, farmerName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    setSubmitting(true);
    await onSubmit({ rating, review });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative ledger-card rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          aria-label="Close review dialog"
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--cream)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-serif text-[var(--cream)]">Rate Your Experience</h2>
          <p className="text-[var(--muted)] text-sm mt-1">How was your deal with {farmerName}?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-[#febe51] text-[#febe51]' 
                      : 'text-gray-300'
                  } transition-colors duration-150`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--cream)] mb-2">
              Write a review (Optional)
            </label>
            <textarea
              rows="4"
              className="form-input w-full rounded-xl px-4 py-3 text-sm resize-none"
              placeholder="Tell others about the quality of the crop and the delivery..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full btn-primary py-3 text-base rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review & Complete Deal'}
          </button>
        </form>
      </div>
    </div>
  );
}
