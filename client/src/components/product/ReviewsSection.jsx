import { useCallback, useEffect, useState } from 'react';
import { Star, Loader, MessageSquarePlus } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const StarRow = ({ value, onSelect }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onSelect?.(star)}
        disabled={!onSelect}
        aria-label={`${star} star${star === 1 ? '' : 's'}`}
        className={onSelect ? 'cursor-pointer transition hover:scale-110' : 'cursor-default'}
      >
        <Star
          className={`h-5 w-5 ${
            star <= value ? 'fill-amber-400 text-amber-400' : 'text-beige'
          }`}
        />
      </button>
    ))}
  </div>
);

const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/reviews?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Could not load reviews');
      setReviews(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }, [productId]);

  useEffect(() => {
    setReviews(null);
    setError(null);
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    const trimmedComment = comment.trim();
    if (!name.trim()) {
      setFormError('Enter your name first.');
      return;
    }
    if (!rating) {
      setFormError('Give a rating first (1–5 stars).');
      return;
    }
    if (!trimmedComment) {
      setFormError('Madali lang — anong masasabi mo sa product? (add a comment)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName: name.trim(),
          rating,
          comment: trimmedComment,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not submit review');
      setName('');
      setRating(0);
      setComment('');
      setFormSuccess('Salamat! Nai-publish ang review mo. ✓');
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const average = reviews?.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Customer reviews</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {reviews?.length > 0 && (
              <>
                <StarRow value={Math.round(average)} />
                <span className="font-semibold text-charcoal">{average}</span>
                <span>· {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">{error}</p>}

      {!reviews && !error && (
        <div className="mt-6 flex items-center gap-3 text-muted">
          <Loader className="h-5 w-5 animate-spin" /> Loading reviews…
        </div>
      )}

      {reviews && (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Review list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-beige bg-white px-6 py-12 text-center text-muted">
                Wala pang reviews — maging unang mag-rate ng produktong ito!
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-3xl border border-beige bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{review.customer_name}</p>
                      <p className="text-xs text-muted">
                        {new Date(review.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <StarRow value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-6 text-charcoal">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Write-a-review form */}
          <div className="h-fit rounded-3xl border border-beige bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-charcoal">
              <MessageSquarePlus className="h-5 w-5 text-primary" /> Write a review
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Rating</label>
                <StarRow value={rating} onSelect={setRating} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  placeholder="Ano ang masasabi mo sa produktong ito?"
                  className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              {formSuccess && <p className="text-sm font-semibold text-primary">{formSuccess}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95 disabled:opacity-50"
              >
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                Submit review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;