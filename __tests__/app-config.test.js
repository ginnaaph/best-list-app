import assert from "node:assert/strict";
import test from "node:test";

import configureExpo from "../app.config.ts";

test("Expo config fails loudly without the Google iOS client ID", () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  try {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

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
  }
});

test("Expo config includes the Google Sign-In plugin when configured", () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  try {
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
  }
});
