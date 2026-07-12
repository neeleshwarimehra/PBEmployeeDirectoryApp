import api from "./axios";
import { getToken } from "../utils/storage";
// =========================
// SEND OTP
// =========================

const jwtToken = async () => {
  return await getToken();
};
console.log("Fetching JWT token...", jwtToken);
export const sendOtpApi = async (email: string) => {
  const response = await api.post("/auth/getotp", {
    email,
  });

  return response.data;
};
// =========================
// VERIFY OTP
// =========================
export const verifyOtpApi = async (email: string, otp: string) => {
  const response = await api.post("/auth/verifyotp", {
    email,
    otp,
  });

  return response.data;
};

// =========================
// EMPLOYEE LIST WORKING FINE
// =========================

export const getEmployeesApi = async (
  token: string,
  query: string,
  designationId?: number,
  stnId?: number,
) => {
  const response = await api.post(
    "/employees",
    {
      query,
      designationId,
      stnId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
