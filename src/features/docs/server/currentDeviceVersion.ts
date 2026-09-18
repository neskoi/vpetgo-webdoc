export function getCurrentDeviceVersion(): string {
  const version = process.env.VPETGO_CURRENT_DEVICE_VERSION?.trim();

  if (!version) {
    throw new Error(
      "VPETGO_CURRENT_DEVICE_VERSION environment variable is required."
    );
  }

  return version;
}
