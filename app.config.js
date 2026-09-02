import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const appJson = require("./app.json");

const bundleIdentifiers = {
  development: "com.gina.bestlist.dev",
  preview: "com.gina.bestlist.preview",
  production: "com.gina.bestlist",
};

export default function configureExpo({ config }) {
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const isEasBuild = process.env.EAS_BUILD === "true";
  assertGoogleIosClientIdConfigured(googleIosClientId, isEasBuild);

  const googlePlugin = googleIosClientId
    ? [
        [
          "@react-native-google-signin/google-signin",
          { iosUrlScheme: getGoogleIosUrlScheme(googleIosClientId) },
        ],
      ]
    : [];

  return {
    ...config,
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: getBundleIdentifier(process.env.APP_VARIANT),
    },
    plugins: [...(appJson.expo.plugins ?? []), ...googlePlugin],
  };
}

function getBundleIdentifier(appVariant) {
  if (appVariant && Object.hasOwn(bundleIdentifiers, appVariant)) {
    return bundleIdentifiers[appVariant];
  }
  return bundleIdentifiers.production;
}

function assertGoogleIosClientIdConfigured(clientId, isEasBuild) {
  if (!isEasBuild) return;
  if (!clientId) throw new Error("Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.");
}

function getGoogleIosUrlScheme(clientId) {
  const suffix = ".apps.googleusercontent.com";
  if (!clientId.endsWith(suffix)) {
    throw new Error(
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com.",
    );
  }
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}
