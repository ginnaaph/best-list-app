import { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "./app.json";

const baseConfig = appJson.expo as ExpoConfig;

export default function configureExpo({ config }: ConfigContext): ExpoConfig {
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const isEasBuild = process.env.EAS_BUILD === "true";

  assertGoogleIosClientIdConfigured(googleIosClientId, isEasBuild);

  const googlePlugin: NonNullable<ExpoConfig["plugins"]> = googleIosClientId
    ? [
        [
          "@react-native-google-signin/google-signin",
          { iosUrlScheme: getGoogleIosUrlScheme(googleIosClientId) },
        ],
      ]
    : [];

  return {
    ...config,
    ...baseConfig,
    plugins: [...(baseConfig.plugins ?? []), ...googlePlugin],
  };
}

function assertGoogleIosClientIdConfigured(
  clientId: string | undefined,
  isEasBuild: boolean,
): asserts clientId is string {
  if (!isEasBuild) {
    return;
  }

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
