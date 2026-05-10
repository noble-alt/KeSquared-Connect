import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useSettings } from "@/contexts/SettingsContext";

/**
 * Returns the design tokens for the current color scheme.
 * Respects the user's theme preference from SettingsContext:
 *   "system" → follows device dark/light mode
 *   "light"  → always light
 *   "dark"   → always dark
 */
export function useColors() {
  const scheme = useColorScheme();
  const { settings } = useSettings();

  const pref = settings.themePreference;
  const effective =
    pref === "system" ? scheme : pref;

  const palette =
    effective === "dark" && "dark" in colors
      ? (colors as unknown as { dark: typeof colors.light }).dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
