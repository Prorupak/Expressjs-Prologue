// "requireActual" ensures you get the real file instead of an auto mock;
// also use import type and <type of module> to get all the types
import type * as TestFunctions from "../index";

const { sum } = jest.requireActual<typeof TestFunctions>("../index");

const successCases = [
  {
    id: 0,
    input: { a: 1, b: 2 },
    output: 3,
  },
  {
    id: 1,
    input: { a: 2, b: 3 },
    output: 5,
  },
  {
    id: 2,
    input: { a: 3, b: 4 },
    output: 7,
  },
];

// This is the test
describe("sum", () => {
  it.each(successCases)("success case $id", ({ input, output }) => {
    const { a, b } = input;
    expect(sum(a, b)).toBe(output);
  });
});
