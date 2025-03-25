"use client";

import { ReactNode, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { AppDispatch, store } from "@/store/store";
import { fetchUser } from "@/store/actions/authActions";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <UserFetch />
      {children}
    </Provider>
  );
}

function UserFetch() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return null;
}
