"use client";

import { SignupAction } from "@/store/actions/authActions";
import { AppDispatch } from "@/store/store";
import { useState, FormEvent, ChangeEvent } from "react";
import { useDispatch } from "react-redux";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<Signup>({
    username: "",
    email: "",
    password: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // console.log(formData);
    dispatch(SignupAction(formData));
  }

  return (
    <>
      <main>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Signup</button>
        </form>
      </main>
    </>
  );
}
