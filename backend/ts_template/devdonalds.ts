import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookData {
  name: string;
  type: "recipe" | "ingredient";
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookData {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookData {
  cookTime: number;
}

type cookbookEntry = recipe | ingredient;

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook = new Set<cookbookEntry>();

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  if (typeof recipeName !== 'string' || recipeName.length === 0) return null;

  const capitalize = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const parsed = recipeName
    .replace(/[-_ ]+/g, ' ')
    .replace(/[^A-Za-z ]/g, '')
    .trim()
    .split(' ')
    .map(capitalize)
    .join(' ');
  return (parsed.length > 0) ? parsed : null;
}

// [TASK 2] ====================================================================
const isRecord = (obj: unknown): obj is { any: unknown } => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
};

const isCookbookData = (obj: unknown): obj is cookbookData => {
  return isRecord(obj) &&
    'name' in obj && typeof obj.name === 'string' &&
    'type' in obj && (obj.type === 'recipe' || obj.type === 'ingredient');
};

const isRequiredItem = (obj: unknown): obj is requiredItem => {
  return isRecord(obj)
    && 'name' in obj && typeof obj.name === 'string'
    && 'quantity' in obj && typeof obj.quantity === 'number';
};

const isRecipe = (entry: cookbookData): entry is recipe => {
  return 'requiredItems' in entry
    && Array.isArray(entry.requiredItems)
    && entry.requiredItems.every(isRequiredItem);
};

const isIngredient = (entry: cookbookData): entry is ingredient => {
  return 'cookTime' in entry && typeof entry.cookTime === 'number';
};

const parseCookbookEntry = (entry: unknown): cookbookEntry => {
  if (!isCookbookData(entry))
    throw new Error('invalid name or type');
  if ([...cookbook].some(item => item.name === entry.name))
    throw new Error('entry already exists');

  return entry.type === 'recipe' ? parseRecipe(entry) : parseIngredient(entry);
};

const parseRecipe = (entry: cookbookData): recipe => {
  if (!isRecipe(entry))
    throw new Error('invalid recipe');
  const itemNames = entry.requiredItems.map(item => item.name);
  if (new Set(itemNames).size < itemNames.length)
    throw new Error('duplicate ingredients');

  return {
    name: entry.name,
    type: entry.type,
    requiredItems: entry.requiredItems
  };
};

const parseIngredient = (entry: cookbookData): ingredient => {
  if (!isIngredient(entry))
    throw new Error('invalid ingredient');
  if (entry.cookTime < 0)
    throw new Error('negative cook time');

  return {
    name: entry.name,
    type: entry.type,
    cookTime: entry.cookTime
  };
};

// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  try {
    cookbook.add(parseCookbookEntry(req.body));
    res.json({});
  } catch (e) {
    res.status(400).send((e as Error).message);
  }
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  // TODO: implement me
  res.status(500).send("not yet implemented!")

});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
