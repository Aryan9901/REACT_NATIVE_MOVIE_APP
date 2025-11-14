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

// Subcategory icon mappings
// All icons are located in assets/images/categories/SubCategories/

export const SUBCATEGORY_ICONS: Record<string, any> = {
  "1st to 12th": require("@/assets/images/categories/SubCategories/1st to 12th.webp"),
  Accessories: require("@/assets/images/categories/SubCategories/Accessories.webp"),
  Activities: require("@/assets/images/categories/SubCategories/Activities.webp"),
  "Adult Diapers": require("@/assets/images/categories/SubCategories/Adult Diapers.webp"),
  "Aerobics & Zumba": require("@/assets/images/categories/SubCategories/Aerobics & Zumba.webp"),
  "Art Gallery": require("@/assets/images/categories/SubCategories/Art Gallery.webp"),
  Arts: require("@/assets/images/categories/SubCategories/Arts.webp"),
  "Asian Sauces": require("@/assets/images/categories/SubCategories/Asian Sauces.webp"),
  "Atta, Rice & Dal": require("@/assets/images/categories/SubCategories/Atta, Rice & Dal.webp"),
  Atta: require("@/assets/images/categories/SubCategories/Atta.webp"),
  "Ayurvedic Centres": require("@/assets/images/categories/SubCategories/Ayurvedic Centres.webp"),
  "Baby Food": require("@/assets/images/categories/SubCategories/Baby Food.webp"),
  "Baby Oil and Powder": require("@/assets/images/categories/SubCategories/Baby Oil and Powder.webp"),
  "Baby Oral Care": require("@/assets/images/categories/SubCategories/Baby Oral Care.webp"),
  "Baby Shampoo and Gel": require("@/assets/images/categories/SubCategories/Baby Shampoo and Gel.webp"),
  "Baby Toys and Gifts": require("@/assets/images/categories/SubCategories/Baby Toys and Gifts.webp"),
  Backpacks: require("@/assets/images/categories/SubCategories/Backpacks.webp"),
  Badminton: require("@/assets/images/categories/SubCategories/Badminton.webp"),
  "Bags & School Needs": require("@/assets/images/categories/SubCategories/Bags & School Needs.webp"),
  "Band Aid and Wound Care": require("@/assets/images/categories/SubCategories/Band Aid and Wound Care.webp"),
  "Bath and Beauty Gifts": require("@/assets/images/categories/SubCategories/Bath and Beauty Gifts.webp"),
  "Bathroom & Kitchen Fittings": require("@/assets/images/categories/SubCategories/Bathroom & Kitchen Fittings.webp"),
  Batter: require("@/assets/images/categories/SubCategories/Batter.webp"),
  Batteries: require("@/assets/images/categories/SubCategories/Batteries.webp"),
  "Beauty Parlour": require("@/assets/images/categories/SubCategories/Beauty Parlour.webp"),
  Bedding: require("@/assets/images/categories/SubCategories/Bedding.webp"),
  "Besan, Sooji & Maida": require("@/assets/images/categories/SubCategories/Besan, Sooji & Maida.webp"),
  Bestsellers: require("@/assets/images/categories/SubCategories/Bestsellers.webp"),
  Beverages: require("@/assets/images/categories/SubCategories/Beverages.webp"),
  "Biscuits & Cookies": require("@/assets/images/categories/SubCategories/Biscuits & Cookies.webp"),
  Blinds: require("@/assets/images/categories/SubCategories/Blinds.webp"),
  "Body Lotion & Oils": require("@/assets/images/categories/SubCategories/Body Lotion & Oils.webp"),
  "Bread, Pav & Kulcha": require("@/assets/images/categories/SubCategories/Bread, Pav & Kulcha.webp"),
  Bread: require("@/assets/images/categories/SubCategories/Bread.webp"),
  "Bricks & Blocks": require("@/assets/images/categories/SubCategories/Bricks & Blocks.webp"),
  "Buns & Pav": require("@/assets/images/categories/SubCategories/Buns & Pav.webp"),
  Burger: require("@/assets/images/categories/SubCategories/Burger.webp"),
  Business: require("@/assets/images/categories/SubCategories/Business.webp"),
  "Butter & Cheese": require("@/assets/images/categories/SubCategories/Butter & Cheese.webp"),
  Cafe: require("@/assets/images/categories/SubCategories/Cafe.webp"),
  "Cakes & Pastries": require("@/assets/images/categories/SubCategories/Cakes & Pastries.webp"),
  "Cassata & Sandwich": require("@/assets/images/categories/SubCategories/Cassata & Sandwich.webp"),
  "Cat Food": require("@/assets/images/categories/SubCategories/Cat Food.webp"),
  Cement: require("@/assets/images/categories/SubCategories/Cement.webp"),
  Cereals: require("@/assets/images/categories/SubCategories/Cereals.webp"),
  "Chargers & Cables": require("@/assets/images/categories/SubCategories/Chargers & Cables.webp"),
  Chicken: require("@/assets/images/categories/SubCategories/Chicken.webp"),
  Children: require("@/assets/images/categories/SubCategories/Children.webp"),
  "Chips & Namkeen": require("@/assets/images/categories/SubCategories/Chips & Namkeen.webp"),
  "Cleaning Aids": require("@/assets/images/categories/SubCategories/Cleaning Aids.webp"),
  "Cloud Kitchens": require("@/assets/images/categories/SubCategories/Cloud Kitchens.webp"),
  Clutches: require("@/assets/images/categories/SubCategories/Clutches.webp"),
  "Coffee & Tea": require("@/assets/images/categories/SubCategories/Coffee & Tea.webp"),
  "Computer Glasses": require("@/assets/images/categories/SubCategories/Computer Glasses.webp"),
  Condoms: require("@/assets/images/categories/SubCategories/Condoms.webp"),
  Cones: require("@/assets/images/categories/SubCategories/Cones.webp"),
  "Construction Chemicals": require("@/assets/images/categories/SubCategories/Construction Chemicals.webp"),
  "Contact Lenses": require("@/assets/images/categories/SubCategories/Contact Lenses.webp"),
  "Cough and Cold": require("@/assets/images/categories/SubCategories/Cough and Cold.webp"),
  Cream: require("@/assets/images/categories/SubCategories/Cream.webp"),
  Cricket: require("@/assets/images/categories/SubCategories/Cricket.webp"),
  "Curd, Yogurt & lassi": require("@/assets/images/categories/SubCategories/Curd, Yogurt & lassi.webp"),
  "Curd,Yogurt & Lassi": require("@/assets/images/categories/SubCategories/Curd,Yogurt & Lassi.webp"),
  Curtains: require("@/assets/images/categories/SubCategories/Curtains.webp"),
  Cushions: require("@/assets/images/categories/SubCategories/Cushions.webp"),
  "Daipers & Wipes": require("@/assets/images/categories/SubCategories/Daipers & Wipes.webp"),
  Dance: require("@/assets/images/categories/SubCategories/Dance.webp"),
  "Decorative Lights": require("@/assets/images/categories/SubCategories/Decorative Lights.webp"),
  "Diaper and Wipes": require("@/assets/images/categories/SubCategories/Diaper and Wipes.webp"),
  "Digestive Care": require("@/assets/images/categories/SubCategories/Digestive Care.webp"),
  Dishwash: require("@/assets/images/categories/SubCategories/Dishwash.webp"),
  "Dog Food": require("@/assets/images/categories/SubCategories/Dog Food.webp"),
  "Drinks & Juices": require("@/assets/images/categories/SubCategories/Drinks & Juices.webp"),
  Drums: require("@/assets/images/categories/SubCategories/Drums.webp"),
  "Dry Cleaning": require("@/assets/images/categories/SubCategories/Dry Cleaning.webp"),
  "Dry Fruit Gift Packs": require("@/assets/images/categories/SubCategories/Dry Fruit Gift Packs.webp"),
  "Dry Fruits": require("@/assets/images/categories/SubCategories/Dry Fruits.webp"),
  "Earphones & Headsets": require("@/assets/images/categories/SubCategories/Earphones & Headsets.webp"),
  Electrical: require("@/assets/images/categories/SubCategories/Electrical.webp"),
  Enhancers: require("@/assets/images/categories/SubCategories/Enhancers.webp"),
  Events: require("@/assets/images/categories/SubCategories/Events.webp"),
  "Exotique Meat": require("@/assets/images/categories/SubCategories/Exotique Meat.webp"),
  "Extension Cables": require("@/assets/images/categories/SubCategories/Extension Cables.webp"),
  "Eye Makeup": require("@/assets/images/categories/SubCategories/Eye Makeup.webp"),
  Eyeglass: require("@/assets/images/categories/SubCategories/Eyeglass.webp"),
  "Face Cosmetics": require("@/assets/images/categories/SubCategories/Face Cosmetics.webp"),
  "Feminine Hygiene": require("@/assets/images/categories/SubCategories/Feminine Hygiene.webp"),
  "Festive Gifting": require("@/assets/images/categories/SubCategories/Festive Gifting.webp"),
  Fiction: require("@/assets/images/categories/SubCategories/Fiction.webp"),
  "Files & Office Needs": require("@/assets/images/categories/SubCategories/Files & Office Needs.webp"),
  "Fish & Sea Food": require("@/assets/images/categories/SubCategories/Fish & Sea Food.webp"),
  Florist: require("@/assets/images/categories/SubCategories/Florist.webp"),
  "Football & Volleyball": require("@/assets/images/categories/SubCategories/Football & Volleyball.webp"),
  "Fragrance and Talc": require("@/assets/images/categories/SubCategories/Fragrance and Talc.webp"),
  "Fresh Meat": require("@/assets/images/categories/SubCategories/Fresh Meat.webp"),
  Fresheners: require("@/assets/images/categories/SubCategories/Fresheners.webp"),
  Fruits: require("@/assets/images/categories/SubCategories/Fruits.webp"),
  "Gift Packs": require("@/assets/images/categories/SubCategories/Gift Packs.webp"),
  Gifting: require("@/assets/images/categories/SubCategories/Gifting.webp"),
  "Glue & Tape": require("@/assets/images/categories/SubCategories/Glue & Tape.webp"),
  "Grooming Needs": require("@/assets/images/categories/SubCategories/Grooming Needs.webp"),
  Guitar: require("@/assets/images/categories/SubCategories/Guitar.webp"),
  "Gym Wear": require("@/assets/images/categories/SubCategories/Gym Wear.webp"),
  Gym: require("@/assets/images/categories/SubCategories/Gym.webp"),
  Gymnastic: require("@/assets/images/categories/SubCategories/Gymnastic.webp"),
  "Hair Care": require("@/assets/images/categories/SubCategories/Hair Care.webp"),
  Handbags: require("@/assets/images/categories/SubCategories/Handbags.webp"),
  "Hardware Fixtures": require("@/assets/images/categories/SubCategories/Hardware Fixtures.webp"),
  "Health and Hygiene": require("@/assets/images/categories/SubCategories/Health and Hygiene.webp"),
  "Health and Wellness Equipments": require("@/assets/images/categories/SubCategories/Health and Wellness Equipments.webp"),
  "Healthcare Equipment": require("@/assets/images/categories/SubCategories/Healthcare Equipment.webp"),
  "Hearing Aids": require("@/assets/images/categories/SubCategories/Hearing Aids.webp"),
  Hobby: require("@/assets/images/categories/SubCategories/Hobby.webp"),
  "Home Appliances": require("@/assets/images/categories/SubCategories/Home Appliances.webp"),
  "Home Bakers": require("@/assets/images/categories/SubCategories/Home Bakers.webp"),
  "Home Chefs": require("@/assets/images/categories/SubCategories/Home Chefs.webp"),
  "Home Decor": require("@/assets/images/categories/SubCategories/Home Decor.webp"),
  "Home Furnishings": require("@/assets/images/categories/SubCategories/Home Furnishings.webp"),
  "Honey & Chyawanprash": require("@/assets/images/categories/SubCategories/Honey & Chyawanprash.webp"),
  "Honey and Chyawanprash": require("@/assets/images/categories/SubCategories/Honey and Chyawanprash.webp"),
  "Instant Mixes": require("@/assets/images/categories/SubCategories/Instant Mixes.webp"),
  Ironing: require("@/assets/images/categories/SubCategories/Ironing.webp"),
  "Jam & Spreads": require("@/assets/images/categories/SubCategories/Jam & Spreads.webp"),
  "Kids Playzone": require("@/assets/images/categories/SubCategories/Kids Playzone.webp"),
  "Kitchen and Wardrobe": require("@/assets/images/categories/SubCategories/Kitchen and Wardrobe.webp"),
  "Kitchen Appliances": require("@/assets/images/categories/SubCategories/Kitchen Appliances.webp"),
  Kulcha: require("@/assets/images/categories/SubCategories/Kulcha.webp"),
  Kurtis: require("@/assets/images/categories/SubCategories/Kurtis.webp"),
  "Laptop & Mobile Phones": require("@/assets/images/categories/SubCategories/Laptop & Mobile Phones.webp"),
  "Laptop Bag": require("@/assets/images/categories/SubCategories/Laptop Bag.webp"),
  "Laundry Essentials": require("@/assets/images/categories/SubCategories/Laundry Essentials.webp"),
  Laundry: require("@/assets/images/categories/SubCategories/Laundry.webp"),
  "Lip Cosmetics": require("@/assets/images/categories/SubCategories/Lip Cosmetics.webp"),
  Lubricants: require("@/assets/images/categories/SubCategories/Lubricants.webp"),
  "Machine and Car Care": require("@/assets/images/categories/SubCategories/Machine and Car Care.webp"),
  Maggi: require("@/assets/images/categories/SubCategories/Maggi.webp"),
  "Make up Artist": require("@/assets/images/categories/SubCategories/Make up Artist.webp"),
  "Male Salon": require("@/assets/images/categories/SubCategories/Male Salon.webp"),
  "Masks and Sanitizers": require("@/assets/images/categories/SubCategories/Masks and Sanitizers.webp"),
  Massagers: require("@/assets/images/categories/SubCategories/Massagers.webp"),
  "Men's Grooming": require("@/assets/images/categories/SubCategories/Men's Grooming.webp"),
  "Messenger Bag": require("@/assets/images/categories/SubCategories/Messenger Bag.webp"),
  "Milk & Eggs": require("@/assets/images/categories/SubCategories/Milk & Eggs.webp"),
  "Milk Bottle and Accessories": require("@/assets/images/categories/SubCategories/Milk Bottle and Accessories.webp"),
  "Mobile & Computer": require("@/assets/images/categories/SubCategories/Mobile & Computer.webp"),
  "Music Instruments": require("@/assets/images/categories/SubCategories/Music Instruments.webp"),
  Mutton: require("@/assets/images/categories/SubCategories/Mutton.webp"),
  "Nail Cosmetics": require("@/assets/images/categories/SubCategories/Nail Cosmetics.webp"),
  Newsletters: require("@/assets/images/categories/SubCategories/Newsletters.webp"),
  "Non-Fiction": require("@/assets/images/categories/SubCategories/Non-Fiction.webp"),
  "Notebooks & Diaries": require("@/assets/images/categories/SubCategories/Notebooks & Diaries.webp"),
  Nursery: require("@/assets/images/categories/SubCategories/Nursery.webp"),
  "Oil & Ghee": require("@/assets/images/categories/SubCategories/Oil & Ghee.webp"),
  "Oral Care": require("@/assets/images/categories/SubCategories/Oral Care.webp"),
  Organic: require("@/assets/images/categories/SubCategories/Organic.webp"),
  Organics: require("@/assets/images/categories/SubCategories/Organics.webp"),
  "Paan Corner": require("@/assets/images/categories/SubCategories/Paan Corner.webp"),
  "Pain Relief": require("@/assets/images/categories/SubCategories/Pain Relief.webp"),
  "Paneer & Tofu": require("@/assets/images/categories/SubCategories/Paneer & Tofu.webp"),
  Pasta: require("@/assets/images/categories/SubCategories/Pasta.webp"),
  Pathology: require("@/assets/images/categories/SubCategories/Pathology.webp"),
  "Pencils, Pens & Markers": require("@/assets/images/categories/SubCategories/Pencils, Pens & Markers.webp"),
  "Perfumes & Gifts set": require("@/assets/images/categories/SubCategories/Perfumes & Gifts set.webp"),
  "Pet Clinics": require("@/assets/images/categories/SubCategories/Pet Clinics.webp"),
  "Pet Training": require("@/assets/images/categories/SubCategories/Pet Training.webp"),
  "Pet Walkers & Boarding": require("@/assets/images/categories/SubCategories/Pet Walkers & Boarding.webp"),
  "Piano & Keyboard": require("@/assets/images/categories/SubCategories/Piano & Keyboard.webp"),
  "Pickles and Chutney": require("@/assets/images/categories/SubCategories/Pickles and Chutney.webp"),
  "Pizza Base": require("@/assets/images/categories/SubCategories/Pizza Base.webp"),
  "Plant Care": require("@/assets/images/categories/SubCategories/Plant Care.webp"),
  Plants: require("@/assets/images/categories/SubCategories/Plants.webp"),
  Plumbling: require("@/assets/images/categories/SubCategories/Plumbling.webp"),
  "Poha, Daliya & Other Grains": require("@/assets/images/categories/SubCategories/Poha, Daliya & Other Grains.webp"),
  "Pooja Needs": require("@/assets/images/categories/SubCategories/Pooja Needs.webp"),
  "Pots & Planters": require("@/assets/images/categories/SubCategories/Pots & Planters.webp"),
  "Powdered Spices": require("@/assets/images/categories/SubCategories/Powdered Spices.webp"),
  "Power Sunglasses": require("@/assets/images/categories/SubCategories/Power Sunglasses.webp"),
  "Pre Primary": require("@/assets/images/categories/SubCategories/Pre Primary.webp"),
  "Pre-Post Workout": require("@/assets/images/categories/SubCategories/Pre-Post Workout.webp"),
  "Professional Courses": require("@/assets/images/categories/SubCategories/Professional Courses.webp"),
  "Protein Supplements": require("@/assets/images/categories/SubCategories/Protein Supplements.webp"),
  "Radiology & Imaging": require("@/assets/images/categories/SubCategories/Radiology & Imaging.webp"),
  "Repellents and Disinfectants": require("@/assets/images/categories/SubCategories/Repellents and Disinfectants.webp"),
  Restaurants: require("@/assets/images/categories/SubCategories/Restaurants.webp"),
  "Rice & Dal": require("@/assets/images/categories/SubCategories/Rice & Dal.webp"),
  Rugs: require("@/assets/images/categories/SubCategories/Rugs.webp"),
  "Salt & Sugar": require("@/assets/images/categories/SubCategories/Salt & Sugar.webp"),
  "Sand & Aggregates": require("@/assets/images/categories/SubCategories/Sand & Aggregates.webp"),
  Sandwich: require("@/assets/images/categories/SubCategories/Sandwich.webp"),
  Sanitaryware: require("@/assets/images/categories/SubCategories/Sanitaryware.webp"),
  Sarees: require("@/assets/images/categories/SubCategories/Sarees.webp"),
  "Sauces & Spreads": require("@/assets/images/categories/SubCategories/Sauces & Spreads.webp"),
  "Sausage, Salami & Ham": require("@/assets/images/categories/SubCategories/Sausage, Salami & Ham.webp"),
  "School Shoes": require("@/assets/images/categories/SubCategories/School Shoes.webp"),
  Seeds: require("@/assets/images/categories/SubCategories/Seeds.webp"),
  "Shakes & Coolers": require("@/assets/images/categories/SubCategories/Shakes & Coolers.webp"),
  Shakes: require("@/assets/images/categories/SubCategories/Shakes.webp"),
  "Shoe Care": require("@/assets/images/categories/SubCategories/Shoe Care.webp"),
  Shoes: require("@/assets/images/categories/SubCategories/Shoes.webp"),
  Skincare: require("@/assets/images/categories/SubCategories/Skincare.webp"),
  "Slimming Centre": require("@/assets/images/categories/SubCategories/Slimming Centre.webp"),
  "Smart Watches": require("@/assets/images/categories/SubCategories/Smart Watches.webp"),
  "Snacks & Savouries": require("@/assets/images/categories/SubCategories/Snacks & Savouries.webp"),
  Snacks: require("@/assets/images/categories/SubCategories/Snacks.webp"),
  "Soaps & Gel": require("@/assets/images/categories/SubCategories/Soaps & Gel.webp"),
  "South Indian Special": require("@/assets/images/categories/SubCategories/South Indian Special.webp"),
  Speakers: require("@/assets/images/categories/SubCategories/Speakers.webp"),
  "Speciality Food": require("@/assets/images/categories/SubCategories/Speciality Food.webp"),
  Spices: require("@/assets/images/categories/SubCategories/Spices.webp"),
  "Sports & Gym": require("@/assets/images/categories/SubCategories/Sports & Gym.webp"),
  "Sports Academy": require("@/assets/images/categories/SubCategories/Sports Academy.webp"),
  Sticks: require("@/assets/images/categories/SubCategories/Sticks.webp"),
  "Stoles & Shawls": require("@/assets/images/categories/SubCategories/Stoles & Shawls.webp"),
  Suits: require("@/assets/images/categories/SubCategories/Suits.webp"),
  Sunglasses: require("@/assets/images/categories/SubCategories/Sunglasses.webp"),
  "Supplements & Nourishments": require("@/assets/images/categories/SubCategories/Supplements & Nourishments.webp"),
  "Sweets & Chocolates": require("@/assets/images/categories/SubCategories/Sweets & Chocolates.webp"),
  "Swimming Pool": require("@/assets/images/categories/SubCategories/Swimming Pool.webp"),
  Swimming: require("@/assets/images/categories/SubCategories/Swimming.webp"),
  "Tea & Coffee": require("@/assets/images/categories/SubCategories/Tea & Coffee.webp"),
  "Tennis & Squash": require("@/assets/images/categories/SubCategories/Tennis & Squash.webp"),
  "TMT Steel Bars": require("@/assets/images/categories/SubCategories/TMT Steel Bars.webp"),
  "Tomato & Chilli Ketchup": require("@/assets/images/categories/SubCategories/Tomato & Chilli Ketchup.webp"),
  "Toys & Accessories": require("@/assets/images/categories/SubCategories/Toys & Accessories.webp"),
  "Toys & Games": require("@/assets/images/categories/SubCategories/Toys & Games.webp"),
  Treats: require("@/assets/images/categories/SubCategories/Treats.webp"),
  "Trimmers & Hair Appliances": require("@/assets/images/categories/SubCategories/Trimmers & Hair Appliances.webp"),
  "Tubs & Cups": require("@/assets/images/categories/SubCategories/Tubs & Cups.webp"),
  Ukelele: require("@/assets/images/categories/SubCategories/Ukelele.webp"),
  "Unisex Salon": require("@/assets/images/categories/SubCategories/Unisex Salon.webp"),
  "Unstitched Suits": require("@/assets/images/categories/SubCategories/Unstitched Suits.webp"),
  Upholstery: require("@/assets/images/categories/SubCategories/Upholstery.webp"),
  "UPVC Door & Windows": require("@/assets/images/categories/SubCategories/UPVC Door & Windows.webp"),
  Utilities: require("@/assets/images/categories/SubCategories/Utilities.webp"),
  Vegetables: require("@/assets/images/categories/SubCategories/Vegetables.webp"),
  "Vitamins & Daily Nutrition": require("@/assets/images/categories/SubCategories/Vitamins & Daily Nutrition.webp"),
  "Vitamins and Supplements": require("@/assets/images/categories/SubCategories/Vitamins and Supplements.webp"),
  Vocal: require("@/assets/images/categories/SubCategories/Vocal.webp"),
  "Waist Pouch": require("@/assets/images/categories/SubCategories/Waist Pouch.webp"),
  Wallpaper: require("@/assets/images/categories/SubCategories/Wallpaper.webp"),
  "Whole Spices": require("@/assets/images/categories/SubCategories/Whole Spices.webp"),
  "Women's Grooming": require("@/assets/images/categories/SubCategories/Women's Grooming.webp"),
  "Wooden Products": require("@/assets/images/categories/SubCategories/Wooden Products.webp"),
  "Yoga Mat & Yoga Pants": require("@/assets/images/categories/SubCategories/Yoga Mat & Yoga Pants.webp"),
  Yoga: require("@/assets/images/categories/SubCategories/Yoga.webp"),
  "Young Adult": require("@/assets/images/categories/SubCategories/Young Adult.webp"),
};

/**
 * Get subcategory icon from the mapping
 * @param subCategoryName - The exact subcategory name
 * @returns The icon source or null if not found
 */
export const getSubCategoryIcon = (subCategoryName: string) => {
  // Try exact match first
  if (SUBCATEGORY_ICONS[subCategoryName]) {
    return SUBCATEGORY_ICONS[subCategoryName];
  }

  // Try case-insensitive match
  const lowerSubCategoryName = subCategoryName.toLowerCase();
  for (const [key, value] of Object.entries(SUBCATEGORY_ICONS)) {
    if (key.toLowerCase() === lowerSubCategoryName) {
      return value;
    }
  }

  return null;
};
