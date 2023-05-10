import { AuthorizationScope } from "spotify-web-api-ts/types/types/SpotifyAuthorization";

const CLIENT_ID = "e1ae80fdbcc7444897cf07aa83dfa052";
const REDIRECT_URI = window.location.origin;
const SPOTIFY_SCOPES: AuthorizationScope[] = [
  "streaming",
  "user-read-email",
  "user-read-private",
];

/**
 * generate a random string for the code verifier
 * @returns a random string
 */
function generateRandomString() {
  const length = 128;
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * hash the code verifier and encode it in base64
 * @param codeVerifier the code verifier
 * @returns the code challenge
 */
async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  // this is what spotify recommends
  // eslint-disable-next-line scanjs-rules/property_crypto
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}

/**
 * encode a buffer in base64
 * @param buffer the buffer to encode
 * @returns the encoded string
 */
function base64encode(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCodePoint(bytes[i] ?? 0);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * direct the user to the spotify login page so they can grant permissions
 */
export const grantSpotifyPermissions = async () => {
  const codeVerifier = generateRandomString();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem("codeVerifier", codeVerifier);

  const scope = SPOTIFY_SCOPES.join(" ");

  const args = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const url = `https://accounts.spotify.com/authorize?${args.toString()}`;

  window.location.replace(url);
};

/**
 * use a previously obtained refresh token to get a new access token
 * @param refreshToken the refresh token
 * @returns the new access token
 */
export const authSpotifyWithRefreshToken = async (
  refreshToken: string | null
) => {
  if (!refreshToken) return;
  console.log("refreshing token");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      return res.json();
    })
    .then((data: SpotifyResponse) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  if (!response) return;
  localStorage.setItem("refresh_id", response.refresh_token);
  return response.access_token;
};

/**
 * use the code and code verifier to get an access token
 * if we don't have a refresh token
 * @param code the code provided by spotify
 * @param codeVerifier the code verifier we generated
 * @returns the new access token
 */
export const authWithCode = async (code: string, codeVerifier: string) => {
  console.log("authorizing with code");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  // get a token from spotify
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      return res.json();
    })
    .then((data: SpotifyResponse) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  if (!response) return;
  localStorage.setItem("refresh_id", response.refresh_token);
  return response.access_token;
};

interface SpotifyResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}
