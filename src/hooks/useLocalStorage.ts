import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to track whether the component has mounted to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Initialize state with initialValue to guarantee identical server/client render during SSR
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate state from localStorage only after the component mounts on the client
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          // Hydrate from local storage but ensure functions aren't parsed incorrectly
          setStoredValue(JSON.parse(item));
        } else {
          // Apply initial value to storage if it didn't exist
          window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
      } catch (error) {
        console.error("Error reading localStorage key “" + key + "”:", error);
      }
    }, 0);
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event to sync other components utilizing the same key across tabs
        window.dispatchEvent(new Event("local-storage"));
      }
    } catch (error) {
      console.error("Error setting localStorage key “" + key + "”:", error);
    }
  };

  // Prevent returning localized data during SSR.
  // During SSR, always return the initial state.
  return [isMounted ? storedValue : initialValue, setValue];
}
