import { useInView } from 'react-intersection-observer';

/**
 * Wrapper around react-intersection-observer for scroll reveal.
 * Returns ref and inView boolean. Triggers once by default.
 */
export function useScrollReveal(threshold = 0.15, triggerOnce = true) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  });

  return { ref, inView };
}
