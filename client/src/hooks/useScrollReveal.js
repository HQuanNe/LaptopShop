import { useEffect, useRef } from 'react';

export function useScrollReveal(options = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, options);

    const current = containerRef.current;
    if (current) {
      const observeItems = () => {
        const items = current.querySelectorAll('.reveal-item');
        items.forEach((item) => observer.observe(item));
      };

      observeItems();

      // Quan sát DOM thay đổi khi dữ liệu sản phẩm từ API nạp vào
      const mutationObserver = new MutationObserver(() => {
        observeItems();
      });

      mutationObserver.observe(current, { childList: true, subtree: true });

      return () => {
        mutationObserver.disconnect();
        observer.disconnect();
      };
    }
  }, []);

  return containerRef;
}

