import { useCallback, useMemo, useRef } from "react";

// Hook pour le debouncing
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

// Hook pour la mémorisation des calculs coûteux
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  dependencies: unknown[]
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => calculation(), [...dependencies]);
};

// Hook pour l'intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(
    (element: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (element) {
        observerRef.current = new IntersectionObserver(callback, options);
        observerRef.current.observe(element);
      }
    },
    [callback, options]
  );

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return { observe, disconnect };
};

// Hook pour la gestion du cache local
export const useLocalCache = <T>(key: string, defaultValue: T) => {
  const getCachedValue = useCallback((): T => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const setCachedValue = useCallback(
    (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn("Failed to cache value:", error);
      }
    },
    [key]
  );

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }, [key]);

  return {
    getValue: getCachedValue,
    setValue: setCachedValue,
    clear: clearCache,
  };
};

// Hook pour la gestion des performances
export const usePerformanceMonitor = () => {
  const startTime = useRef<number>(0);

  const startMeasurement = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endMeasurement = useCallback((label: string) => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, []);

  return { startMeasurement, endMeasurement };
};
