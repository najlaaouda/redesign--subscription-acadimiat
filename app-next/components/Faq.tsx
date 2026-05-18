import { FAQ } from "@/lib/faq";

/**
 * FAQ section — dark background, native <details> for zero-JS toggle.
 * Emits FAQPage JSON-LD schema so Google can render rich FAQ snippets
 * directly in search results (massive SEO win for visibility).
 */
function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answerText },
    })),
  };
}

const Chevron = () => (
  <svg
    className="faq-chev w-5 h-5 text-white/60 flex-shrink-0 transition-transform"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function Faq() {
  return (
    <section className="bg-heading text-white py-16 lg:py-20" id="faq">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[28px] sm:text-[36px] font-bold mb-12 tracking-tight">
          الأســـــــئلة الشــــــائعة
        </h2>

        <div id="faq-list">
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="faq-item-dark border-b border-white/10"
            >
              <summary className="flex items-center justify-between py-5 cursor-pointer list-none gap-4">
                <span className="text-h4 font-medium">{item.question}</span>
                <Chevron />
              </summary>
              <div className="pb-5 text-h5 text-white/70 leading-relaxed">
                {item.answerRich ? (
                  item.answerRich.map((b, i) => {
                    if (b.type === "p") return <p key={i}>{b.text}</p>;
                    if (b.type === "subheading")
                      return (
                        <p
                          key={i}
                          className="mt-3 mb-1 font-medium text-white/85"
                        >
                          {b.text}
                        </p>
                      );
                    return (
                      <ul
                        key={i}
                        className="list-disc ps-5 mt-2 space-y-1"
                      >
                        {b.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    );
                  })
                ) : (
                  <p>{item.answerText}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
