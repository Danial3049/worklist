import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummyBlockData } from "../dymmy";
import BlockComponent from "./BlockComponent";
import {
  BlockType,
  createBlock,
  getBlock,
  getBlockType,
  getPrevBlock,
  getRootBlock,
  getTopRootBlockId,
  insertBlockAtBranch,
  removeBlock,
  removeBlockAtBranch,
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
    const topRootBlockIds = getTopRootBlockId(dummyBlockData) || [];

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

    if (blockData && blockData["root"] && blockData["root"].branch) {
      const rootBranch = blockData["root"].branch;
      setBlockTopRoot(rootBranch);
    }
    console.log("blockData", blockData);
  }, [blockData]);

  const updateBlockContent = (blockId: string, newContent: string | null) => {
    const updateBlockData = getBlock(blockId, blockData);

    if (!updateBlockData) return;

    updateBlockData.content = newContent || "";

    const newBlockData = blockData;
    newBlockData[updateBlockData.id] = updateBlockData;

    setBlockData({ ...newBlockData });
  };

  const handleKeyPress = (
    blockId: string,
    blockElement: React.KeyboardEvent<HTMLDivElement>,
    blockRefIndex: number
  ) => {
    //TODO: Debug 용도
    console.log("Press key = ", blockElement.key);

    if (blockElement.key === "ArrowDown") {
      blockElement.preventDefault();
      actionFocusMove(blockRefIndex, FocusOption.DOWN);
    }

    if (blockElement.key === "ArrowUp") {
      blockElement.preventDefault();
      actionFocusMove(blockRefIndex, FocusOption.UP);
    }

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

    if (blockElement.key === "Backspace") {
      const blockContent = getBlockElRefIndex(blockRefIndex)?.textContent;

      if (blockContent != null && blockContent?.length <= 0) {
        blockElement.preventDefault();

        const blockType = getBlockType(blockId, blockData);

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
    const rootBlock = getRootBlock(blockId, blockData);
    const rootBlockBranch = rootBlock?.branch;
    const prevBlock = getPrevBlock(blockId, blockData);
    const prevBlockBranch = prevBlock?.branch;

    const block = getBlock(blockId, blockData);

    if (!prevBlock) return;

    const newPrevBlockBranch = insertBlockAtBranch(
      blockId,
      prevBlockBranch,
      "last"
    );

    if (!rootBlockBranch) return;

    const newRootBlockBranch = removeBlockAtBranch(blockId, rootBlockBranch);

    const newBlockData = blockData;

    newBlockData[prevBlock.id].branch = newPrevBlockBranch;
    newBlockData[rootBlock.id].branch = newRootBlockBranch;
    newBlockData[block.id].root = prevBlock.id;

    setBlockData({ ...newBlockData });

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.MAINTAIN);
    }, 0);
  };

  const actionOutdent = (blockId: string, refIndex: number) => {
    const rootBlock = getRootBlock(blockId, blockData);
    const block = getBlock(blockId, blockData);

    if (!rootBlock) return;

    const twoStepRootBlock = getRootBlock(rootBlock?.id, blockData);
    if (!twoStepRootBlock) return;

    const twoStepRootBlockBranch = twoStepRootBlock?.branch;
    const newTwoStepRootBlockBranch = insertBlockAtBranch(
      blockId,
      twoStepRootBlockBranch,
      "next",
      rootBlock.id
    );

    const rootBlockBranch = rootBlock.branch;
    if (!rootBlockBranch) return;

    const blockIndex = rootBlockBranch.indexOf(blockId);
    let newBlockBranch = rootBlockBranch.splice(
      blockIndex + 1,
      rootBlockBranch.length - (blockIndex + 1)
    );

    const newRootBlockBranch = removeBlockAtBranch(blockId, rootBlockBranch);

    const newBlockData = blockData;
    newBlockData[twoStepRootBlock.id].branch = newTwoStepRootBlockBranch;
    newBlockData[rootBlock.id].branch = newRootBlockBranch;
    newBlockData[blockId].root = twoStepRootBlock?.id;

    if (block.branch) {
      newBlockBranch.unshift(...block.branch);
    }
    newBlockBranch.map((nblockId) => {
      newBlockData[nblockId].root = blockId;
    });

    newBlockData[blockId].branch = newBlockBranch;

    setBlockData({ ...newBlockData });
  };

  const getBlockElRefIndex = (blockRefIndex: number): HTMLDivElement | null => {
    return blockRef.current[blockRefIndex];
  };

  const actionAdd = (blockId: string, refIndex: number) => {
    const blockType = getBlockType(blockId, blockData);
    const newBlock = createBlock();
    const newBlockData = blockData;
    let newBranch;

    if (blockType === BlockType.Leaf || blockType === BlockType.TopLeaf) {
      const rootBlock = getRootBlock(blockId, blockData);
      const rootBlockBranch = rootBlock?.branch;

      if (!rootBlockBranch) return;

      newBranch = insertBlockAtBranch(
        newBlock.id,
        rootBlockBranch,
        "next",
        blockId
      );

      newBlock.root = rootBlock.id;
    } else {
      const block = getBlock(blockId, blockData);
      const blockBranch = block.branch;

      if (!blockBranch) return;

      newBranch = insertBlockAtBranch(newBlock.id, blockBranch, "first");

      newBlock.root = blockId;
    }

    newBlockData[newBlock.root].branch = newBranch;
    newBlockData[newBlock.id] = newBlock;

    setBlockData({ ...newBlockData });

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.DOWN);
    }, 0);
  };

  const actionRemove = (blockId: string) => {
    console.log("actionRemove");

    const blockType = getBlockType(blockId, blockData);

    if (blockType !== BlockType.TopLeaf && blockType !== BlockType.Leaf) return;

    const rootBlock = getRootBlock(blockId, blockData);
    const rootBlockBranch = rootBlock?.branch;

    if (!rootBlockBranch) return;

    let newBlockBranch: string[] | undefined = removeBlockAtBranch(
      blockId,
      rootBlockBranch
    );

    if (newBlockBranch.length <= 0) {
      newBlockBranch = undefined;
    }

    const newBlockData = removeBlock(blockId, blockData);

    newBlockData[rootBlock?.id].branch = newBlockBranch;

    setBlockData({ ...newBlockData });
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
