/**
 * Supabase Edge Function: ingest-products
 *
 * Purpose: Fetch and ingest products from Open Beauty Facts API
 * Implements T072: Create Supabase Edge Function 'ingest-products'
 *
 * Features:
 * - Fetches products from Open Beauty Facts API
 * - Filters to 700-1000 products per contract criteria
 * - Validates data quality (image URLs, required fields)
 * - Populates products table via stored procedure
 *
 * Usage: POST /functions/v1/ingest-products
 * Body: { "categories": ["cleanser", "toner", ...], "limit": 100 }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Open Beauty Facts API base URL
const OBF_API_BASE = 'https://world.openbeautyfacts.org';

// Category mapping from Open Beauty Facts to our categories
const CATEGORY_MAPPING: Record<string, string[]> = {
  cleanser: ['en:face-cleansers', 'en:cleansing-gels', 'en:cleansing-foams', 'en:cleansing-milks'],
  toner: ['en:face-toners', 'en:toning-lotions', 'en:astringents'],
  serum: ['en:face-serums', 'en:essences', 'en:concentrates'],
  moisturizer: ['en:face-moisturizers', 'en:face-creams', 'en:day-creams', 'en:night-creams'],
  eye_cream: ['en:eye-creams', 'en:eye-care', 'en:eye-gels'],
  sunscreen: ['en:sunscreens', 'en:sun-protection', 'en:spf-products'],
  mask: ['en:face-masks', 'en:sheet-masks', 'en:clay-masks'],
  oil: ['en:facial-oils', 'en:face-oils', 'en:beauty-oils'],
  treatment: ['en:face-treatments', 'en:anti-aging', 'en:acne-treatments'],
};

// Minimum products per category
const MIN_PRODUCTS_PER_CATEGORY = 50;
const TARGET_PRODUCTS_PER_CATEGORY = 100;

interface OBFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  image_url?: string;
  url?: string;
  unique_scans_n?: number;
}

interface ProductData {
  name: string;
  brand: string;
  category: string;
  description: string | null;
  ingredients: string[];
  benefits: string[];
  usage_instructions: string | null;
  skin_types: string[];
  concerns_addressed: string[];
  image_url: string;
  price_usd: number | null;
  external_url: string;
}

/**
 * Fetch products from Open Beauty Facts API
 */
async function fetchOBFProducts(
  categoryTags: string[],
  limit: number = TARGET_PRODUCTS_PER_CATEGORY
): Promise<OBFProduct[]> {
  const products: OBFProduct[] = [];

  for (const tag of categoryTags) {
    try {
      const url = `${OBF_API_BASE}/category/${tag}.json?page_size=${limit}&fields=code,product_name,brands,categories_tags,ingredients_text,image_url,url,unique_scans_n`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to fetch category ${tag}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.products && Array.isArray(data.products)) {
        products.push(...data.products);
      }
    } catch (error) {
      console.error(`Error fetching category ${tag}:`, error);
    }
  }

  // Sort by popularity (unique scans)
  products.sort((a, b) => (b.unique_scans_n || 0) - (a.unique_scans_n || 0));

  return products;
}

/**
 * Validate and transform OBF product to our format
 */
function transformProduct(product: OBFProduct, category: string): ProductData | null {
  // Required fields validation
  if (!product.product_name || product.product_name.trim().length === 0) {
    return null;
  }

  if (!product.brands || product.brands.trim().length === 0) {
    return null;
  }

  if (!product.image_url || !product.image_url.startsWith('https://')) {
    return null;
  }

  // Parse ingredients
  const ingredients: string[] = [];
  if (product.ingredients_text && product.ingredients_text.length > 10) {
    // Split by common separators
    const parsed = product.ingredients_text
      .split(/[,;]/)
      .map(i => i.trim())
      .filter(i => i.length > 0);
    ingredients.push(...parsed.slice(0, 50)); // Limit to 50 ingredients
  }

  // Extract first brand if multiple
  const brand = product.brands.split(',')[0].trim();

  return {
    name: product.product_name.trim(),
    brand,
    category,
    description: null,
    ingredients,
    benefits: [],
    usage_instructions: null,
    skin_types: [],
    concerns_addressed: [],
    image_url: product.image_url,
    price_usd: null,
    external_url: product.url || `${OBF_API_BASE}/product/${product.code}`,
  };
}

/**
 * Infer skin types from ingredients
 */
function inferSkinTypes(ingredients: string[]): string[] {
  const skinTypes: string[] = [];
  const ingredientsLower = ingredients.map(i => i.toLowerCase()).join(' ');

  // Dry skin indicators
  if (
    ingredientsLower.includes('hyaluronic') ||
    ingredientsLower.includes('glycerin') ||
    ingredientsLower.includes('shea butter') ||
    ingredientsLower.includes('ceramide')
  ) {
    skinTypes.push('dry');
  }

  // Oily skin indicators
  if (
    ingredientsLower.includes('salicylic') ||
    ingredientsLower.includes('niacinamide') ||
    ingredientsLower.includes('clay') ||
    ingredientsLower.includes('charcoal')
  ) {
    skinTypes.push('oily');
  }

  // Sensitive skin indicators
  if (
    (ingredientsLower.includes('aloe') ||
      ingredientsLower.includes('chamomile') ||
      ingredientsLower.includes('centella')) &&
    !ingredientsLower.includes('fragrance') &&
    !ingredientsLower.includes('parfum')
  ) {
    skinTypes.push('sensitive');
  }

  // If no specific indicators, mark as suitable for normal/combination
  if (skinTypes.length === 0) {
    skinTypes.push('normal', 'combination');
  }

  return skinTypes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { categories, limit = TARGET_PRODUCTS_PER_CATEGORY } = await req.json().catch(() => ({}));

    // Determine which categories to process
    const categoriesToProcess = categories && Array.isArray(categories)
      ? categories.filter((c: string) => CATEGORY_MAPPING[c])
      : Object.keys(CATEGORY_MAPPING);

    const results: Record<string, { fetched: number; ingested: number; failed: number }> = {};
    const allIngestedIds: string[] = [];

    // Process each category
    for (const category of categoriesToProcess) {
      const categoryTags = CATEGORY_MAPPING[category];

      console.log(`Processing category: ${category}`);

      // Fetch products from OBF
      const obfProducts = await fetchOBFProducts(categoryTags, limit);
      console.log(`Fetched ${obfProducts.length} products for ${category}`);

      // Transform and validate products
      const validProducts: ProductData[] = [];
      for (const obfProduct of obfProducts) {
        const transformed = transformProduct(obfProduct, category);
        if (transformed) {
          // Infer skin types from ingredients
          transformed.skin_types = inferSkinTypes(transformed.ingredients);
          validProducts.push(transformed);
        }

        // Stop when we have enough valid products
        if (validProducts.length >= limit) break;
      }

      console.log(`Valid products for ${category}: ${validProducts.length}`);

      // Ingest products using stored procedure
      let ingested = 0;
      let failed = 0;

      for (const product of validProducts) {
        try {
          const { data, error } = await supabase.rpc('ingest_product', {
            p_name: product.name,
            p_brand: product.brand,
            p_category: product.category,
            p_description: product.description,
            p_ingredients: JSON.stringify(product.ingredients),
            p_benefits: JSON.stringify(product.benefits),
            p_usage_instructions: product.usage_instructions,
            p_skin_types: JSON.stringify(product.skin_types),
            p_concerns_addressed: JSON.stringify(product.concerns_addressed),
            p_image_url: product.image_url,
            p_price_usd: product.price_usd,
            p_external_url: product.external_url,
          });

          if (error) {
            console.error(`Failed to ingest product ${product.name}:`, error);
            failed++;
          } else {
            ingested++;
            if (data) allIngestedIds.push(data);
          }
        } catch (err) {
          console.error(`Error ingesting product ${product.name}:`, err);
          failed++;
        }
      }

      results[category] = {
        fetched: obfProducts.length,
        ingested,
        failed,
      };
    }

    // Get category coverage
    const { data: coverage } = await supabase.rpc('get_product_category_coverage');

    // Get overall summary
    const { data: summary } = await supabase.rpc('get_product_summary');

    return new Response(
      JSON.stringify({
        success: true,
        results,
        coverage,
        summary,
        totalIngested: allIngestedIds.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in ingest-products:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
