import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const entryFormSource = await readFile(
  new URL("../components/entry-form.tsx", import.meta.url),
  "utf8",
);
const editProfileSource = await readFile(
  new URL("../app/edit-profile.tsx", import.meta.url),
  "utf8",
);
const setupHandleSource = await readFile(
  new URL("../app/setup-handle.tsx", import.meta.url),
  "utf8",
);
const appConfig = JSON.parse(
  await readFile(new URL("../app.json", import.meta.url), "utf8"),
);

test("entry photos offer camera and photo library choices", () => {
  assert.match(entryFormSource, /Alert\.alert\("Add Photo", undefined, \[/);
  assert.match(entryFormSource, /text: "Take Photo"/);
  assert.match(entryFormSource, /text: "Choose from Library"/);
  assert.match(entryFormSource, /requestCameraPermissionsAsync\(\)/);
  assert.match(entryFormSource, /launchCameraAsync\(\{[\s\S]*?aspect: \[4, 3\]/);
});

test("profile avatars offer camera and photo library choices", () => {
  assert.match(editProfileSource, /Alert\.alert\("Change Photo", undefined, \[/);
  assert.match(editProfileSource, /text: "Take Photo"/);
  assert.match(editProfileSource, /text: "Choose from Library"/);
  assert.match(editProfileSource, /requestCameraPermissionsAsync\(\)/);
  assert.match(editProfileSource, /launchCameraAsync\(\{[\s\S]*?aspect: \[1, 1\]/);
  assert.match(editProfileSource, /"Camera access needed"/);
});

test("setup avatars offer camera and photo library choices", () => {
  assert.match(setupHandleSource, /Alert\.alert\("Add Photo", undefined, \[/);
  assert.match(setupHandleSource, /text: "Take Photo"/);
  assert.match(setupHandleSource, /text: "Choose from Library"/);
  assert.match(setupHandleSource, /requestCameraPermissionsAsync\(\)/);
  assert.match(
    setupHandleSource,
    /launchCameraAsync\(\{[\s\S]*?aspect: \[1, 1\]/,
  );
  assert.match(setupHandleSource, /"Camera access needed"/);
});

test("iOS and expo-image-picker declare matching photo permissions", () => {
  const infoPlist = appConfig.expo.ios.infoPlist;
  const imagePickerPlugin = appConfig.expo.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-image-picker",
  );

  assert.equal(
    infoPlist.NSCameraUsageDescription,
    "BestList uses your camera so you can snap a photo of a dish to attach to your entry.",
  );
  assert.equal(
    infoPlist.NSPhotoLibraryUsageDescription,
    "BestList accesses your photo library so you can attach an existing photo of a dish to your entry.",
  );
  assert.deepEqual(imagePickerPlugin, [
    "expo-image-picker",
    {
      cameraPermission:
        "BestList uses your camera so you can snap a photo of a dish to attach to your entry.",
      photosPermission:
        "BestList accesses your photo library so you can attach an existing photo of a dish to your entry.",
    },
  ]);
});
