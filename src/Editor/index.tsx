import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummyBlockData, dummyBlockTopRoot } from "../dymmy";
import BlockComponent from "./BlockComponent";
import Utils from "./Utils";

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

        actionFocusMove(blockRefIndex, FocusOption.UP);
        actionRemove(blockId);
      }
    }
  };

  const actionIndent = (blockId: string, refIndex: number) => {
    const block = blockData[blockId];
    const blockRootId = block?.root;

    if (!blockRootId) {
      const blockOrderIndex = Utils.getIndexToArray(blockTopRoot, blockId);

      const beRootId = blockTopRoot[blockOrderIndex - 1];

      // TODO: 추가 리펙토링 필요
      if (beRootId) {
        block.root = beRootId;

        const newParentOriginChildren = blockData[beRootId]?.branch;

        setBlockData((prev) => ({
          ...prev,
          [blockId]: block,
          [beRootId]: {
            ...prev?.[beRootId],
            branch: [...(newParentOriginChildren || []), blockId],
          },
        }));

        blockTopRoot.splice(blockOrderIndex, 1);
        setBlockTopRoot(blockTopRoot);
      }
    }

    if (blockRootId) {
      const blockBranchOrder = blockData[blockRootId].branch;

      if (!blockBranchOrder) return;

      const blockOrderIndex = Utils.getIndexToArray(blockBranchOrder, blockId);

      const beRootId = blockBranchOrder?.[blockOrderIndex - 1];
      // TODO: 추가 리펙토링 필요
      if (beRootId) {
        const newParentOriginChildren = blockData[beRootId]?.branch;
        blockBranchOrder.splice(blockOrderIndex, 1);
        setBlockData((prev) => ({
          ...prev,
          [blockId]: { ...block, root: beRootId },
          [blockRootId]: {
            ...prev?.[blockRootId],
            branch: blockBranchOrder,
          },
          [beRootId]: {
            ...prev?.[beRootId],
            branch: [...(newParentOriginChildren || []), blockId],
          },
        }));

        blockTopRoot.splice(blockOrderIndex, 0);
        setBlockTopRoot(blockTopRoot);
      }
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
    const generatedId = (new Date().getTime() + Math.random()) * 10000;

    const block = blockData[blockId];
    const blockBranchOrder = block?.branch;
    const blockRootId = block.root;

    // TODO: 추가 리펙토링 필요
    if (blockBranchOrder) {
      setBlockData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", root: blockId },
          [blockId]: {
            ...block,
            branch: [String(generatedId), ...blockBranchOrder],
          },
        };
      });
    }

    // TODO: 추가 리펙토링 필요
    if (!blockBranchOrder && blockRootId) {
      let blockRootBranchOrder = blockData[blockRootId].branch;

      if (!blockRootBranchOrder) return;

      const blockOrderIndex = Utils.getIndexToArray(
        blockRootBranchOrder,
        blockId
      );

      if (blockRootBranchOrder) {
        blockRootBranchOrder.splice(
          blockOrderIndex + 1,
          0,
          String(generatedId)
        );
      }

      setBlockData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", root: block.root },
          [blockRootId]: {
            ...block,
            branch: blockRootBranchOrder,
          },
        };
      });
    }

    // TODO: 추가 리펙토링 필요
    if (!blockBranchOrder && !blockRootId) {
      const blockOrderIndex = Utils.getIndexToArray(blockTopRoot, blockId);

      blockTopRoot.splice(blockOrderIndex + 1, 0, String(generatedId));
      setBlockTopRoot(blockTopRoot);
      setBlockData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "" },
        };
      });
    }

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.DOWN);
    }, 0);
  };

  const actionRemove = (blockId: string) => {
    console.log("actionRemove");

    const block = blockData[blockId];
    const blockRootId = block?.root;
    // TODO: 추가 리펙토링 필요
    if (blockRootId) {
      const blockRoot = blockData[blockRootId];
      let blockRootBranchOrder = blockRoot?.branch;

      if (!blockRootBranchOrder) return;

      const blockOrderIndex = Utils.getIndexToArray(
        blockRootBranchOrder,
        blockId
      );

      blockRootBranchOrder?.splice(blockOrderIndex, 1);

      if (Number(blockRootBranchOrder?.length) <= 0) {
        blockRootBranchOrder = undefined;
      }

      setBlockData((prev) => {
        const { [blockId]: string, ...obj } = prev;
        return {
          ...obj,
          [blockRootId]: {
            ...prev?.[blockRootId],
            branch: blockRootBranchOrder,
          },
        };
      });

      return;
    }
    // TODO: 추가 리펙토링 필요
    const blockOrderIndex = Utils.getIndexToArray(blockTopRoot, blockId);

    blockTopRoot.splice(blockOrderIndex, 1);
    setBlockTopRoot(blockTopRoot);

    const { [blockId]: string, ...obj } = blockData;
    setBlockData(obj);
  };

  const actionFocusMove = (blockRefIndex: number, focusOption: FocusOption) => {
    console.log("blockRefIndex", blockRefIndex);
    console.log("focusOption", FocusOption[focusOption]);

    const beMovedBlockRef = blockRef.current[blockRefIndex + focusOption];

    setTimeout(() => {
      beMovedBlockRef?.focus();
      console.log("beMovedBlockRef", beMovedBlockRef);
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
