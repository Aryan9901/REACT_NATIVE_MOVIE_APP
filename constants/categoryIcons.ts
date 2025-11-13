// Category icon mappings
// All icons are located in assets/images/categories/

export const CATEGORY_ICONS: Record<string, any> = {
  All: require("@/assets/images/categories/ALL2.webp"),
  "Baby Care": require("@/assets/images/categories/Baby Care.webp"),
  "Bakery, Cakes & Dairy": require("@/assets/images/categories/Bakery, Cakes & Dairy.webp"),
  Books: require("@/assets/images/categories/Books.webp"),
  "Chicken, Meat & Fish": require("@/assets/images/categories/Chicken, Meat & Fish.webp"),
  "Construction Material": require("@/assets/images/categories/Construction Material.webp"),
  "Decor & Gifting": require("@/assets/images/categories/Decor & Gifting.webp"),
  Diagnostic: require("@/assets/images/categories/Diagnostic.webp"),
  "Dry Fruits & Cereals": require("@/assets/images/categories/Dry Fruits & Cereals.webp"),
  "Electronics & Appliances": require("@/assets/images/categories/Electronics & Appliances.webp"),
  "Fabric Care": require("@/assets/images/categories/Fabric Care.webp"),
  "Fitness & Sports": require("@/assets/images/categories/Fitness & Sports.webp"),
  "Food & Beverage": require("@/assets/images/categories/Food & Beverage.webp"),
  "Fruits & Vegetables": require("@/assets/images/categories/Fruits & Vegetables.webp"),
  "Garden & Farm": require("@/assets/images/categories/Garden & Farm.webp"),
  "Glam & Beauty": require("@/assets/images/categories/Glam & Beauty.webp"),
  Grocery: require("@/assets/images/categories/Grocery.webp"),
  "Handbags & Clutches": require("@/assets/images/categories/Handbags & Clutches.webp"),
  "Health & Pharma": require("@/assets/images/categories/Health & Pharma.webp"),
  "Home Care": require("@/assets/images/categories/Home Care.webp"),
  Icecreams: require("@/assets/images/categories/Icecreams.webp"),
  "Instant and Frozen Food": require("@/assets/images/categories/Instant and Frozen Food.webp"),
  "Makeup & Beauty": require("@/assets/images/categories/Makeup & Beauty.webp"),
  "Music, Dance & Arts": require("@/assets/images/categories/Music, Dance & Arts.webp"),
  Newsletters: require("@/assets/images/categories/Newsletters.webp"),
  Optical: require("@/assets/images/categories/Optical.webp"),
  "Personal Care": require("@/assets/images/categories/Personal Care.webp"),
  "Pet Care": require("@/assets/images/categories/Pet Care.webp"),
  "Sexual Wellness": require("@/assets/images/categories/Sexual Wellness.webp"),
  "Snacks & Drinks": require("@/assets/images/categories/Snacks & Drinks.webp"),
  "Sports Store": require("@/assets/images/categories/Sports Store.webp"),
  "Stationery & Games": require("@/assets/images/categories/Stationery & Games.webp"),
  Uniform: require("@/assets/images/categories/Uniform.webp"),
  "Women Wear": require("@/assets/images/categories/Women Wear.webp"),
};

/**
 * Get category icon from the mapping
 * @param categoryName - The exact category name
 * @returns The icon source or null if not found
 */
export const getCategoryIcon = (categoryName: string) => {
  // Try exact match first
  if (CATEGORY_ICONS[categoryName]) {
    return CATEGORY_ICONS[categoryName];
  }

  // Try case-insensitive match
  const lowerCategoryName = categoryName.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
    if (key.toLowerCase() === lowerCategoryName) {
      return value;
    }
  }

  return null;
};

/**
 * Get fallback Ionicon name based on category keywords
 * @param category - The category name
 * @returns Ionicon name
 */
export const getFallbackIconName = (category: string): string => {
  const lower = category.toLowerCase();

  if (category === "All") return "grid";
  if (
    lower.includes("bakery") ||
    lower.includes("cake") ||
    lower.includes("dairy")
  )
    return "cafe";
  if (lower.includes("book")) return "book";
  if (lower.includes("decor") || lower.includes("gift")) return "bulb";
  if (
    lower.includes("vegetable") ||
    lower.includes("fruit") ||
    lower.includes("grocery")
  )
    return "nutrition";
  if (
    lower.includes("salon") ||
    lower.includes("beauty") ||
    lower.includes("glam") ||
    lower.includes("makeup")
  )
    return "cut";
  if (lower.includes("florist") || lower.includes("flower")) return "flower";
  if (
    lower.includes("pharmacy") ||
    lower.includes("medical") ||
    lower.includes("health") ||
    lower.includes("diagnostic")
  )
    return "medical";
  if (
    lower.includes("restaurant") ||
    lower.includes("food") ||
    lower.includes("beverage")
  )
    return "restaurant";
  if (lower.includes("electronics") || lower.includes("appliance"))
    return "phone-portrait";
  if (
    lower.includes("fashion") ||
    lower.includes("clothing") ||
    lower.includes("wear")
  )
    return "shirt";
  if (lower.includes("baby") || lower.includes("care")) return "heart";
  if (lower.includes("pet")) return "paw";
  if (lower.includes("sport") || lower.includes("fitness")) return "fitness";
  if (lower.includes("construction") || lower.includes("material"))
    return "construct";
  if (lower.includes("garden") || lower.includes("farm")) return "leaf";
  if (lower.includes("optical")) return "glasses";
  if (
    lower.includes("music") ||
    lower.includes("dance") ||
    lower.includes("art")
  )
    return "musical-notes";
  if (lower.includes("stationery") || lower.includes("game"))
    return "game-controller";
  if (lower.includes("handbag") || lower.includes("clutch")) return "bag";
  if (lower.includes("icecream")) return "ice-cream";
  if (lower.includes("snack") || lower.includes("drink")) return "fast-food";

  return "storefront";
};
