import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
      <Sun className="h-4 w-4 text-primary" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4 text-primary" />
      <Label className="text-sm text-muted-foreground hidden sm:inline">
        {isDark ? "Dark" : "Light"} Mode
      </Label>
    </div>
  );
};

export default ThemeToggle;
