import { MouseEventHandler } from "react";
import styled from "styled-components";
import { useImageHSL } from "utils/averageImageColor";
import { GenericTrack } from "utils/music/types";

export default function SongCard({
  track,
  onClick,
}: {
  track: GenericTrack;
  onClick?: MouseEventHandler;
}) {
  const [hue, saturation] = useImageHSL(track.album.image);

  if (hue === undefined) return <>No hue found</>;
  if (saturation === undefined) return <>No saturation found</>;
  return (
    <Wrapper
      lightAccent={`hsl(${hue}, ${saturation}%, 85%)`}
      darkAccent={`hsl(${hue}, ${saturation}%, 15%)`}
      onClick={onClick}
    >
      <Image src={track.album.image} alt={track.album.name + " album cover"} />
      <Title>{track.name}</Title>
      <div>
        <Album>{track.album.name}</Album>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.button<{
  lightAccent: string;
  darkAccent: string;
}>`
  background-color: ${({ lightAccent }) => lightAccent};
  border: 8px solid ${({ darkAccent }) => darkAccent};
  border-radius: 20px;
  padding: 5px;
  width: fit-content;
  cursor: pointer;
`;

const Image = styled.img`
  width: 265px;
  height: 265px;
  border-radius: 7px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-top: 10px;
  width: 265px;

  /* clamp to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3.6em;
`;

const Album = styled.p`
  margin-top: 4px;
  width: 265px;

  /* 1 line */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
