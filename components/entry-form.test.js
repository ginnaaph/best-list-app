import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("./entry-form.tsx", import.meta.url),
  "utf8",
);

test("autocomplete waits for a user edit before using prefilled values", () => {
  assert.match(
    source,
    /const \[hasEditedPlace, setHasEditedPlace\] = useState\(false\)/,
  );
  assert.match(
    source,
    /const \[hasEditedCity, setHasEditedCity\] = useState\(false\)/,
  );
  assert.match(source, /if \(!hasEditedPlace \|\| isSelectingPlace\)/);
  assert.match(source, /if \(!hasEditedCity \|\| isSelectingCity\)/);
  assert.match(source, /setHasEditedPlace\(true\)/);
  assert.match(source, /setHasEditedCity\(true\)/);
});
