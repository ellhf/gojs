/**
 *
 * @param {string} desription
 */
export function parseDescription(desription) {
  const REPLACES = [
    { reg: /。 /g, rep: "。\n" },
    { reg: /， /g, rep: "，\n" },
    { reg: /\.\.\. /g, rep: "...\n" },
    { reg: /\n /g, rep: "\n\n" },
    { reg: / {2}/g, rep: "\n" },
  ];
  let des = desription;
  REPLACES.forEach((
    { reg, rep },
  ) => (des = des.replace(reg, rep)));
  return des.split("\n");
}
