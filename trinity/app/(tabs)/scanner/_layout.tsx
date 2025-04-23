import { Stack } from "expo-router";

export default function ScannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Our two screens inside the "Scanner" tab */}
      <Stack.Screen name="index" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
