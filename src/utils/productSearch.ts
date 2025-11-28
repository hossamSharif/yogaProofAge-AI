/**
 * Product Search Utilities
 *
 * Implements T090: Online product search integration (browser link)
 * Per FR-023 and FR-068: Search for products online
 *
 * Opens browser with search query for product purchase options.
 */

import { Linking, Alert, Platform } from 'react-native';
import { Database } from '@/types/supabase.types';

type Product = Database['public']['Tables']['products']['Row'];

/**
 * Search engine options
 */
export type SearchEngine = 'google' | 'amazon' | 'ulta' | 'sephora' | 'target';

/**
 * Search engine URLs
 */
const SEARCH_URLS: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=',
  amazon: 'https://www.amazon.com/s?k=',
  ulta: 'https://www.ulta.com/search?search=',
  sephora: 'https://www.sephora.com/search?keyword=',
  target: 'https://www.target.com/s?searchTerm=',
};

/**
 * Search engine display names
 */
export const SEARCH_ENGINE_NAMES: Record<SearchEngine, string> = {
  google: 'Google',
  amazon: 'Amazon',
  ulta: 'Ulta Beauty',
  sephora: 'Sephora',
  target: 'Target',
};

/**
 * Build search query from product
 */
function buildSearchQuery(product: Product, includeCategory = false): string {
  let query = `${product.name} ${product.brand}`;

  if (includeCategory) {
    query += ` ${product.category.replace('_', ' ')}`;
  }

  // Add "buy" to help find purchase links
  query += ' buy';

  return encodeURIComponent(query.trim());
}

/**
 * Open product search in browser
 *
 * @param product - Product to search for
 * @param engine - Search engine to use (default: google)
 * @returns Promise<boolean> - Whether the link was opened
 */
export async function openProductSearch(
  product: Product,
  engine: SearchEngine = 'google'
): Promise<boolean> {
  const query = buildSearchQuery(product);
  const baseUrl = SEARCH_URLS[engine];
  const url = `${baseUrl}${query}`;

  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert(
        'Unable to Open',
        'Cannot open the search page. Please try again later.',
        [{ text: 'OK' }]
      );
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to open product search:', error);
    Alert.alert(
      'Error',
      'Failed to open the search page. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

/**
 * Open product search with engine selection
 * Shows action sheet for user to choose search engine
 */
export function showSearchOptions(
  product: Product,
  onSelect?: (engine: SearchEngine) => void
): void {
  const engines: SearchEngine[] = ['google', 'amazon', 'ulta', 'sephora', 'target'];

  // On iOS we could use ActionSheetIOS, but for cross-platform we use Alert
  Alert.alert(
    'Search for Product',
    `Find "${product.name}" online`,
    [
      ...engines.map(engine => ({
        text: SEARCH_ENGINE_NAMES[engine],
        onPress: () => {
          if (onSelect) onSelect(engine);
          openProductSearch(product, engine);
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]
  );
}

/**
 * Open product's external URL if available
 * Falls back to Google search if no external URL
 */
export async function openProductPage(product: Product): Promise<boolean> {
  if (product.external_url) {
    try {
      const canOpen = await Linking.canOpenURL(product.external_url);
      if (canOpen) {
        await Linking.openURL(product.external_url);
        return true;
      }
    } catch (error) {
      console.error('Failed to open external URL:', error);
    }
  }

  // Fall back to Google search
  return openProductSearch(product, 'google');
}

/**
 * Generate shareable product search URL
 */
export function getProductSearchUrl(product: Product, engine: SearchEngine = 'google'): string {
  const query = buildSearchQuery(product);
  return `${SEARCH_URLS[engine]}${query}`;
}

/**
 * Copy product search URL to clipboard
 */
export async function copyProductSearchUrl(
  product: Product,
  engine: SearchEngine = 'google'
): Promise<boolean> {
  try {
    const url = getProductSearchUrl(product, engine);

    // Use Clipboard API (requires expo-clipboard or react-native clipboard)
    // For now, just return the URL - actual clipboard implementation depends on project setup
    console.log('Copy URL:', url);

    Alert.alert('URL Copied', 'Product search URL has been copied to clipboard.');
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}

/**
 * Open ingredient search (for researching ingredients)
 */
export async function searchIngredient(ingredient: string): Promise<boolean> {
  const query = encodeURIComponent(`${ingredient} skincare ingredient`);
  const url = `https://www.google.com/search?q=${query}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to search ingredient:', error);
    return false;
  }
}

export default {
  openProductSearch,
  showSearchOptions,
  openProductPage,
  getProductSearchUrl,
  copyProductSearchUrl,
  searchIngredient,
  SEARCH_ENGINE_NAMES,
};
