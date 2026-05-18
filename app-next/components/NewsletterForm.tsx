"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: POST to newsletter endpoint
      }}
    >
      <input
        type="email"
        placeholder="بريدك الإلكتروني"
        aria-label="البريد الإلكتروني"
        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-h5 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition"
      />
      <button
        type="submit"
        className="bg-white text-heading font-semibold px-4 py-2.5 rounded-lg text-h5 hover:bg-white/90 transition"
      >
        اشتراك
      </button>
    </form>
  );
}
