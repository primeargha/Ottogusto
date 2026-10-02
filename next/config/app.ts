const AUTH_0 = {
  LOGIN_WITH_POPUP: false,
  // DOMAIN: "auth.ottogusto.com",
  DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  // CLIENT_ID: "mkRtRuzW3aiy9oPskxATGFId5vzCIxsG",
  CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  // REDIRECT_URI: "https://dev.ottogusto.com",
  // REDIRECT_URI: "https://ottogusto.com",
  REDIRECT_URI: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
  CALLBACK: "/auth/auth0/callback",
};

// domain : auth.qverde.com
// ClientId : Sa5XPpDC8G0VLY2uQtOJwyx5mT8di6lj
// ClientSecret : Mfz1908Rlzz5maiWtkN3pdOtAiO4atZN34lLP2tTw48KZc6I2AYXNhc-K6gG8AT5

// const X_API_KEY = "";
const X_API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;
const FORCE_iPAD = false; // iPad pro and iPad Air-- for Chrome Developer Tools
const FILE_UPLOAD_URL = "https://cdn.ottogusto.group";
export { AUTH_0, FORCE_iPAD, X_API_KEY, FILE_UPLOAD_URL };
