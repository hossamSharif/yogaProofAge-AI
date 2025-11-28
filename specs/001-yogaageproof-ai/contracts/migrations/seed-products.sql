-- ============================================================================
-- Product Seed Migration Script
-- YogaAgeProof AI - Phase 4 (User Story 2)
--
-- Purpose: Create stored procedure for product ingestion with data validation
-- Source: Open Beauty Facts (https://world.openbeautyfacts.org/)
-- Target: 700-1000 products covering all routine categories
-- ============================================================================

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate required product fields
CREATE OR REPLACE FUNCTION validate_product_data(
  p_name TEXT,
  p_brand TEXT,
  p_category TEXT,
  p_image_url TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check required fields are not empty
  IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
    RETURN FALSE;
  END IF;

  IF p_brand IS NULL OR LENGTH(TRIM(p_brand)) = 0 THEN
    RETURN FALSE;
  END IF;

  IF p_category IS NULL OR LENGTH(TRIM(p_category)) = 0 THEN
    RETURN FALSE;
  END IF;

  IF p_image_url IS NULL OR LENGTH(TRIM(p_image_url)) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Validate category is one of our valid categories
  IF p_category NOT IN ('cleanser', 'toner', 'serum', 'moisturizer', 'eye_cream', 'treatment', 'sunscreen', 'mask', 'oil') THEN
    RETURN FALSE;
  END IF;

  -- Validate image URL starts with https
  IF NOT (p_image_url LIKE 'https://%') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PRODUCT INGESTION STORED PROCEDURE
-- ============================================================================

-- Main procedure to ingest products from Open Beauty Facts
CREATE OR REPLACE FUNCTION ingest_product(
  p_name TEXT,
  p_brand TEXT,
  p_category product_category,
  p_description TEXT DEFAULT NULL,
  p_ingredients JSONB DEFAULT '[]'::JSONB,
  p_benefits JSONB DEFAULT '[]'::JSONB,
  p_usage_instructions TEXT DEFAULT NULL,
  p_skin_types JSONB DEFAULT '[]'::JSONB,
  p_concerns_addressed JSONB DEFAULT '[]'::JSONB,
  p_image_url TEXT DEFAULT NULL,
  p_price_usd DECIMAL(10,2) DEFAULT NULL,
  p_external_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_product_id UUID;
BEGIN
  -- Validate required fields
  IF NOT validate_product_data(p_name, p_brand, p_category::TEXT, p_image_url) THEN
    RAISE EXCEPTION 'Invalid product data: missing required fields or invalid category';
  END IF;

  -- Check if product already exists (by name and brand)
  SELECT id INTO v_product_id
  FROM products
  WHERE LOWER(name) = LOWER(p_name) AND LOWER(brand) = LOWER(p_brand);

  IF v_product_id IS NOT NULL THEN
    -- Update existing product
    UPDATE products SET
      description = COALESCE(p_description, description),
      ingredients = CASE WHEN p_ingredients != '[]'::JSONB THEN p_ingredients ELSE ingredients END,
      benefits = CASE WHEN p_benefits != '[]'::JSONB THEN p_benefits ELSE benefits END,
      usage_instructions = COALESCE(p_usage_instructions, usage_instructions),
      skin_types = CASE WHEN p_skin_types != '[]'::JSONB THEN p_skin_types ELSE skin_types END,
      concerns_addressed = CASE WHEN p_concerns_addressed != '[]'::JSONB THEN p_concerns_addressed ELSE concerns_addressed END,
      image_url = COALESCE(p_image_url, image_url),
      price_usd = COALESCE(p_price_usd, price_usd),
      external_url = COALESCE(p_external_url, external_url),
      is_available = TRUE,
      updated_at = NOW()
    WHERE id = v_product_id;
  ELSE
    -- Insert new product
    INSERT INTO products (
      name, brand, category, description, ingredients, benefits,
      usage_instructions, skin_types, concerns_addressed,
      image_url, price_usd, external_url, is_available
    ) VALUES (
      p_name, p_brand, p_category, p_description, p_ingredients, p_benefits,
      p_usage_instructions, p_skin_types, p_concerns_addressed,
      p_image_url, p_price_usd, p_external_url, TRUE
    )
    RETURNING id INTO v_product_id;
  END IF;

  RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BATCH INGESTION PROCEDURE
-- ============================================================================

-- Procedure to ingest multiple products at once
CREATE OR REPLACE FUNCTION ingest_products_batch(
  p_products JSONB
) RETURNS TABLE (
  success_count INTEGER,
  failure_count INTEGER,
  failed_products JSONB
) AS $$
DECLARE
  v_product JSONB;
  v_success INTEGER := 0;
  v_failure INTEGER := 0;
  v_failed JSONB := '[]'::JSONB;
  v_product_id UUID;
BEGIN
  FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
  LOOP
    BEGIN
      SELECT ingest_product(
        v_product->>'name',
        v_product->>'brand',
        (v_product->>'category')::product_category,
        v_product->>'description',
        COALESCE(v_product->'ingredients', '[]'::JSONB),
        COALESCE(v_product->'benefits', '[]'::JSONB),
        v_product->>'usage_instructions',
        COALESCE(v_product->'skin_types', '[]'::JSONB),
        COALESCE(v_product->'concerns_addressed', '[]'::JSONB),
        v_product->>'image_url',
        (v_product->>'price_usd')::DECIMAL(10,2),
        v_product->>'external_url'
      ) INTO v_product_id;

      v_success := v_success + 1;
    EXCEPTION WHEN OTHERS THEN
      v_failure := v_failure + 1;
      v_failed := v_failed || jsonb_build_object(
        'product', v_product,
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN QUERY SELECT v_success, v_failure, v_failed;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA QUALITY VALIDATION QUERIES (T073)
-- ============================================================================

-- Function to get category coverage statistics
CREATE OR REPLACE FUNCTION get_product_category_coverage()
RETURNS TABLE (
  category product_category,
  product_count BIGINT,
  meets_minimum BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.category,
    COUNT(*)::BIGINT AS product_count,
    COUNT(*) >= 50 AS meets_minimum -- Minimum 50 products per category
  FROM products p
  WHERE p.is_available = TRUE
  GROUP BY p.category
  ORDER BY p.category;
END;
$$ LANGUAGE plpgsql;

-- Function to validate overall product data quality
CREATE OR REPLACE FUNCTION validate_product_data_quality()
RETURNS TABLE (
  check_name TEXT,
  total_count BIGINT,
  passing_count BIGINT,
  pass_rate DECIMAL(5,2)
) AS $$
BEGIN
  -- Check 1: Products with valid name
  RETURN QUERY
  SELECT
    'Has valid name'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE name IS NOT NULL AND LENGTH(TRIM(name)) > 0)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE name IS NOT NULL AND LENGTH(TRIM(name)) > 0)::DECIMAL / COUNT(*) * 100, 2)
  FROM products WHERE is_available = TRUE;

  -- Check 2: Products with valid brand
  RETURN QUERY
  SELECT
    'Has valid brand'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE brand IS NOT NULL AND LENGTH(TRIM(brand)) > 0)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE brand IS NOT NULL AND LENGTH(TRIM(brand)) > 0)::DECIMAL / COUNT(*) * 100, 2)
  FROM products WHERE is_available = TRUE;

  -- Check 3: Products with image URL
  RETURN QUERY
  SELECT
    'Has image URL'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE image_url IS NOT NULL AND LENGTH(TRIM(image_url)) > 0)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE image_url IS NOT NULL AND LENGTH(TRIM(image_url)) > 0)::DECIMAL / COUNT(*) * 100, 2)
  FROM products WHERE is_available = TRUE;

  -- Check 4: Products with HTTPS image URL
  RETURN QUERY
  SELECT
    'Image URL is HTTPS'::TEXT,
    COUNT(*) FILTER (WHERE image_url IS NOT NULL)::BIGINT,
    COUNT(*) FILTER (WHERE image_url LIKE 'https://%')::BIGINT,
    CASE
      WHEN COUNT(*) FILTER (WHERE image_url IS NOT NULL) > 0
      THEN ROUND(COUNT(*) FILTER (WHERE image_url LIKE 'https://%')::DECIMAL / COUNT(*) FILTER (WHERE image_url IS NOT NULL) * 100, 2)
      ELSE 100.00
    END
  FROM products WHERE is_available = TRUE;

  -- Check 5: Products with ingredients
  RETURN QUERY
  SELECT
    'Has ingredients'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE ingredients IS NOT NULL AND ingredients != '[]'::JSONB)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE ingredients IS NOT NULL AND ingredients != '[]'::JSONB)::DECIMAL / COUNT(*) * 100, 2)
  FROM products WHERE is_available = TRUE;

  -- Check 6: Products with skin types tagged
  RETURN QUERY
  SELECT
    'Has skin types tagged'::TEXT,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE skin_types IS NOT NULL AND skin_types != '[]'::JSONB)::BIGINT,
    ROUND(COUNT(*) FILTER (WHERE skin_types IS NOT NULL AND skin_types != '[]'::JSONB)::DECIMAL / COUNT(*) * 100, 2)
  FROM products WHERE is_available = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get total product count summary
CREATE OR REPLACE FUNCTION get_product_summary()
RETURNS TABLE (
  metric TEXT,
  value BIGINT
) AS $$
BEGIN
  RETURN QUERY SELECT 'Total products'::TEXT, COUNT(*)::BIGINT FROM products;
  RETURN QUERY SELECT 'Available products'::TEXT, COUNT(*)::BIGINT FROM products WHERE is_available = TRUE;
  RETURN QUERY SELECT 'Categories covered'::TEXT, COUNT(DISTINCT category)::BIGINT FROM products WHERE is_available = TRUE;
  RETURN QUERY SELECT 'Products with images'::TEXT, COUNT(*)::BIGINT FROM products WHERE is_available = TRUE AND image_url IS NOT NULL;
  RETURN QUERY SELECT 'Products with ingredients'::TEXT, COUNT(*)::BIGINT FROM products WHERE is_available = TRUE AND ingredients != '[]'::JSONB;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CATEGORY MAPPING HELPER
-- ============================================================================

-- Function to map Open Beauty Facts category tags to our categories
CREATE OR REPLACE FUNCTION map_obf_category(p_category_tags TEXT)
RETURNS product_category AS $$
BEGIN
  -- Map Open Beauty Facts categories to our product categories
  IF p_category_tags ILIKE '%face-cleansers%' OR p_category_tags ILIKE '%cleansing%' THEN
    RETURN 'cleanser'::product_category;
  ELSIF p_category_tags ILIKE '%toner%' OR p_category_tags ILIKE '%tonic%' THEN
    RETURN 'toner'::product_category;
  ELSIF p_category_tags ILIKE '%serum%' OR p_category_tags ILIKE '%essence%' THEN
    RETURN 'serum'::product_category;
  ELSIF p_category_tags ILIKE '%moisturiz%' OR p_category_tags ILIKE '%cream%' OR p_category_tags ILIKE '%lotion%' THEN
    RETURN 'moisturizer'::product_category;
  ELSIF p_category_tags ILIKE '%eye%cream%' OR p_category_tags ILIKE '%eye%care%' THEN
    RETURN 'eye_cream'::product_category;
  ELSIF p_category_tags ILIKE '%sunscreen%' OR p_category_tags ILIKE '%sun%protection%' OR p_category_tags ILIKE '%spf%' THEN
    RETURN 'sunscreen'::product_category;
  ELSIF p_category_tags ILIKE '%mask%' THEN
    RETURN 'mask'::product_category;
  ELSIF p_category_tags ILIKE '%oil%' OR p_category_tags ILIKE '%facial%oil%' THEN
    RETURN 'oil'::product_category;
  ELSE
    RETURN 'treatment'::product_category;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

-- Mark products not in latest import as unavailable
CREATE OR REPLACE FUNCTION mark_discontinued_products(
  p_imported_ids UUID[]
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE products
  SET is_available = FALSE, updated_at = NOW()
  WHERE id != ALL(p_imported_ids)
    AND is_available = TRUE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for product search by name and brand (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_products_name_brand_lower
ON products (LOWER(name), LOWER(brand));

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category_available
ON products (category, is_available) WHERE is_available = TRUE;

-- Index for skin type filtering (GIN for JSONB)
CREATE INDEX IF NOT EXISTS idx_products_skin_types
ON products USING GIN (skin_types);

-- Index for concerns filtering (GIN for JSONB)
CREATE INDEX IF NOT EXISTS idx_products_concerns
ON products USING GIN (concerns_addressed);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION validate_product_data IS 'Validates required product fields per product-data-source.md requirements';
COMMENT ON FUNCTION ingest_product IS 'Ingests a single product from Open Beauty Facts with upsert logic';
COMMENT ON FUNCTION ingest_products_batch IS 'Batch ingests products with error handling and reporting';
COMMENT ON FUNCTION get_product_category_coverage IS 'Returns product count per category with minimum threshold check';
COMMENT ON FUNCTION validate_product_data_quality IS 'Comprehensive data quality validation for product catalog';
COMMENT ON FUNCTION map_obf_category IS 'Maps Open Beauty Facts category tags to our product_category enum';
