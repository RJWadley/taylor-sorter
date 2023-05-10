export interface GenericAlbum {
  id: string;
  name: string;
  uri: string;
  image: string | undefined;
  available_markets: string[] | undefined;
}

export interface GenericTrack {
  id: string;
  name: string;
  uri: string;
  album: GenericAlbum;
  preview_url: string;
}
