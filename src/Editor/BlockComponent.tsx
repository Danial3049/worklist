import { useEffect, useState } from "react";
import styled from "styled-components";
import { Block } from ".";

interface BlockComponentProps {
  refIndex: number;
  depth: number;
  block: Block;
  blockId: string;
  inputRef: (el: any, refIndex: number) => any;
  onChange: (changeContent: string | null) => void;
  onKeyDown: (
    blockId: string,
    pressKey: React.KeyboardEvent<HTMLDivElement>,
    refIndex: number
  ) => void;
}
export default function BlockComponent({
  refIndex,
  depth,
  block,
  blockId,
  inputRef,
  onChange,
  onKeyDown,
}: BlockComponentProps) {
  const [defaultContent, setDefaultContent] = useState<string | null>();

  useEffect(() => {
    setDefaultContent(block?.content);
  }, []);

  return (
    <Wapper depth={depth}>
      ●
      <Input
        ref={(el) => {
          inputRef(el, refIndex);
        }}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={(element) => {
          const targetElement = element?.currentTarget;

          if (onChange) {
            onChange(targetElement?.textContent);
          }
        }}
        onKeyDown={(element) => {
          if (onKeyDown) onKeyDown(blockId, element, refIndex);
        }}
      >
        {defaultContent}
      </Input>
    </Wapper>
  );
}

const Wapper = styled.div((props: { depth: number }) => {
  return {
    display: "flex",
    marginBottom: "10px",
    paddingLeft: `calc(20px * ${props?.depth})`,
  };
});

const Input = styled.div((_) => {
  return {
    wordWrap: "break-word",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    maxWidth: "100%",
    marginLeft: "5px",
    minWidth: "200px",
  };
});
