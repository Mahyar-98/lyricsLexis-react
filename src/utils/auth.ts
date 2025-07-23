import Session from "@/types/Session";

export const verifyToken = async (token: string): Promise<Session | null> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/verify-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.ok) {
      const session = await response.json();
      return session;
    } else {
      // Token is invalid or expired
      localStorage.removeItem("token"); // Remove invalid token from local storage
      return null;
    }
  } catch (err) {
    // Failed to verify token
    console.error("Error verifying token: ", err);
    localStorage.removeItem("token"); // Remove invalid token from local storage
    return null;
  }
};
