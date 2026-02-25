const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-sky-50 to-white px-4 pb-8 pt-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl border-t-2 border-[#066C98] pt-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-sky-100 bg-white p-6 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-[#066C98] sm:text-2xl">About Us</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            FREEPARE provides high-quality exam preparation resources completely free of charge,
            helping students prepare with confidence through practical mock tests and structured
            learning.
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-500 sm:text-sm">
          Copyright {new Date().getFullYear()} FREEPARE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
