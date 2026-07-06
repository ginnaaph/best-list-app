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

test("iOS and expo-image-picker declare matching photo permissions", () => {
  const infoPlist = appConfig.expo.ios.infoPlist;
  const imagePickerPlugin = appConfig.expo.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-image-picker",
  );

  assert.equal(
    infoPlist.NSCameraUsageDescription,
    "Allow BestList to use your camera to take photos.",
  );
  assert.equal(
    infoPlist.NSPhotoLibraryUsageDescription,
    "Allow BestList to access your photo library to choose photos.",
  );
  assert.deepEqual(imagePickerPlugin, [
    "expo-image-picker",
    {
      cameraPermission: "Allow BestList to use your camera to take photos.",
      photosPermission:
        "Allow BestList to access your photo library to choose photos.",
    },
  ]);
});
