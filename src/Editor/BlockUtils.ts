import { Block } from ".";
import _ from "lodash";

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
  const generatedId = getGeneratedId();
  const block = blockData[blockId];
  const blockBranchOrder = block?.branch as string[];

  blockBranchOrder.unshift(generatedId);

  const newBlockData = blockData;
  newBlockData[blockId].branch = blockBranchOrder;
  newBlockData[generatedId] = { content: "", root: blockId };

  return newBlockData;
};

export const addBlockLeaf = (
  blockId: string,
  blockData: { [id: string]: Block }
): { [id: string]: Block } => {
  const generatedId = getGeneratedId();
  const block = blockData[blockId];
  const blockRootId = block.root as string;
  const blockRootBranchOrder = blockData[blockRootId].branch as string[];
  const blockOrderIndex = _.indexOf(blockRootBranchOrder, blockId);

  blockRootBranchOrder.splice(blockOrderIndex + 1, 0, String(generatedId));

  const newBlockData = blockData;
  newBlockData[blockRootId].branch = blockRootBranchOrder;
  newBlockData[generatedId] = { content: "", root: block.root };

  return newBlockData;
};

export const addBlockTopLeaf = (
  blockId: string,
  blockData: { [id: string]: Block },
  blockTopRoot: string[]
): { newBlockData: { [id: string]: Block }; newBlockTopRoot: string[] } => {
  const generatedId = getGeneratedId();
  const blockOrderIndex = _.indexOf(blockTopRoot, blockId);

  blockTopRoot.splice(blockOrderIndex + 1, 0, String(generatedId));

  const newBlockData = blockData;
  newBlockData[generatedId] = { content: "" };

  return { newBlockData: newBlockData, newBlockTopRoot: blockTopRoot };
};

export const removeBlockTopLeaf = (
  blockId: string,
  blockData: { [id: string]: Block },
  blockTopRoot: string[]
): { newBlockData: { [id: string]: Block }; newBlockTopRoot: string[] } => {
  const blockOrderIndex = _.indexOf(blockTopRoot, blockId);

  // TODO: 좀 더 개선할 방안이 없나?
  blockTopRoot.splice(blockOrderIndex, 1);

  const newBlockData = _.omit(blockData, blockId);

  return { newBlockData: newBlockData, newBlockTopRoot: blockTopRoot };
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

export const getBlockType = (block: Block): BlockType => {
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

const getGeneratedId = (): string => {
  return ((new Date().getTime() + Math.random()) * 10000).toString();
};
