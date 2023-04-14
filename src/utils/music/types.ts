export type GenericAlbum = {
  id: string;
  name: string;
  uri: string;
  image: string;
  available_markets: string[] | undefined;
};

export type GenericTrack = {
  id: string;
  name: string;
  uri: string;
  album: GenericAlbum;
  preview_url: string;
}