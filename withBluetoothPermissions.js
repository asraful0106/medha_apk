// withBluetoothPermissions.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom Expo config plugin that injects all Bluetooth + Location permissions
// required for react-native-ble-plx across Android API 6–34 and iOS.
//
// Usage in app.json:
//   "plugins": ["./withBluetoothPermissions"]
//
// No extra npm package needed — uses only @expo/config-plugins which is already
// a dependency of every Expo project.
// ─────────────────────────────────────────────────────────────────────────────

const { withAndroidManifest, withInfoPlist } = require("@expo/config-plugins");

// ── Android ───────────────────────────────────────────────────────────────────
const ANDROID_PERMISSIONS = [
  // API < 31 — install-time "normal" permissions (granted automatically at install)
  "android.permission.BLUETOOTH",
  "android.permission.BLUETOOTH_ADMIN",
  // API >= 31 — runtime permissions (must be requested via dialog)
  "android.permission.BLUETOOTH_SCAN",
  "android.permission.BLUETOOTH_CONNECT",
  // Required for BLE scanning on API < 31
  "android.permission.ACCESS_FINE_LOCATION",
  // Required for BLE scanning on API < 29 (still harmless to declare on newer)
  "android.permission.ACCESS_COARSE_LOCATION",
];

// BLUETOOTH_SCAN on API 31+ can be declared with android:usesPermissionFlags="neverForLocation"
// if your app never uses scan results to derive location. This avoids the location
// runtime prompt on Android 12+ for users who only need printing.
const BLUETOOTH_SCAN_FLAGS = "neverForLocation";

function withAndroidBluetooth(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const mainApp = manifest.manifest;

    if (!mainApp["uses-permission"]) {
      mainApp["uses-permission"] = [];
    }

    const existing = new Set(
      mainApp["uses-permission"]
        .map((p) => p.$?.["android:name"])
        .filter(Boolean),
    );

    for (const perm of ANDROID_PERMISSIONS) {
      if (existing.has(perm)) continue;

      const entry =
        perm === "android.permission.BLUETOOTH_SCAN"
          ? {
              $: {
                "android:name": perm,
                "android:usesPermissionFlags": BLUETOOTH_SCAN_FLAGS,
              },
            }
          : { $: { "android:name": perm } };

      mainApp["uses-permission"].push(entry);
    }

    return cfg;
  });
}

// ── iOS ───────────────────────────────────────────────────────────────────────
// NSBluetoothAlwaysUsageDescription is already injected by the react-native-ble-plx
// plugin. We add it here as a safety net in case the ble-plx plugin ever changes.
function withIosBluetooth(config) {
  return withInfoPlist(config, (cfg) => {
    const plist = cfg.modResults;

    if (!plist.NSBluetoothAlwaysUsageDescription) {
      plist.NSBluetoothAlwaysUsageDescription =
        "Allow $(BUNDLE_DISPLAY_NAME) to connect to Bluetooth thermal printers.";
    }

    // Legacy key — required on iOS < 13
    if (!plist.NSBluetoothPeripheralUsageDescription) {
      plist.NSBluetoothPeripheralUsageDescription =
        "Allow $(BUNDLE_DISPLAY_NAME) to connect to Bluetooth thermal printers.";
    }

    return cfg;
  });
}

// ── Combined plugin ───────────────────────────────────────────────────────────
const withBluetoothPermissions = (config) => {
  config = withAndroidBluetooth(config);
  config = withIosBluetooth(config);
  return config;
};

module.exports = withBluetoothPermissions;
