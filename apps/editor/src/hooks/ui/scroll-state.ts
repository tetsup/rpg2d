import { useEffect, useState } from 'react';

export function useScrollState() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector('#list-scroll');
    if (!el) return;
    const onScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled };
}
