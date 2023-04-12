import _ from "lodash";
import { Block } from ".";

export enum BlockType {
  None,
  TopLeaf,
  Leaf,
  TopBranch,
  Branch,
}

export const getBlockType = (
  blockId: string,
  blockData: { [id: string]: Block }
): BlockType => {
  const block = getBlock(blockId, blockData);
  const branch = block?.branch;
  const root = block?.root;

  if (root === "root" && !branch) {
    console.log("topleaf");
    return BlockType.TopLeaf;
  }
  if (root && !branch) {
    return BlockType.Leaf;
  }

  if (!root && branch) {
    return BlockType.TopBranch;
  }

  if (root && branch) {
    return BlockType.Branch;
  }

  return BlockType.None;
};

export const getTopRootBlockId = (blockData: Block[]): string[] | undefined => {
  const rootBlock = _.find(blockData, (block) => {
    return block.id === "root";
  });

  return rootBlock?.branch;
};

export const getBlock = (
  blockId: string,
  blocksObj: { [id: string]: Block }
) => {
  return blocksObj[blockId];
};

export const getPrevBlock = (
  baseBlockId: string,
  blocksObj: { [id: string]: Block }
) => {
  const rootBlock = getRootBlock(baseBlockId, blocksObj);
  const rootBlockBranch = rootBlock?.branch;
  const blockOrderIndex = rootBlockBranch?.indexOf(baseBlockId) as number;

  if (blockOrderIndex <= 0) return;
  if (!rootBlockBranch) return;

  const prevBlockId = rootBlockBranch[blockOrderIndex - 1];

  return getBlock(prevBlockId, blocksObj);
};

export const getRootBlock = (
  blockId: string,
  blockData: { [id: string]: Block }
) => {
  const block = getBlock(blockId, blockData);

  if (!block?.root) return;

  return getBlock(block.root, blockData);
};

export const insertBlockAtBranch = (
  insertBlockId: string,
  blockOrder: string[] | undefined,
  position: "first" | "last" | "next" | "prev",
  baseBlockId?: string
) => {
  if (!blockOrder) {
    blockOrder = [];
  }

  if (position === "first") {
    blockOrder.unshift(insertBlockId);
  }

  if (position === "last") {
    blockOrder.push(insertBlockId);
  }

  if (position === "next") {
    if (!baseBlockId) return blockOrder;
    const baseBlockIndex = blockOrder.indexOf(baseBlockId);
    blockOrder.splice(baseBlockIndex + 1, 0, insertBlockId);
  }

  if (position === "prev") {
    if (!baseBlockId) return blockOrder;
    const baseBlockIndex = blockOrder.indexOf(baseBlockId);
    blockOrder.splice(baseBlockIndex, 0, insertBlockId);
  }

  return blockOrder;
};

export const removeBlock = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  return _.omit(blockData, blockId);
};

export const removeBlockAtBranch = (blockId: string, blockOrder: string[]) => {
  const blockIndex = blockOrder.indexOf(blockId);

  blockOrder.splice(blockIndex, 1);

  return blockOrder;
};

export const createBlock = (): Block => {
  const id = getGeneratedId();

  return { id: id, content: "", root: undefined, branch: undefined };
};

export const getGeneratedId = (): string => {
  return ((new Date().getTime() + Math.random()) * 10000).toString();
};
