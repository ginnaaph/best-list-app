import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentSource = await readFile(
  new URL("./verification-modal.tsx", import.meta.url),
  "utf8",
);

test("uses a full-row invisible verification input so native paste can attach", () => {
  assert.doesNotMatch(
    componentSource,
    /className="absolute h-0 w-0 opacity-0"/,
  );
  assert.match(
    componentSource,
    /className="absolute inset-0 z-10 h-full w-full bg-transparent p-0"/,
  );
  assert.match(componentSource, /caretHidden/);
  assert.match(componentSource, /style=\{\{ color: "transparent" \}\}/);
  assert.doesNotMatch(componentSource, /contextMenuHidden/);
});

test("keeps the visible digit boxes decorative under the real input", () => {
  assert.match(
    componentSource,
    /<View className="relative mt-8 flex-row justify-between gap-2">/,
  );
  assert.doesNotMatch(
    componentSource,
    /<Pressable\s+className="mt-8 flex-row justify-between gap-2"\s+onPress=\{\(\) => inputRef\.current\?\.focus\(\)\}/,
  );
});
