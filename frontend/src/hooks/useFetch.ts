"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/util/security";

export default function useFetch<T>(endpoint: string, addToken = false) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const token = getAuthToken();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/${endpoint}`, {
          headers: addToken ? { Authorization: `Bearer ${token}` } : undefined,
        });

        setData(response.data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, addToken, token, BACKEND_URL]);

  return { data, loading, error };
}
