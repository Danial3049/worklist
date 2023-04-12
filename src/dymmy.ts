import { Block } from "./Editor";

// const dummyBlockData: Block[] = [
//   { id: "root", branch: ["1", "2", "3"] },
//   {
//     id: "1",
//     root: "root",
//     content: "1",
//     branch: ["1-1"],
//   },
//   {
//     id: "2",
//     root: "root",
//     content: "2",
//   },
//   { id: "3", root: "root", content: "3", branch: ["3-1"] },
//   {
//     id: "1-1",
//     root: "1",
//     content: "1-1",
//     branch: ["1-1-1", "1-1-2", "1-1-3"],
//   },
//   {
//     id: "1-1-1",
//     root: "1-1",
//     content: "1-1-1",
//     branch: ["1-1-1-1", "1-1-1-2", "1-1-1-3"],
//   },
//   { id: "1-1-1-1", content: "1-1-1-1", root: "1-1-1" },
//   { id: "1-1-1-2", content: "1-1-1-2", root: "1-1-1" },
//   { id: "1-1-1-3", content: "1-1-1-3", root: "1-1-1" },
//   { id: "1-1-2", content: "1-1-2", root: "1-1" },
//   { id: "1-1-3", content: "1-1-3", root: "1-1" },
//   {
//     id: "3-1",
//     content: "3-1",
//     root: "3",
//     branch: ["3-1-1", "3-1-2", "3-1-3"],
//   },
//   { id: "3-1-1", content: "3-1-1", root: "3-1" },
//   { id: "3-1-2", content: "3-1-2", root: "3-1" },
//   { id: "3-1-3", content: "3-1-3", root: "3-1" },
// ];

const dummyBlockData: Block[] = [
  { id: "root", branch: ["default"] },
  { id: "default", content: "", root: "root" },
];
export { dummyBlockData };
