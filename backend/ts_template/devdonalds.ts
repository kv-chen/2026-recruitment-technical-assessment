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

  const parsed_string = parse_handwriting(input);
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
};

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
  return entry.type === 'recipe'
    && 'requiredItems' in entry && Array.isArray(entry.requiredItems)
    && entry.requiredItems.every(isRequiredItem);
};

const isIngredient = (entry: cookbookData): entry is ingredient => {
  return entry.type === 'ingredient'
    && 'cookTime' in entry && typeof entry.cookTime === 'number';
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
const findEntry = (name: string): cookbookEntry => {
  const entry = [...cookbook].find(item => item.name === name);
  if (!entry) throw new Error('cookbook entry not found');
  return entry;
};

const getIngredients = (recipe: recipe): requiredItem[] => {
  return recipe.requiredItems.flatMap(item => {
    const entry = findEntry(item.name);
    if (isRecipe(entry)) {
      return getIngredients(entry).map(baseIngr => ({
        name: baseIngr.name,
        quantity: baseIngr.quantity * item.quantity
      }));
    }
    if (isIngredient(entry)) {
      return item;
    }
    throw new Error('invalid cookbook entry');
  });
};

const getBaseIngredients = (recipeName: string): requiredItem[] => {
  const recipe = findEntry(recipeName);
  if (!isRecipe(recipe))
    throw new Error('recipe not found');

  const totals = getIngredients(recipe).reduce((totals, ingr) => {
    totals[ingr.name] = (totals[ingr.name] ?? 0) + ingr.quantity;
    return totals;
  }, {} as Record<string, number>);

  return Object.entries(totals).map(([name, quantity]) => ({name, quantity}));
};

const getRecipeSummary = (recipeName: string): {
  name: string,
  cookTime: number,
  ingredients: requiredItem[]
} => {
  const ingredients = getBaseIngredients(recipeName);
  const cookTime = ingredients.reduce((totalTime, ingr) =>
    totalTime + (findEntry(ingr.name) as ingredient).cookTime * ingr.quantity,
  0);
  return { name: recipeName, ingredients, cookTime };
};

app.get("/summary", (req:Request, res:Request) => {
  try {
    res.json(getRecipeSummary(req.query.name));
  } catch (e) {
    res.status(400).send((e as Error).message);
  }
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
