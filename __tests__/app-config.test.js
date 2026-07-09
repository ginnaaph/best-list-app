import assert from "node:assert/strict";
import test from "node:test";

import configureExpo from "../app.config.ts";

test("Expo config skips the Google iOS client ID outside EAS Build", () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const originalEasBuild = process.env.EAS_BUILD;

  try {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    delete process.env.EAS_BUILD;

    const config = configureExpo({ config: {} });

    assert.equal(
      config.plugins?.some((plugin) =>
        Array.isArray(plugin)
          ? plugin[0] === "@react-native-google-signin/google-signin"
          : plugin === "@react-native-google-signin/google-signin",
      ),
      false,
    );
  } finally {
    if (originalClientId === undefined) {
      delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    } else {
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = originalClientId;
    }

    if (originalEasBuild === undefined) {
      delete process.env.EAS_BUILD;
    } else {
      process.env.EAS_BUILD = originalEasBuild;
    }
  }
});

test("Expo config fails loudly without the Google iOS client ID during EAS Build", () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const originalEasBuild = process.env.EAS_BUILD;

  try {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    process.env.EAS_BUILD = "true";

    assert.throws(
      () => configureExpo({ config: {} }),
      /Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID\./,
    );
  } finally {
    if (originalClientId === undefined) {
      delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    } else {
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = originalClientId;
    }

    if (originalEasBuild === undefined) {
      delete process.env.EAS_BUILD;
    } else {
      process.env.EAS_BUILD = originalEasBuild;
    }
  }
});

test("Expo config includes the Google Sign-In plugin when configured", () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const originalEasBuild = process.env.EAS_BUILD;

  try {
    delete process.env.EAS_BUILD;
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID =
      "933206935850-snvqdu9gnckdmfk613d7vqodgf5id142.apps.googleusercontent.com";

    const config = configureExpo({ config: {} });

    assert.deepEqual(config.plugins?.at(-1), [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.933206935850-snvqdu9gnckdmfk613d7vqodgf5id142",
      },
    ]);
  } finally {
    if (originalClientId === undefined) {
      delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    } else {
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = originalClientId;
    }

    if (originalEasBuild === undefined) {
      delete process.env.EAS_BUILD;
    } else {
      process.env.EAS_BUILD = originalEasBuild;
    }
  }
});
