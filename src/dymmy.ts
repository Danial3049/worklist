import { Block } from "./Editor";

const dummyBlockTopRoot = ["1", "2", "3"];
const dummyBlockData: Block[] = [
  {
    id: "1",
    root: undefined,
    content: "1",
    branch: ["1-1"],
  },
  {
    id: "2",
    root: undefined,
    content: "2",
    branch: undefined,
  },
  { id: "3", root: undefined, content: "3", branch: ["3-1"] },
  {
    id: "1-1",
    root: "1",
    content: "1-1",
    branch: ["1-1-1", "1-1-2", "1-1-3"],
  },
  {
    id: "1-1-1",
    root: "1-1",
    content: "1-1-1",
    branch: ["1-1-1-1", "1-1-1-2", "1-1-1-3"],
  },
  { id: "1-1-1-1", content: "1-1-1-1", root: "1-1-1" },
  { id: "1-1-1-2", content: "1-1-1-2", root: "1-1-1" },
  { id: "1-1-1-3", content: "1-1-1-3", root: "1-1-1" },
  { id: "1-1-2", content: "1-1-2", root: "1-1" },
  { id: "1-1-3", content: "1-1-3", root: "1-1" },
  {
    id: "3-1",
    content: "3-1",
    root: "3",
    branch: ["3-1-1", "3-1-2", "3-1-3"],
  },
  { id: "3-1-1", content: "3-1-1", root: "3-1" },
  { id: "3-1-2", content: "3-1-2", root: "3-1" },
  { id: "3-1-3", content: "3-1-3", root: "3-1" },
];
export { dummyBlockData, dummyBlockTopRoot };
