import Filer from "./index";

test("Should accurately transform a list of commands", () => {
  const t = "HELLO";
  const filer = new Filer();
  expect(filer.create(t)).toBe(t);
});
