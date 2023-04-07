import React, { createContext, useState } from "react";
import { SpotifyWebApi } from "spotify-web-api-ts";

//TODO - handle token expiration
//TODO - login in popup and save to localStorage instead of URL

export const SpotifyContext = createContext<{
  isInitialized: boolean;
  spotify?: SpotifyWebApi;
  initializeApi: () => void;
  expiresAt?: number;
}>({
  isInitialized: false,
  spotify: undefined,
  initializeApi: () => {},
});

type Props = {
  children: React.ReactNode;
};

const SpotifyProvider: React.FC<Props> = ({ children }) => {
  const [spotify, setSpotify] = useState<SpotifyWebApi>(new SpotifyWebApi());
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeApi = () => {
    // get token from url
    const hash = window.location.hash.substring(1);
    const token = hash.split("&")[0].split("=")[1];

    if (token) {
      setSpotify(new SpotifyWebApi({ accessToken: token }));
      setIsInitialized(true);
    } else {
      const url = getLoginURL([
        "playlist-read-collaborative",
        "playlist-read-private",
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-library-read",
        "user-library-modify",
        "user-read-playback-state",
        "user-modify-playback-state",
      ]);

      //navigate to x login page
      window.location.href = url;
    }
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

  return (
    <SpotifyContext.Provider
      value={{
        isInitialized,
        spotify: spotify,
        initializeApi,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export default SpotifyProvider;
