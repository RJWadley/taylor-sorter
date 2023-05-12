import { MouseEventHandler } from "react";
import styled from "styled-components";

export default function PrimaryButton({
  onClick,
  children,
  icon,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  icon: string;
}) {
  return (
    <Wrapper onClick={onClick}>
      <Icon>{icon}</Icon>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.button`
  background: #f6f6f6;
  display: flex;
  padding: 10px 15px 10px 10px;
  gap: 10px;
  border-radius: 10px;
  cursor: pointer;
`;

const Icon = styled.div`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
`;
