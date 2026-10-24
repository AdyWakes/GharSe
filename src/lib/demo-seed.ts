// Demo data: one home food maker with two fully worked products.
// "Besan Ladoo" is deliberately underpriced so the price-below-cost warning fires.
//
// Everything here is fictional demo data. Ingredient prices are the maker's own
// entries for the demo (editable), not market statistics.
//
// Grams for litre-based ingredients are hard-coded for now. Phase 2 moves every
// conversion into src/core/units.ts and this file will call it instead.
import type { PrismaClient } from "@prisma/client";

export const DEMO_PHONE = "+919999900001";

type SeedIngredient = {
  key: string;
  spoken: string;
  qty: number;
  unit: string;
  grams: number;
  note?: string;
};

const AAM_KA_ACHAAR: SeedIngredient[] = [
  { key: "raw_mango", spoken: "kaccha aam", qty: 5, unit: "kg", grams: 5000 },
  { key: "mustard_oil", spoken: "sarson ka tel", qty: 1, unit: "l", grams: 910, note: "1 litre mustard oil at 0.91 g/ml" },
  { key: "salt", spoken: "namak", qty: 600, unit: "g", grams: 600 },
  { key: "red_chilli_powder", spoken: "lal mirch", qty: 200, unit: "g", grams: 200 },
  { key: "fennel_seeds", spoken: "saunf", qty: 150, unit: "g", grams: 150 },
  { key: "mustard_seeds_split", spoken: "rai kuria", qty: 150, unit: "g", grams: 150 },
  { key: "turmeric_powder", spoken: "haldi", qty: 100, unit: "g", grams: 100 },
  { key: "fenugreek_seeds", spoken: "methi dana", qty: 100, unit: "g", grams: 100 },
  { key: "nigella_seeds", spoken: "kalonji", qty: 30, unit: "g", grams: 30 },
  { key: "asafoetida_compounded", spoken: "hing", qty: 10, unit: "g", grams: 10 },
];

const BESAN_LADOO: SeedIngredient[] = [
  { key: "besan", spoken: "besan", qty: 1, unit: "kg", grams: 1000 },
  { key: "sugar_powdered", spoken: "bura", qty: 800, unit: "g", grams: 800 },
  { key: "ghee", spoken: "desi ghee", qty: 600, unit: "g", grams: 600 },
  { key: "almonds", spoken: "badam", qty: 50, unit: "g", grams: 50 },
  { key: "cardamom", spoken: "elaichi", qty: 10, unit: "g", grams: 10 },
];

// The maker's own prices (per kg, or per litre for mustard oil).
const PRICES: { key: string; price: number; basis?: "kg" | "litre" }[] = [
  { key: "raw_mango", price: 60 },
  { key: "mustard_oil", price: 180, basis: "litre" },
  { key: "salt", price: 25 },
  { key: "red_chilli_powder", price: 400 },
  { key: "fennel_seeds", price: 300 },
  { key: "mustard_seeds_split", price: 200 },
  { key: "turmeric_powder", price: 300 },
  { key: "fenugreek_seeds", price: 150 },
  { key: "nigella_seeds", price: 400 },
  { key: "asafoetida_compounded", price: 2000 },
  { key: "besan", price: 100 },
  { key: "sugar_powdered", price: 50 },
  { key: "ghee", price: 650 },
  { key: "almonds", price: 900 },
  { key: "cardamom", price: 3000 },
];

/** Deletes the demo seller (cascades to everything she owns) and re-creates it. */
export async function seedDemo(db: PrismaClient) {
  await db.seller.deleteMany({ where: { OR: [{ isDemo: true }, { phone: DEMO_PHONE }] } });
  await seedStakeholders(db);

  const officer = await db.foodSafetyOfficer.findFirst({ where: { district: "Ghaziabad" } });

  const seller = await db.seller.create({
    data: {
      phone: DEMO_PHONE,
      name: "Sunita Sharma",
      language: "hi",
      kitchenAddress: "Makan 12, Gali 4, Shastri Nagar",
      city: "Ghaziabad",
      district: "Ghaziabad",
      state: "Uttar Pradesh",
      pincode: "201002",
      customerCareContact: DEMO_PHONE,
      fssaiStatus: "none",
      annualTurnoverInr: 300000,
      isDemo: true,
      officerId: officer?.id,
    },
  });

  await db.ingredientPrice.createMany({
    data: PRICES.map((p) => ({
      sellerId: seller.id,
      ingredientKey: p.key,
      pricePerKgInr: p.price,
      priceBasis: p.basis ?? "kg",
      source: "maker",
    })),
  });

  const achaar = await createProduct(db, seller.id, {
    slug: "AAC",
    nameHi: "आम का अचार",
    nameEn: "Aam ka Achaar (Mango Pickle)",
    category: "pickle",
    unitName: "jar",
    packSizeG: 400,
    currentPriceInr: 180,
    shelfLifeDays: 365,
    storageInstructions: "Store in a cool, dry place. Use a dry spoon. Keep the pickle covered with oil.",
    batchYieldG: 6200,
    ingredients: AAM_KA_ACHAAR,
    sourceText: "5 kilo kaccha aam, 1 litre sarson ka tel, 600 gram namak, 200 gram lal mirch, ...",
  });

  const ladoo = await createProduct(db, seller.id, {
    slug: "BLD",
    nameHi: "बेसन के लड्डू",
    nameEn: "Besan Ladoo",
    category: "sweet",
    unitName: "box",
    packSizeG: 250,
    currentPriceInr: 100, // deliberately below cost for the demo warning
    shelfLifeDays: 20,
    storageInstructions: "Store in an airtight box in a cool, dry place.",
    batchYieldG: 2400,
    ingredients: BESAN_LADOO,
    sourceText: "1 kilo besan, 800 gram bura, 600 gram desi ghee, 50 gram badam, 10 gram elaichi",
  });

  await db.message.create({
    data: {
      sellerId: seller.id,
      channel: "sim",
      direction: "out",
      kind: "text",
      text:
        "नमस्ते सुनीता जी! आपके दो प्रोडक्ट, *आम का अचार* और *बेसन के लड्डू*, GharSe में हैं।\n" +
        "नया प्रोडक्ट जोड़ना हो तो उसकी रेसिपी बोलकर भेजें।",
    },
  });

  return { seller, products: [achaar, ladoo] };
}

async function createProduct(
  db: PrismaClient,
  sellerId: string,
  p: {
    slug: string;
    nameHi: string;
    nameEn: string;
    category: string;
    unitName: string;
    packSizeG: number;
    currentPriceInr: number;
    shelfLifeDays: number;
    storageInstructions: string;
    batchYieldG: number;
    ingredients: SeedIngredient[];
    sourceText: string;
  },
) {
  return db.product.create({
    data: {
      sellerId,
      slug: p.slug,
      nameHi: p.nameHi,
      nameEn: p.nameEn,
      category: p.category,
      foodType: "veg",
      unitName: p.unitName,
      packSizeG: p.packSizeG,
      currentPriceInr: p.currentPriceInr,
      shelfLifeDays: p.shelfLifeDays,
      shelfLifeSource: "maker_estimate",
      storageInstructions: p.storageInstructions,
      recipes: {
        create: {
          version: 1,
          status: "confirmed",
          batchYieldG: p.batchYieldG,
          yieldSource: "maker_stated",
          sourceType: "seed",
          sourceText: p.sourceText,
          confirmedAt: new Date(),
          ingredients: {
            create: p.ingredients.map((i, idx) => ({
              position: idx,
              ingredientKey: i.key,
              spokenName: i.spoken,
              quantity: i.qty,
              unit: i.unit,
              grams: i.grams,
              conversionConfirmed: true,
              conversionNote: i.note,
            })),
          },
        },
      },
    },
    include: { recipes: { include: { ingredients: true } } },
  });
}

/** Placeholder stakeholders. Clearly marked; no real organisation is named. */
async function seedStakeholders(db: PrismaClient) {
  if ((await db.testingLab.count()) > 0) return;
  await db.testingLab.create({
    data: {
      name: "Food testing lab (placeholder)",
      city: "Ghaziabad",
      state: "Uttar Pradesh",
      services: JSON.stringify(["shelf_life", "nutrition", "microbial"]),
      isPlaceholder: true,
    },
  });
  await db.buyer.createMany({
    data: [
      { name: "ONDC seller app (placeholder)", kind: "ondc_seller_app", requirements: JSON.stringify(["fssai_number", "label", "mrp", "shelf_life"]) },
      { name: "Online marketplace (placeholder)", kind: "marketplace", requirements: JSON.stringify(["fssai_number", "label", "product_images"]) },
      { name: "Local kirana store (placeholder)", kind: "retailer", city: "Ghaziabad", requirements: JSON.stringify(["label", "batch_number", "mrp"]) },
    ],
  });
  await db.packagingSupplier.create({
    data: {
      name: "Jar and label supplier (placeholder)",
      city: "Ghaziabad",
      items: JSON.stringify([]),
      isPlaceholder: true,
    },
  });
  await db.foodSafetyOfficer.create({
    data: { district: "Ghaziabad", state: "Uttar Pradesh", isPlaceholder: true },
  });
}
