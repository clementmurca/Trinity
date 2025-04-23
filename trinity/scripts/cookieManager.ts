// cookieManager.ts
import CookieManager, { Cookies } from "@react-native-cookies/cookies";

export const getCookies = async (domain: string): Promise<string> => {
  // Returns a single string like "sessionId=abc123; token=xyz456"
  const cookiesObject = await CookieManager.get(domain);
  const cookieString = Object.entries(cookiesObject)
    .map(([key, { value }]) => `${key}=${value}`)
    .join("; ");
  return cookieString;
};

export const setCookiesFromHeader = async (domain: string, cookieHeader: string) => {
  // If the server sends multiple cookies, they might be split by commas or semicolons
  // react-native-cookies can parse them if you pass the whole string
  try {
    await CookieManager.setFromResponse(domain, cookieHeader);
  } catch (err) {
    console.log("Failed to store cookies:", err);
  }
};


export const clearCookies = async () => {
    try {
      await CookieManager.clearAll();
      console.log("All cookies cleared!");
    } catch (err) {
      console.error("Error clearing cookies:", err);
    }
  };