import { Block } from "./Editor";

const dummyBlockRoot = ["1", "2", "3"];
const dummyBlockData: { [id: string]: Block } = {
  1: {
    content: "1",
    branch: ["1-1"],
  },
  2: {
    content: "2",
  },
  3: { content: "3", branch: ["3-1"] },
  "1-1": {
    content: "1-1",
    root: "1",
    branch: ["1-1-1", "1-1-2", "1-1-3"],
  },
  "1-1-1": {
    content: "1-1-1",
    root: "1-1",
    branch: ["1-1-1-1", "1-1-1-2", "1-1-1-3"],
  },
  "1-1-1-1": { content: "1-1-1-1", root: "1-1-1" },
  "1-1-1-2": { content: "1-1-1-2", root: "1-1-1" },
  "1-1-1-3": { content: "1-1-1-3", root: "1-1-1" },
  "1-1-2": { content: "1-1-2", root: "1-1" },
  "1-1-3": { content: "1-1-3", root: "1-1" },
  "3-1": {
    content: "3-1",
    root: "3",
    branch: ["3-1-1", "3-1-2", "3-1-3"],
  },
  "3-1-1": { content: "3-1-1", root: "3-1" },
  "3-1-2": { content: "3-1-2", root: "3-1" },
  "3-1-3": { content: "3-1-3", root: "3-1" },
};

export { dummyBlockData, dummyBlockRoot };
