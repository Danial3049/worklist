import _ from "lodash";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummyBlockData, dummyBlockRoot } from "../dymmy";
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
  const [blockRoot, setBlockRoot] = useState<string[]>([]);
  const [blockData, setBlockData] = useState<{ [id: string]: Block }>({});

  const blockRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setBlockRoot(dummyBlockRoot);
    setBlockData(dummyBlockData);
  }, []);

  // TODO: Debug 용도
  useEffect(() => {
    if (blockRoot.length <= 0) return;
    console.log("blockRoot", blockRoot);
  }, [blockRoot]);

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
    const rootId = block?.root;

    if (!rootId) {
      const currentRowKeyIndex = Utils.getIndexToArray(blockRoot, blockId);

      const newParentKey = blockRoot[currentRowKeyIndex - 1];

      if (newParentKey) {
        block.root = newParentKey;

        const newParentOriginChildren = blockData[newParentKey]?.branch;
        setBlockData((prev) => ({
          ...prev,
          [blockId]: block,
          [newParentKey]: {
            ...prev?.[newParentKey],
            branch: [...(newParentOriginChildren || []), blockId],
          },
        }));

        blockRoot.splice(currentRowKeyIndex, 1);
        setBlockRoot(blockRoot);
      }
    }

    if (rootId) {
      const parentChildrenOrder = blockData[rootId].branch;

      const currentRowKeyIndex = _.findIndex(
        parentChildrenOrder,
        (id) => id === blockId
      );

      const newParentKey = parentChildrenOrder?.[currentRowKeyIndex - 1];

      if (newParentKey) {
        const newParentOriginChildren = blockData[newParentKey]?.branch;
        parentChildrenOrder.splice(currentRowKeyIndex, 1);
        setBlockData((prev) => ({
          ...prev,
          [blockId]: { ...block, root: newParentKey },
          [rootId]: { ...prev?.[rootId], branch: parentChildrenOrder },
          [newParentKey]: {
            ...prev?.[newParentKey],
            branch: [...(newParentOriginChildren || []), blockId],
          },
        }));

        blockRoot.splice(currentRowKeyIndex, 0);
        setBlockRoot(blockRoot);
      }
    }

    setTimeout(() => {
      actionFocusMove(refIndex, FocusOption.MAINTAIN);
    }, 0);
  };

  const actionOutdent = (currentRowKey: string, refIndex: number) => {
    // 현재 아이템 lodash findkey 검토

    const currentRowData = blockData[currentRowKey];

    const currentRowParentKey = currentRowData?.root;

    if (currentRowParentKey) {
    }
    //parent를 부모의 parent로 변경
  };

  const getBlockElRefIndex = (blockRefIndex: number): HTMLDivElement | null => {
    return blockRef.current[blockRefIndex];
  };

  const actionAdd = (currentRowKey: string, refIndex: number) => {
    const generatedId = (new Date().getTime() + Math.random()) * 10000;

    const currentRowData = blockData[currentRowKey];
    const childrenOrder = currentRowData?.branch;
    const parentKey = currentRowData.root;

    // 추가 될 때 Children이 있으면
    if (childrenOrder) {
      setBlockData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", root: currentRowKey },
          [currentRowKey]: {
            ...currentRowData,
            branch: [String(generatedId), ...childrenOrder],
          },
        };
      });
    }

    if (!childrenOrder && parentKey) {
      let parentChildrenOrder = blockData[parentKey].branch;
      const currentRowKeyIndex = _.findIndex(
        parentChildrenOrder,
        (key) => key === currentRowKey
      );

      if (parentChildrenOrder) {
        parentChildrenOrder.splice(
          currentRowKeyIndex + 1,
          0,
          String(generatedId)
        );
      }

      setBlockData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", root: currentRowData.root },
          [parentKey]: {
            ...currentRowData,
            branch: parentChildrenOrder,
          },
        };
      });
    }

    if (!childrenOrder && !parentKey) {
      const currentRowKeyIndex = _.findIndex(
        blockRoot,
        (key) => key === currentRowKey
      );
      blockRoot.splice(currentRowKeyIndex + 1, 0, String(generatedId));
      setBlockRoot(blockRoot);
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

  const actionRemove = (currentRowKey: string) => {
    console.log("actionRemove");

    const currentRowData = blockData[currentRowKey];
    const parentKey = currentRowData?.root;

    if (parentKey) {
      const parentData = blockData[parentKey];
      let parentChilrenOrder = parentData?.branch;

      const currentRowKeyIndex = _.findIndex(
        parentChilrenOrder,
        (key) => key === currentRowKey
      );

      parentChilrenOrder?.splice(currentRowKeyIndex, 1);

      if (Number(parentChilrenOrder?.length) <= 0) {
        parentChilrenOrder = undefined;
      }

      setBlockData((prev) => {
        const { [currentRowKey]: string, ...obj } = prev;
        return {
          ...obj,
          [parentKey]: { ...prev?.[parentKey], children: parentChilrenOrder },
        };
      });

      return;
    }

    const currentRowKeyIndex = _.findIndex(
      blockRoot,
      (key) => key === currentRowKey
    );

    blockRoot.splice(currentRowKeyIndex, 1);
    setBlockRoot(blockRoot);

    const { [currentRowKey]: string, ...obj } = blockData;
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
    blockRoot: string[] | undefined,
    depth: number = 0
  ): any => {
    return blockRoot?.map((blockId) => {
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

  return <>{renderRowList(blockRoot)}</>;
}
