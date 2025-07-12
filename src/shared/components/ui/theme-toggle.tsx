import { Moon, Sun } from "lucide-react";

import { Switch } from "@ui/switch";
import { useTheme } from "@hooks/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Determine checked state: true for dark, false for light
  const checked = theme === "dark";

  const handleChange = () => {
    setTheme(checked ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-5 w-5 ${!checked ? "text-yellow-500" : "text-gray-400"}`}
      />
      <Switch checked={checked} onCheckedChange={handleChange} />
      <Moon
        className={`h-5 w-5 ${checked ? "text-blue-500" : "text-gray-400"}`}
      />
    </div>
  );
}
