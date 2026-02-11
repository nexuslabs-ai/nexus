/**
 * Response Formatters
 *
 * Shared utilities for consistent API response formatting.
 * Ensures all endpoints return data in the same shape.
 *
 * Component formatters produce two shapes:
 * - Full: all fields including JSONB (for detail endpoints)
 * - Summary: excludes large JSONB fields (for list endpoints)
 *
 * Search formatters pass through SearchResult fields directly
 * since they are already plain objects without Date fields.
 */

import type { Component, SearchResult } from '@context-engine/db';

import { formatDates } from './format.js';

/**
 * Format a single component for API response.
 *
 * Converts Date fields to ISO strings and returns all fields.
 * Use for detail endpoints (GET by ID, GET by slug, POST, PATCH).
 */
export function formatComponent(component: Component) {
  return formatDates(component);
}

/**
 * Format a component summary for list responses.
 * Excludes large JSONB fields (extraction, generation, manifest)
 * for performance on paginated list endpoints.
 */
export function formatComponentSummary(component: Component) {
  const { createdAt, updatedAt } = formatDates(component);
  return {
    id: component.id,
    slug: component.slug,
    name: component.name,
    framework: component.framework,
    version: component.version,
    visibility: component.visibility,
    embeddingStatus: component.embeddingStatus,
    createdAt,
    updatedAt,
  };
}

/**
 * Format a paginated list of components for API response.
 * Uses summary format (excludes JSONB fields) for each component.
 */
export function formatComponentList(components: Component[], total: number) {
  return {
    items: components.map(formatComponentSummary),
    total,
    count: components.length,
  };
}

/**
 * Format a single search result for API response.
 * Search results are already plain objects without Date fields,
 * so this is a direct pass-through for consistency.
 */
export function formatSearchResult(result: SearchResult) {
  return {
    componentId: result.componentId,
    slug: result.slug,
    name: result.name,
    description: result.description,
    framework: result.framework,
    score: result.score,
  };
}

/**
 * Format search results for API response.
 */
export function formatSearchResults(results: SearchResult[], total: number) {
  return {
    items: results.map(formatSearchResult),
    total,
    count: results.length,
  };
}
