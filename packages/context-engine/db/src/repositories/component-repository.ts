/**
 * Component Repository
 *
 * Simple CRUD operations for components.
 * All methods are scoped to an organization for multi-tenancy.
 */

import { and, asc, desc, eq } from 'drizzle-orm';

import type { Database } from '../client.js';
import { type Component, components, type NewComponent } from '../schema.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for finding multiple components
 */
export interface FindManyOptions {
  /** Filter conditions */
  where?: {
    framework?: string;
    visibility?: string;
    embeddingStatus?: string;
  };

  /** Maximum number of results */
  limit?: number;

  /** Number of results to skip */
  offset?: number;

  /** Field to order by */
  orderBy?: 'name' | 'updatedAt' | 'createdAt';

  /** Order direction */
  orderDir?: 'asc' | 'desc';
}

// =============================================================================
// Repository
// =============================================================================

/**
 * Repository for component CRUD operations
 *
 * All operations are scoped to an organization for multi-tenancy.
 */
export class ComponentRepository {
  constructor(private db: Database) {}

  /**
   * Create a new component
   */
  async create(
    orgId: string,
    data: Omit<NewComponent, 'orgId'>
  ): Promise<Component> {
    const [result] = await this.db
      .insert(components)
      .values({ ...data, orgId })
      .returning();

    return result;
  }

  /**
   * Find component by ID
   */
  async findById(orgId: string, id: string): Promise<Component | null> {
    const [result] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .limit(1);

    return result ?? null;
  }

  /**
   * Find component by slug
   */
  async findBySlug(orgId: string, slug: string): Promise<Component | null> {
    const [result] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.orgId, orgId), eq(components.slug, slug)))
      .limit(1);

    return result ?? null;
  }

  /**
   * Find multiple components with optional filters
   */
  async findMany(
    orgId: string,
    options: FindManyOptions = {}
  ): Promise<Component[]> {
    const {
      where = {},
      limit = 50,
      offset = 0,
      orderBy = 'updatedAt',
      orderDir = 'desc',
    } = options;

    // Build conditions
    const conditions = [eq(components.orgId, orgId)];

    if (where.framework) {
      conditions.push(eq(components.framework, where.framework));
    }
    if (where.visibility) {
      conditions.push(eq(components.visibility, where.visibility));
    }
    if (where.embeddingStatus) {
      conditions.push(eq(components.embeddingStatus, where.embeddingStatus));
    }

    // Order column
    const orderColumn = {
      name: components.name,
      updatedAt: components.updatedAt,
      createdAt: components.createdAt,
    }[orderBy];

    const orderFn = orderDir === 'desc' ? desc : asc;

    return this.db
      .select()
      .from(components)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update a component
   */
  async update(
    orgId: string,
    id: string,
    data: Partial<Omit<NewComponent, 'id' | 'orgId'>>
  ): Promise<Component | null> {
    const [result] = await this.db
      .update(components)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .returning();

    return result ?? null;
  }

  /**
   * Upsert a component (insert or update by slug)
   */
  async upsert(
    orgId: string,
    data: Omit<NewComponent, 'orgId'>
  ): Promise<Component> {
    const [result] = await this.db
      .insert(components)
      .values({ ...data, orgId })
      .onConflictDoUpdate({
        target: [components.orgId, components.slug],
        set: {
          name: data.name,
          version: data.version,
          framework: data.framework,
          visibility: data.visibility,
          extraction: data.extraction,
          generation: data.generation,
          generationProvider: data.generationProvider,
          generationModel: data.generationModel,
          manifest: data.manifest,
          embeddingStatus: data.embeddingStatus,
          embeddingError: data.embeddingError,
          sourceHash: data.sourceHash,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  }

  /**
   * Delete a component
   */
  async delete(orgId: string, id: string): Promise<boolean> {
    const result = await this.db
      .delete(components)
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .returning({ id: components.id });

    return result.length > 0;
  }

  /**
   * Count components for an organization
   */
  async count(orgId: string): Promise<number> {
    const results = await this.db
      .select({ id: components.id })
      .from(components)
      .where(eq(components.orgId, orgId));

    return results.length;
  }
}
