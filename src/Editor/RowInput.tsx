import { useEffect, useState } from "react";
import styled from "styled-components";
import { RowData } from ".";

interface RowInputProps {
  inputRef: (el: any, refIndex: number) => any;
  rowData: RowData;
  rowKey: string;
  refIndex: number;
  depth: number;
  onChange: (changeContent: string | null) => void;
  onKeyDown: (
    rowKey: string,
    pressKey: React.KeyboardEvent<HTMLDivElement>,
    refIndex: number
  ) => void;
}
export default function RowInput({
  inputRef,
  rowData,
  onChange,
  onKeyDown,
  rowKey,
  refIndex,
  depth,
}: RowInputProps) {
  const [defaultContent, setDefaultContent] = useState<string | null>();

  useEffect(() => {
    setDefaultContent(rowData?.content);
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
          if (onKeyDown) onKeyDown(rowKey, element, refIndex);
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
