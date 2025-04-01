import { getAuthToken } from "@/util/security";
import axios from "axios";

const token = getAuthToken();
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const deleteCode = async (codeId: string) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/api/code/${codeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createCode = async (fileName: string, language: string) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/code/create`,
      {
        file_name: fileName,
        language: language,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);
    return response.data.code;
  } catch (error) {
    console.log(error);
  }
};

export const runCode = async (codeId: string, stdin: string) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/code/run/${codeId}`,
      { stdin: stdin },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};
