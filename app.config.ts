import type { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "./app.json";

const baseConfig = appJson.expo as ExpoConfig;

export default function configureExpo({ config }: ConfigContext): ExpoConfig {
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  assertGoogleIosClientIdConfigured(googleIosClientId);

  const googlePlugin: NonNullable<ExpoConfig["plugins"]> = [
    [
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: getGoogleIosUrlScheme(googleIosClientId) },
    ],
  ];

  return {
    ...config,
    ...baseConfig,
    plugins: [...(baseConfig.plugins ?? []), ...googlePlugin],
  };
}

function assertGoogleIosClientIdConfigured(
  clientId: string | undefined,
): asserts clientId is string {
  if (!clientId) {
    throw new Error("Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.");
  }
}

function getGoogleIosUrlScheme(clientId: string) {
  const suffix = ".apps.googleusercontent.com";

  if (!clientId.endsWith(suffix)) {
    throw new Error(
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com.",
    );
  }

  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}
