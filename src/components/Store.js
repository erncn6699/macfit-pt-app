export default function Store({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section id="magaza" className="bg-white py-20 px-5">
      <div className="max-w-[1140px] mx-auto">
        <div className="text-center mb-12">
          <span className="font-semibold text-[11.5px] tracking-[.11em] uppercase text-[var(--primary-dark)]">Dijital Ürünler</span>
          <h2 className="mt-2 text-3xl font-bold">Özel Rehber & E-Kitaplar</h2>
          <p className="mt-3 text-[var(--ink-soft)] max-w-2xl mx-auto">
            Hemen indirip uygulayabileceğiniz, kanıtlanmış sistemlere dayalı dijital antrenman programları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {products.map((product) => (
            <div key={product.id} className="border border-[var(--line)] rounded-2xl p-8 hover:shadow-lg transition-shadow bg-[var(--surface)]">
              <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center mb-6 text-[var(--primary-dark)]">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{product.title}</h3>
              <p className="text-[var(--ink-soft)] mb-6 min-h-[48px]">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-black text-[var(--primary)]">{product.price}</span>
                <a 
                  href={product.paymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[var(--dark)] text-white px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Satın Al
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
