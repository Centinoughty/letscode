import axios from "axios";
import { Dispatch } from "@reduxjs/toolkit";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
} from "../reducers/authReducer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const loginAction = (userData: Login) => async (dispatch: Dispatch) => {
  dispatch(loginStart());

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      userData
    );

    dispatch(loginSuccess(response.data));
    console.log(response.data);
  } catch (error) {
    console.log(error);
    dispatch(loginFailure("Login failed"));
  }
};

export const SignupAction =
  (userData: Signup) => async (dispatch: Dispatch) => {
    dispatch(signupStart());

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/register`,
        userData
      );

      dispatch(signupSuccess(response.data));
      console.log(response.data);
    } catch (error) {
      console.log(error);
      dispatch(signupFailure("Signup failed"));
    }
  };

export const logoutAction = () => (dispatch: Dispatch) => {
  localStorage.removeItem("token");
  dispatch(logout());
};
