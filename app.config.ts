import { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "./app.json";

const baseConfig = appJson.expo as ExpoConfig;

const bundleIdentifiers = {
  development: "com.gina.bestlist.dev",
  preview: "com.gina.bestlist.preview",
  production: "com.gina.bestlist",
} as const;

type AppVariant = keyof typeof bundleIdentifiers;

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
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: getBundleIdentifier(process.env.APP_VARIANT),
    },
    plugins: [...(baseConfig.plugins ?? []), ...googlePlugin],
  };
}

/**
 * Returns the iOS bundle identifier for the active app variant.
 *
 * @param appVariant - The APP_VARIANT environment value from the EAS build profile.
 * @returns The bundle identifier for known variants, defaulting to production.
 */
function getBundleIdentifier(appVariant: string | undefined) {
  if (appVariant && appVariant in bundleIdentifiers) {
    return bundleIdentifiers[appVariant as AppVariant];
  }

  return bundleIdentifiers.production;
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
