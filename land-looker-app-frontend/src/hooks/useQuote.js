// src/hooks/useQuote.js
import { useState, useEffect } from "react";

const useQuote = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        // DummyJSON docs indicate there are 150 quotes available.
        const randomIndex = Math.floor(Math.random() * 150);
        const response = await fetch(
          `https://dummyjson.com/quotes?limit=1&skip=${randomIndex}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }
        const data = await response.json();
        // data.quotes should be an array with one quote object
        if (data && data.quotes && data.quotes.length > 0) {
          setQuote(data.quotes[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return { quote, loading, error };
};

export default useQuote;
