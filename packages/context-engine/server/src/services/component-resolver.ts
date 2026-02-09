/**
 * Component Resolver Service
 *
 * Resolves component identifiers (name, slug, or ID) to actual components.
 * Used by endpoints that accept flexible component references.
 *
 * Resolution order:
 * 1. Slug (exact match) -- most common for API usage
 * 2. Name (case-insensitive) -- fallback for human-readable references
 * 3. ID (UUID format) -- fallback for direct references
 */

import type { Component, ComponentRepository } from '@context-engine/db';

/**
 * Service for resolving component identifiers to components.
 *
 * Accepts a slug, name, or UUID and resolves it to a component
 * within the given organization. Returns null if no match is found.
 */
export class ComponentResolver {
  constructor(private componentRepo: ComponentRepository) {}

  /**
   * Resolve a component identifier to a component.
   *
   * Tries slug first (most common API usage pattern), then name
   * (case-insensitive), then ID (for direct UUID references).
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @param identifier - Component slug, name, or ID
   * @returns The resolved component, or null if not found
   */
  async resolve(orgId: string, identifier: string): Promise<Component | null> {
    // Try slug first (most common case for API usage)
    const bySlug = await this.componentRepo.findBySlug(orgId, identifier);
    if (bySlug) return bySlug;

    // Try name (case-insensitive)
    const byName = await this.componentRepo.findByName(orgId, identifier);
    if (byName) return byName;

    // Try ID (for direct references)
    const byId = await this.componentRepo.findById(orgId, identifier);
    if (byId) return byId;

    return null;
  }
}
