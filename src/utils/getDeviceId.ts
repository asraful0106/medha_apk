import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "device_id_v1";

export async function getDeviceId(): Promise<string> {
  try {
    // 1. Try to get stored ID first (works for both iOS & Android)
    let storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (storedId) return storedId;

    let deviceId: string | null = null;

    // 2. Platform-specific strategy
    if (Platform.OS === "android") {
      // androidId is best available stable ID
      deviceId = Application.getAndroidId() ?? null;
    } else if (Platform.OS === "ios") {
      // iOS: no reliable permanent ID allowed
      // Use IDFV as a base if available
      deviceId = Application.getIosIdForVendorAsync
        ? await Application.getIosIdForVendorAsync()
        : null;
    }

    // 3. Fallback to generated UUID
    if (!deviceId) {
      deviceId = uuidv4();
    }

    // 4. Normalize (optional but good practice)
    deviceId = `dev_${Platform.OS}_${deviceId}`;

    // 5. Store securely
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });

    return deviceId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // 6. Absolute fallback (should never fail)
    return `dev_fallback_${uuidv4()}`;
  }
}
