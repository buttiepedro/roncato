import { useEffect, useState } from 'react';

const LOGO_URL = 'https://bitautomatizacion.com.ar/wp-content/uploads/2025/12/cropped-Copy-of-LOGOPNG.png';

export default function FullScreenLoader({ onFinish }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const holdTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 900);

    const exitTimer = window.setTimeout(() => {
      onFinish?.();
    }, 1500);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-999 flex items-center justify-center bg-slate-950 transform-gpu transition-transform duration-700 ease-in-out ${
        isLeaving ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    >
      <div className="animate-pulse">
        <img
          src={LOGO_URL}
          alt="BIT"
          className={`h-20 w-auto transition-all duration-500 md:h-24 ${
            isLeaving ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          }`}
        />
      </div>
    </div>
  );
}
