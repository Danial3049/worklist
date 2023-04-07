import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummyBlockData } from "../dymmy";
import BlockComponent from "./BlockComponent";
import {
  BlockType,
  addBlockBranch,
  addBlockLeaf,
  addBlockTopLeaf,
  getBlock,
  getBlockType,
  getTopRootBlockId,
  indentBlockNotTop,
  indentBlockTop,
  removeBlockLeaf,
  removeBlockTopLeaf,
  setBlock,
} from "./BlockUtils";

export interface Block {
  id: string;
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
    const topRootBlockIds = getTopRootBlockId(dummyBlockData);
    setBlockTopRoot(topRootBlockIds);
    setBlockData(_.keyBy(dummyBlockData, "id"));
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
    const updateBlockData = getBlock(blockId, blockData);

    if (!updateBlockData) return;

    updateBlockData.content = newContent || "";

    const newBlockData = setBlock(updateBlockData, blockData);

    setBlockData({ ...newBlockData });
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
      actionOutdent(blockId, blockRefIndex);
      setTimeout(() => {
        actionFocusMove(blockRefIndex, FocusOption.MAINTAIN);
      }, 0);
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
    const block = blockData[blockId];
    const blockType = getBlockType(block);

    switch (blockType) {
      case BlockType.Leaf:
        break;
      case BlockType.Branch:
        {
          const blockRootId = block.root || "";
          const block2StepRootId = blockData[blockRootId].root;

          console.log("blockRootId", blockRootId);
          console.log("block2StepRootId", block2StepRootId);
          if (blockRootId && block2StepRootId) {
            console.log(1);
          } else {
            console.log(2);
            // 조건을 더 상세하게 나눠보자

            if (blockTopRoot.includes(blockId)) return;

            const newBlockData = blockData;

            const newBlockRootBranch = newBlockData[blockRootId]
              .branch as string[];

            const blockOrderIndex = _.indexOf(newBlockRootBranch, blockId);
            newBlockRootBranch.splice(blockOrderIndex, 1);

            newBlockData[blockRootId].branch = undefined;
            newBlockData[blockId].root = undefined;

            newBlockData[blockId].branch =
              newBlockData[blockId].branch?.concat(newBlockRootBranch);

            setBlockData({ ...newBlockData });

            const newBlock2StepRootBranch = blockTopRoot;

            const block2StepRootOrderIndex = _.indexOf(
              newBlock2StepRootBranch,
              blockRootId
            );

            newBlock2StepRootBranch.splice(
              block2StepRootOrderIndex + 1,
              0,
              blockId
            );
            setBlockTopRoot(newBlock2StepRootBranch);

            console.log("newBlockData", newBlockData);
          }
        }
        break;
      case BlockType.TopBranch:
      case BlockType.TopLeaf:
        break;
      default:
        break;
    }
  };

  const getBlockElRefIndex = (blockRefIndex: number): HTMLDivElement | null => {
    return blockRef.current[blockRefIndex];
  };

  const actionAdd = (blockId: string, refIndex: number) => {
    const block = getBlock(blockId, blockData);
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
      const data = getBlock(blockId, blockData);
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
