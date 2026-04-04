/**
 * withTabletFullscreen.js
 * ─────────────────────────────────────────────────────────────
 * Expo config plugin that makes Android treat this app as
 * a proper tablet app — no letterboxing / black bars.
 *
 * Usage: add  "./withTabletFullscreen"  to plugins in app.json
 * ─────────────────────────────────────────────────────────────
 */

const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withTabletFullscreen(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    // ── 1. Tell Android this app supports large screens natively ──
    // Without this, Android letterboxes portrait-only apps on tablets.
    if (!manifest.manifest["supports-screens"]) {
      manifest.manifest["supports-screens"] = [{}];
    }
    manifest.manifest["supports-screens"][0].$ = {
      "android:smallScreens": "true",
      "android:normalScreens": "true",
      "android:largeScreens": "true",
      "android:xlargeScreens": "true", // tablets
      "android:resizeable": "true",
      "android:anyDensity": "true",
    };

    // ── 2. Remove any hardcoded portrait-only screen orientation ──
    // expo sets android:screenOrientation="portrait" when
    // app.json orientation = "portrait". We clear it so the
    // activity can rotate freely (or you can set "fullSensor").
    if (application.activity) {
      application.activity.forEach((activity) => {
        if (activity.$) {
          // Replace portrait lock with unspecified (follows system)
          if (
            activity.$["android:screenOrientation"] === "portrait" ||
            activity.$["android:screenOrientation"] === "sensorPortrait"
          ) {
            activity.$["android:screenOrientation"] = "unspecified";
          }

          // Ensure the activity resizes properly on large screens
          activity.$["android:resizeableActivity"] = "true";
          activity.$["android:configChanges"] =
            "keyboard|keyboardHidden|orientation|screenSize|uiMode|layoutDirection|locale|fontScale";
        }
      });
    }

    return config;
  });
};
