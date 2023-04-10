import React, { createContext, useEffect, useState } from "react";
import { SpotifyWebApi } from "spotify-web-api-ts";

//TODO - login in popup and save to localStorage instead of URL

export const SpotifyContext = createContext<{
  /**
   * The Spotify access token
   */
  token?: string;
  /**
   * the spotify API instance
   */
  spotify?: SpotifyWebApi;
  /**
   * function to initialize the spotify API
   */
  initializeApi: () => void;
  /**
   * if the spotify API is initialized
   */
  isInitialized: boolean;
  /**
   * if the user is premium
   */
  isPremium: boolean;
}>({
  initializeApi: () => {},
  isInitialized: false,
  isPremium: false,
});

type Props = {
  children: React.ReactNode;
};

const CLIENT_ID = "e1ae80fdbcc7444897cf07aa83dfa052";
const REDIRECT_URI = window.location.origin;
function getLoginURL(scopes: string[]) {
  return (
    "https://accounts.spotify.com/authorize?client_id=" +
    CLIENT_ID +
    "&redirect_uri=" +
    encodeURIComponent(REDIRECT_URI) +
    "&scope=" +
    encodeURIComponent(scopes.join(" ")) +
    "&response_type=token"
  );
}

function generateRandomString(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const SpotifyProvider = ({ children }: Props) => {
  const [spotify, setSpotify] = useState<SpotifyWebApi>(new SpotifyWebApi());
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [expiration, setExpiration] = useState<number | undefined>(undefined);

  // combine the above function with two branches into one function with a single path.
  // open a popup separately, and wait for that windows URL to contain the token
  // then save the token from there and close the popup
  const initializeApi = () => {
    return new Promise<void>((resolve, reject) => {
      const url = getLoginURL([
        "streaming",
        "user-read-email",
        "user-read-private",
      ]);

      // open popup
      const popup = window.open(
        url,
        "Login with Spotify",
        "width=800,height=600"
      );

      // check the popup URL every 100ms
      // if the host matches, check for the token
      // if the token exists, save it and close the popup
      const check = setInterval(() => {
        if (!popup || popup.closed) {
          reject();
          clearInterval(check);
        } else if (popup.location.host === window.location.host) {
          const hash = popup.location.hash.substring(1);
          popup.close();
          const params = new URLSearchParams(hash);
          const token = params.get("access_token");
          const expiresIn = params.get("expires_in");

          if (token) {
            const newAPI = new SpotifyWebApi({ accessToken: token });
            setSpotify(newAPI);
            setToken(token);
            setIsInitialized(true);

            // set expiration
            if (expiresIn) {
              const expiration =
                Date.now() + parseInt(expiresIn) * 1000 - 5_000;
              setExpiration(expiration);
            }

            // detect if the user is premium
            newAPI.users
              .getMe()
              .then((user) => {
                if (user.product === "premium") setIsPremium(true);
                resolve();
              })
              .catch(reject);
          }
          clearInterval(check);
        }
      }, 10);
    });
  };

  /**
   * check if the token is expired
   */
  useEffect(() => {
    const check = setInterval(() => {
      if (expiration && expiration < Date.now()) {
        setToken(undefined);
        setExpiration(undefined);
        setIsInitialized(false);
      }
    }, 1000);

    return () => clearInterval(check);
  }, [expiration]);

  return (
    <SpotifyContext.Provider
      value={{
        initializeApi,
        spotify,
        token,
        isInitialized,
        isPremium,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export default SpotifyProvider;
