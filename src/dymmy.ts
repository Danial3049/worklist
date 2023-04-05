const dummyRowOrder = ["1", "2", "3"];
const dummyRowData: any = {
  1: {
    content: "1",
    children: ["1-1"],
  },
  2: {
    content: "2",
  },
  3: { content: "3", children: ["3-1"] },
  "1-1": {
    content: "1-1",
    parent: "1",
    children: ["1-1-1", "1-1-2", "1-1-3"],
  },
  "1-1-1": {
    content: "1-1-1",
    parent: "1-1",
    children: ["1-1-1-1", "1-1-1-2", "1-1-1-3"],
  },
  "1-1-1-1": { content: "1-1-1-1", parent: "1-1-1" },
  "1-1-1-2": { content: "1-1-1-2", parent: "1-1-1" },
  "1-1-1-3": { content: "1-1-1-3", parent: "1-1-1" },
  "1-1-2": { content: "1-1-2", parent: "1-1" },
  "1-1-3": { content: "1-1-3", parent: "1-1" },
  "3-1": {
    content: "3-1",
    parent: "3",
    children: ["3-1-1", "3-1-2", "3-1-3"],
  },
  "3-1-1": { content: "3-1-1", parent: "3-1" },
  "3-1-2": { content: "3-1-2", parent: "3-1" },
  "3-1-3": { content: "3-1-3", parent: "3-1" },
};

export { dummyRowData, dummyRowOrder };
