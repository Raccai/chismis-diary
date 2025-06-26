import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from 'capacitor-native-biometric';

export async function promptBiometricAuth() {
  // Don't run on web/desktop
  if (!Capacitor.isNativePlatform()) {
    console.log("Biometric authentication is not available on the web.");
    return false;
  }

  try {
    // 1. Check if biometrics are available on the device
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) {
      // You could show a specific message to the user here
      console.warn("Biometrics are not set up on this device.");
      return false;
    }

    // 2. Trigger the biometric verification prompt
    const verified = await NativeBiometric.verifyIdentity({
      reason: "For easy and secure access",
      title: "Verify your identity",
      subtitle: "Log in using biometrics",
      description: "Place your finger on the sensor or look at the camera.",
    });

    if (verified) {
      console.log("Biometric authentication successful!");
      return true;
    }

  } catch (error) {
    // Handle errors, e.g., user cancelled the prompt
    console.error("Biometric authentication error:", error);
    // You can check error codes here if needed, e.g., error.code
  }
  
  // If we reach here, it means verification failed or was cancelled.
  return false;
}