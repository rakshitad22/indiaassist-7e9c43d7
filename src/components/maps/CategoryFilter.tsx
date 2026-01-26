import { Badge } from "@/components/ui/badge";
import { PlaceCategory, categoryLabels, categoryIcons } from "@/data/indianPlaces";

interface CategoryFilterProps {
  selectedCategories: PlaceCategory[];
  onToggleCategory: (category: PlaceCategory) => void;
}

const allCategories: PlaceCategory[] = [
  "temple",
  "monument",
  "fort",
  "palace",
  "park",
  "beach",
  "lake",
  "waterfall",
  "museum",
  "market",
  "other",
];

const CategoryFilter = ({ selectedCategories, onToggleCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {allCategories.map((category) => {
        const isSelected = selectedCategories.includes(category);
        return (
          <Badge
            key={category}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-all hover:scale-105 px-3 py-1.5 text-sm ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-primary/10"
            }`}
            onClick={() => onToggleCategory(category)}
          >
            <span className="mr-1">{categoryIcons[category]}</span>
            {categoryLabels[category]}
          </Badge>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
