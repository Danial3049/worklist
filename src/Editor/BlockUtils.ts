import _ from "lodash";
import { Block } from ".";

export enum BlockType {
  None,
  TopLeaf,
  Leaf,
  TopBranch,
  Branch,
}

export const addBlockBranch = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  const blockBranch = getBranch(blockId, blockData);

  if (!blockBranch) return blockData;

  const newBlock = createBlock();
  newBlock.root = blockId;

  const newBlockBranch = insertBlockAtBranch(
    blockId,
    newBlock.id,
    "first",
    blockBranch
  );

  const newBlockData = blockData;
  newBlockData[newBlock.id] = newBlock;
  newBlockData[blockId].branch = newBlockBranch;

  // const generatedId = getGeneratedId();
  // const block = blockData[blockId];
  // const blockBranchOrder = block?.branch as string[];

  // blockBranchOrder.unshift(generatedId);

  // const newBlockData = blockData;
  // newBlockData[blockId].branch = blockBranchOrder;
  // newBlockData[generatedId] = { id: generatedId, content: "", root: blockId };

  return newBlockData;
};

export const addBlockLeaf = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  const block = getBlock(blockId, blockData);

  const rootBlock = getRootBlock(blockId, blockData);

  if (!rootBlock?.branch) return blockData;

  const newBlock = createBlock();
  newBlock.root = block.root;

  const newBlockRoot = insertBlockAtBranch(
    blockId,
    newBlock.id,
    "next",
    rootBlock?.branch
  );

  const newBlockData = blockData;
  newBlockData[newBlock.id] = newBlock;
  newBlockData[rootBlock.id].branch = newBlockRoot;

  return newBlockData;
};

export const addBlockTopLeaf = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  const blockTopRoot = blockData["root"].branch;

  if (!blockTopRoot) return blockData;

  const newBlock = createBlock();
  const newBlockTopRoot = insertBlockAtBranch(
    blockId,
    newBlock.id,
    "next",
    blockTopRoot
  );

  const newBlockData = blockData;
  newBlockData[newBlock.id] = newBlock;
  newBlockData["root"].branch = newBlockTopRoot;

  return newBlockData;
};

export const removeBlockTopLeaf = (
  blockId: string,
  blockData: { [id: string]: Block },
  blockTopRoot: string[]
): { [id: string]: Block } => {
  const newBlockBranch = removeBlockAtBranch(blockId, blockTopRoot);
  const newBlockData = removeBlock(blockId, blockData);

  newBlockData["root"].branch = newBlockBranch;

  return newBlockData;
};

export const removeBlockLeaf = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  const block = blockData[blockId];
  const blockRootId = block?.root as string;
  const blockRoot = blockData[blockRootId];
  let blockRootBranchOrder = blockRoot?.branch;

  const blockOrderIndex = _.indexOf(blockRootBranchOrder, blockId);
  blockRootBranchOrder?.splice(blockOrderIndex, 1);

  if (Number(blockRootBranchOrder?.length) <= 0) {
    blockRootBranchOrder = undefined;
  }

  const newBlockData: { [id: string]: Block } = _.omit(blockData, blockId);
  newBlockData[blockRootId].branch = blockRootBranchOrder;

  return newBlockData;
};

export const indentBlockTop = (
  blockId: string,
  blockData: { [id: string]: Block },
  blockTopRoot: string[]
):
  | { newBlockData: { [id: string]: Block }; newBlockTopRoot: string[] }
  | undefined => {
  const block = blockData[blockId];
  const blockOrderIndex = _.indexOf(blockTopRoot, blockId);
  const beRootId = blockTopRoot[blockOrderIndex - 1];

  if (!beRootId) return;

  const newOrder = blockData[beRootId]?.branch || [];
  const newBlockTopRoot = blockTopRoot;

  newOrder.push(blockId);
  block.root = beRootId;

  const newBlockData = blockData;
  newBlockData[blockId] = block;
  newBlockData[beRootId].branch = newOrder;

  newBlockTopRoot.splice(blockOrderIndex, 1);

  return { newBlockData: newBlockData, newBlockTopRoot: newBlockTopRoot };
};

export const indentBlockNotTop = (
  blockId: string,
  blockData: { [id: string]: Block }
) => {
  const block = blockData[blockId];
  const blockRootId = block?.root as string;
  const blockRootBranchOrder = blockData[blockRootId].branch;
  const blockOrderIndex = _.indexOf(blockRootBranchOrder, blockId);
  const beRootId = blockRootBranchOrder?.[blockOrderIndex - 1];

  if (!beRootId) return;

  const beRootBlockBranch = blockData[beRootId]?.branch || [];
  beRootBlockBranch.push(blockId);

  blockRootBranchOrder.splice(blockOrderIndex, 1);

  const newBlockData = blockData;
  newBlockData[blockId].root = beRootId;
  newBlockData[blockRootId].branch = blockRootBranchOrder;
  newBlockData[beRootId].branch = beRootBlockBranch;

  return newBlockData;
};

export const getBlockType = (
  blockId: string,
  blockData: { [id: string]: Block }
): BlockType => {
  const block = getBlock(blockId, blockData);
  const branch = block?.branch;
  const root = block?.root;

  if (!root && !branch) {
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

export const hasBranch = (block: Block): boolean => {
  const branch = block?.branch;

  return branch ? true : false;
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

export const getRootBlock = (
  blockId: string,
  blockData: { [id: string]: Block },
  step: number = 1
) => {
  const block = getBlock(blockId, blockData);

  if (!block?.root) return;

  return getBlock(block.root, blockData);
};

export const getBranchBlocks = (
  blockId: string,
  blockData: { [id: string]: Block }
) => {
  const block = getBlock(blockId, blockData);

  if (!block?.branch) return;

  const branchBlocks = block.branch.map((blockId) => {
    return getBlock(blockId, blockData);
  });

  return branchBlocks;
};

export const getBranch = (
  blockId: string,
  blockData: { [id: string]: Block }
) => {
  const block = getBlock(blockId, blockData);

  if (!block?.branch) return;

  return block?.branch;
};

export const getRootBlockBranch = (
  blockId: string,
  blockData: { [id: string]: Block }
) => {
  const rootBlock = getRootBlock(blockId, blockData);

  return rootBlock?.branch || 0;
};

export const insertBlockAtBranch = (
  baseBlockId: string,
  insertBlockId: string,
  position: "first" | "last" | "next" | "prev",
  blockOrder: string[]
) => {
  const baseBlockIndex = blockOrder.indexOf(baseBlockId);

  if (position === "first") {
    blockOrder.unshift(insertBlockId);
  }

  if (position === "last") {
    blockOrder.push(insertBlockId);
  }

  if (position === "next") {
    blockOrder.splice(baseBlockIndex + 1, 0, insertBlockId);
  }

  if (position === "prev") {
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

export const setBlock = (block: Block, blockData: { [id: string]: Block }) => {
  blockData[block.id] = block;

  return blockData;
};

export const getGeneratedId = (): string => {
  return ((new Date().getTime() + Math.random()) * 10000).toString();
};
