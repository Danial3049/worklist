import _ from "lodash";
import { useEffect, useState, useRef, Fragment } from "react";
import RowInput from "./RowInput";
import { dummyRowData, dummyRowOrder } from "../dymmy";

export interface RowData {
  content?: string;
  children?: string[];
  parent?: string;
}

export default function Editor() {
  const [rowOrder, setRowOrder] = useState<string[]>([]);
  const [rowData, setRowData] = useState<{ [id: string]: RowData }>({});

  const inputRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setRowOrder(dummyRowOrder);
    setRowData(dummyRowData);
  }, []);

  // TODO: Debug 용도
  useEffect(() => {
    if (rowOrder.length <= 0) return;

    console.log("rowOrder", rowOrder);
  }, [rowOrder]);

  // TODO: Debug 용도
  useEffect(() => {
    if (Object.keys(rowData).length <= 0) return;
    console.log("rowData", rowData);
  }, [rowData]);

  // TODO: Debug 용도
  useEffect(() => {
    if (inputRef.current.length <= 0) return;
    console.log("inputRef", inputRef.current);
  }, [inputRef.current]);

  const updateInputData = (rowId: string, newContent: string | null) => {
    setRowData((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], content: newContent || "" },
    }));
  };

  const handleKeyPress = (
    rowKey: string,
    element: React.KeyboardEvent<HTMLDivElement>,
    refIndex: number
  ) => {
    //TODO: Debug 용도
    console.log("keyPress = ", element.key);

    if (element.key === "Enter" && element.shiftKey !== true) {
      element.preventDefault();
      actionAdd(rowKey, refIndex);
    }

    if (element.key === "Tab" && element.shiftKey === true) {
      element.preventDefault();
    }

    if (element.key === "Tab" && element.shiftKey !== true) {
      element.preventDefault();
      actionDepth(rowKey, refIndex);
    }

    if (element.key === "ArrowDown") {
      element.preventDefault();
      actionFocusMove(refIndex, 1);
    }

    if (element.key === "ArrowUp") {
      element.preventDefault();
      actionFocusMove(refIndex, -1);
    }

    if (element.key === "Backspace") {
      const currentElementTextContent =
        getInputElementRowKey(refIndex)?.textContent;
      if (
        currentElementTextContent != null &&
        currentElementTextContent?.length <= 0
      ) {
        element.preventDefault();
        actionFocusMove(refIndex, -1);
        actionRemove(rowKey);
      }
    }
  };

  const actionDepth = (currentRowKey: string, refIndex: number) => {
    const currentRowData = rowData[currentRowKey];
    const parentKey = currentRowData?.parent;

    if (!parentKey) {
      const currentRowKeyIndex = _.findIndex(
        rowOrder,
        (key) => key === currentRowKey
      );

      const newParentKey = rowOrder[currentRowKeyIndex - 1];

      if (newParentKey) {
        currentRowData.parent = newParentKey;

        const newParentOriginChildren = rowData[newParentKey]?.children;
        setRowData((prev) => ({
          ...prev,
          [currentRowKey]: currentRowData,
          [newParentKey]: {
            ...prev?.[newParentKey],
            children: [...(newParentOriginChildren || []), currentRowKey],
          },
        }));

        rowOrder.splice(currentRowKeyIndex, 1);
        setRowOrder(rowOrder);
      }
    }

    if (parentKey) {
      const parentChildrenOrder = rowData[parentKey].children;

      const currentRowKeyIndex = _.findIndex(
        parentChildrenOrder,
        (key) => key === currentRowKey
      );

      const newParentKey = parentChildrenOrder?.[currentRowKeyIndex - 1];

      if (newParentKey) {
        const newParentOriginChildren = rowData[newParentKey]?.children;
        parentChildrenOrder.splice(currentRowKeyIndex, 1);
        setRowData((prev) => ({
          ...prev,
          [currentRowKey]: { ...currentRowData, parent: newParentKey },
          [parentKey]: { ...prev?.[parentKey], children: parentChildrenOrder },
          [newParentKey]: {
            ...prev?.[newParentKey],
            children: [...(newParentOriginChildren || []), currentRowKey],
          },
        }));

        rowOrder.splice(currentRowKeyIndex, 0);
        setRowOrder(rowOrder);
      }
    }

    setTimeout(() => {
      actionFocusMove(refIndex, 0);
    }, 0);
  };

  const actionDepthBack = (currentRowKey: string, refIndex: number) => {
    // 현재 아이템 lodash findkey 검토

    const currentRowData = rowData[currentRowKey];

    const currentRowParentKey = currentRowData?.parent;

    if (currentRowParentKey) {
    }
    //parent를 부모의 parent로 변경
  };

  const getInputElementRowKey = (refIndex: number): HTMLDivElement | null => {
    return inputRef.current[refIndex];
  };

  const actionAdd = (currentRowKey: string, refIndex: number) => {
    const generatedId = (new Date().getTime() + Math.random()) * 10000;

    const currentRowData = rowData[currentRowKey];
    const childrenOrder = currentRowData?.children;
    const parentKey = currentRowData.parent;

    // 추가 될 때 Children이 있으면
    if (childrenOrder) {
      setRowData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", parent: currentRowKey },
          [currentRowKey]: {
            ...currentRowData,
            children: [String(generatedId), ...childrenOrder],
          },
        };
      });
    }

    if (!childrenOrder && parentKey) {
      let parentChildrenOrder = rowData[parentKey].children;
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

      setRowData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "", parent: currentRowData.parent },
          [parentKey]: {
            ...currentRowData,
            children: parentChildrenOrder,
          },
        };
      });
    }

    if (!childrenOrder && !parentKey) {
      const currentRowKeyIndex = _.findIndex(
        rowOrder,
        (key) => key === currentRowKey
      );
      rowOrder.splice(currentRowKeyIndex + 1, 0, String(generatedId));
      setRowOrder(rowOrder);
      setRowData((prev) => {
        return {
          ...prev,
          [generatedId]: { content: "" },
        };
      });
    }

    setTimeout(() => {
      actionFocusMove(refIndex, 1);
    }, 0);
  };

  const actionRemove = (currentRowKey: string) => {
    console.log("actionRemove");

    const currentRowData = rowData[currentRowKey];
    const parentKey = currentRowData?.parent;

    if (parentKey) {
      const parentData = rowData[parentKey];
      let parentChilrenOrder = parentData?.children;

      const currentRowKeyIndex = _.findIndex(
        parentChilrenOrder,
        (key) => key === currentRowKey
      );

      parentChilrenOrder?.splice(currentRowKeyIndex, 1);

      if (Number(parentChilrenOrder?.length) <= 0) {
        parentChilrenOrder = undefined;
      }

      setRowData((prev) => {
        const { [currentRowKey]: string, ...obj } = prev;
        return {
          ...obj,
          [parentKey]: { ...prev?.[parentKey], children: parentChilrenOrder },
        };
      });

      return;
    }

    const currentRowKeyIndex = _.findIndex(
      rowOrder,
      (key) => key === currentRowKey
    );

    rowOrder.splice(currentRowKeyIndex, 1);
    setRowOrder(rowOrder);

    const { [currentRowKey]: string, ...obj } = rowData;
    setRowData(obj);
  };

  const actionFocusMove = (refIndex: number, amountMovement: number) => {
    console.log("refIndex", refIndex);
    console.log("amountMovement", amountMovement);
    const nextInputRef = inputRef.current[refIndex + amountMovement];

    setTimeout(() => {
      nextInputRef?.focus();
      console.log("nextInputRef", nextInputRef);
      if (nextInputRef != null) {
        window.getSelection()?.selectAllChildren(nextInputRef);
        window.getSelection()?.collapseToEnd();
      }
    }, 0);
  };

  let rowCount = -1;
  const renderRowList = (
    rowOrder: string[] | undefined,
    depth: number
  ): any => {
    return rowOrder?.map((key) => {
      const data = rowData[key];
      rowCount++;
      return (
        <Fragment key={key}>
          <RowInput
            depth={depth}
            inputRef={(el, refIndex) => {
              inputRef.current[refIndex] = el;
            }}
            refIndex={rowCount}
            rowKey={key}
            rowData={data}
            onChange={(changeContent) => {
              updateInputData(key, changeContent);
            }}
            onKeyDown={(rowKey, element, refIndex) => {
              handleKeyPress(rowKey, element, refIndex);
            }}
          />
          {renderRowList(data?.children, depth + 1)}
        </Fragment>
      );
    });
  };

  return (
    <>
      {renderRowList(rowOrder, 0)}
      {/* {rowOrder.map((key, index) => {
        const data = rowData[key];
        return (
          <RowInput
            inputRef={(el) => {
              console.log("el", el);
              inputRef.current[index] = el;
            }}
            key={key}
            rowKey={key}
            rowData={data}
            onChange={(changeContent) => {
              updateInputData(key, changeContent);
            }}
            onKeyDown={(rowKey, element) => {
              handleKeyPress(rowKey, element);
            }}
          />
        );
      })} */}
    </>
  );
}
