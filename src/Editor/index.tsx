import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummyBlockData, dummyBlockTopRoot } from "../dymmy";
import BlockComponent from "./BlockComponent";
import {
  BlockType,
  addBlockBranch,
  addBlockLeaf,
  addBlockTopLeaf,
  getBlockType,
  indentBlockNotTop,
  indentBlockTop,
  removeBlockLeaf,
  removeBlockTopLeaf,
} from "./BlockUtils";

export interface Block {
  content?: string;
  branch?: string[];
  root?: string;
}

enum FocusOption {
  UP = -1,
  MAINTAIN = 0,
  DOWN = 1,
}

export default function Editor() {
  const [blockTopRoot, setBlockTopRoot] = useState<string[]>([]);
  const [blockData, setBlockData] = useState<{ [id: string]: Block }>({});

  const blockRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setBlockTopRoot(dummyBlockTopRoot);
    setBlockData(dummyBlockData);
  }, []);

  // TODO: Debug 용도
  useEffect(() => {
    if (blockTopRoot.length <= 0) return;
    console.log("blockTopRoot", blockTopRoot);
  }, [blockTopRoot]);

  // TODO: Debug 용도
  useEffect(() => {
    if (Object.keys(blockData).length <= 0) return;
    console.log("blockData", blockData);
  }, [blockData]);

  const updateBlockContent = (blockId: string, newContent: string | null) => {
    const updateBlockData = blockData[blockId];

    if (!updateBlockData) return;

    updateBlockData.content = newContent || "";

    setBlockData((prev) => ({
      ...prev,
      [blockId]: updateBlockData,
    }));
  };

  const handleKeyPress = (
    blockId: string,
    blockElement: React.KeyboardEvent<HTMLDivElement>,
    blockRefIndex: number
  ) => {
    //TODO: Debug 용도
    console.log("Press key = ", blockElement.key);

    if (blockElement.key === "Enter" && blockElement.shiftKey !== true) {
      blockElement.preventDefault();
      actionAdd(blockId, blockRefIndex);
    }

    if (blockElement.key === "Tab" && blockElement.shiftKey === true) {
      blockElement.preventDefault();
    }

    if (blockElement.key === "Tab" && blockElement.shiftKey !== true) {
      blockElement.preventDefault();
      actionIndent(blockId, blockRefIndex);
    }

    if (blockElement.key === "ArrowDown") {
      blockElement.preventDefault();
      actionFocusMove(blockRefIndex, FocusOption.DOWN);
    }

    if (blockElement.key === "ArrowUp") {
      blockElement.preventDefault();
      actionFocusMove(blockRefIndex, FocusOption.UP);
    }

    if (blockElement.key === "Backspace") {
      const blockContent = getBlockElRefIndex(blockRefIndex)?.textContent;

      if (blockContent != null && blockContent?.length <= 0) {
        blockElement.preventDefault();

        const blockType = getBlockType(blockData[blockId]);

        // topLeaf 인데 root가 하나 일 때는 삭제 하지 않음.
        if (blockType === BlockType.TopLeaf && blockTopRoot.length <= 1) return;

        if (
          blockType !== BlockType.Branch &&
          blockType !== BlockType.TopBranch
        ) {
          const blockIndex = _.indexOf(blockTopRoot, blockId);

          if (blockIndex === 0) {
            actionFocusMove(blockRefIndex, FocusOption.DOWN);
          } else {
            actionFocusMove(blockRefIndex, FocusOption.UP);
          }

          actionRemove(blockId);
        }
      }
    }
  };

  const actionIndent = (blockId: string, refIndex: number) => {
    const block = blockData[blockId];
    const blockType = getBlockType(block);

    switch (blockType) {
      case BlockType.TopBranch:
      case BlockType.TopLeaf:
        {
          const indetBlockTopResult = indentBlockTop(
            blockId,
            blockData,
            blockTopRoot
          );

          if (!indetBlockTopResult) return;

          const { newBlockData, newBlockTopRoot } = indetBlockTopResult;

          setBlockTopRoot(newBlockTopRoot);
          setBlockData({ ...newBlockData });
        }
        break;
      case BlockType.Branch:
      case BlockType.Leaf:
        {
          const newBlockData = indentBlockNotTop(blockId, blockData);

          if (!newBlockData) return;

          setBlockData({ ...newBlockData });
        }
        break;
      default:
        break;
    }

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.MAINTAIN);
    }, 0);
  };

  const actionOutdent = (blockId: string, refIndex: number) => {
    // 현재 아이템 lodash findkey 검토

    const block = blockData[blockId];

    const blockRootId = block?.root;

    if (blockRootId) {
    }
    //parent를 부모의 parent로 변경
  };

  const getBlockElRefIndex = (blockRefIndex: number): HTMLDivElement | null => {
    return blockRef.current[blockRefIndex];
  };

  const actionAdd = (blockId: string, refIndex: number) => {
    const block = blockData[blockId];
    const blockType = getBlockType(block);

    switch (blockType) {
      case BlockType.TopLeaf:
        {
          const { newBlockData, newBlockTopRoot } = addBlockTopLeaf(
            blockId,
            blockData,
            blockTopRoot
          );

          setBlockTopRoot(newBlockTopRoot);
          setBlockData({ ...newBlockData });
        }
        break;
      case BlockType.Leaf:
        {
          const newBlockData = addBlockLeaf(blockId, blockData);
          setBlockData({ ...newBlockData });
        }
        break;
      case BlockType.TopBranch:
      case BlockType.Branch:
        {
          const newBlockData = addBlockBranch(blockId, blockData);
          setBlockData({ ...newBlockData });
        }
        break;
      default:
        break;
    }

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.DOWN);
    }, 0);
  };

  const actionRemove = (blockId: string) => {
    console.log("actionRemove");

    const block = blockData[blockId];
    const blockType = getBlockType(block);

    switch (blockType) {
      case BlockType.TopLeaf:
        {
          const { newBlockData, newBlockTopRoot } = removeBlockTopLeaf(
            blockId,
            blockData,
            blockTopRoot
          );

          setBlockTopRoot(newBlockTopRoot);
          setBlockData({ ...newBlockData });
        }
        break;
      case BlockType.Leaf:
        {
          const newBlockData = removeBlockLeaf(blockId, blockData);

          setBlockData({ ...newBlockData });
        }

        break;
      case BlockType.TopBranch:
      case BlockType.Branch:
      default:
        break;
    }
  };

  const actionFocusMove = (blockRefIndex: number, focusOption: FocusOption) => {
    const beMovedBlockRef = blockRef.current[blockRefIndex + focusOption];

    setTimeout(() => {
      beMovedBlockRef?.focus();
      if (beMovedBlockRef != null) {
        window.getSelection()?.selectAllChildren(beMovedBlockRef);
        window.getSelection()?.collapseToEnd();
      }
    }, 0);
  };

  let rowCount = -1;
  const renderRowList = (
    blockTopRoot: string[] | undefined,
    depth: number = 0
  ): any => {
    return blockTopRoot?.map((blockId) => {
      const data = blockData[blockId];
      rowCount++;
      return (
        <Fragment key={blockId}>
          <BlockComponent
            block={data}
            depth={depth}
            blockId={blockId}
            refIndex={rowCount}
            inputRef={(el, refIndex) => {
              blockRef.current[refIndex] = el;
            }}
            onChange={(content) => {
              updateBlockContent(blockId, content);
            }}
            onKeyDown={(blockId, element, refIndex) => {
              handleKeyPress(blockId, element, refIndex);
            }}
          />
          {renderRowList(data?.branch, depth + 1)}
        </Fragment>
      );
    });
  };

  return <>{renderRowList(blockTopRoot)}</>;
}
