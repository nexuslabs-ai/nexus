/**
 * Organization Repository
 *
 * Simple CRUD operations for organizations.
 */

import { count, desc, eq } from 'drizzle-orm';

import type { Database } from '../client.js';
import {
  type NewOrganization,
  type Organization,
  organizations,
} from '../schema.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for finding multiple organizations
 */
export interface FindManyOrganizationsOptions {
  /** Maximum number of results */
  limit?: number;

  /** Number of results to skip */
  offset?: number;
}

/**
 * Repository for organization CRUD operations
 */
export class OrganizationRepository {
  constructor(private db: Database) {}

  /**
   * Create a new organization
   */
  async create(data: NewOrganization): Promise<Organization> {
    const [result] = await this.db
      .insert(organizations)
      .values(data)
      .returning();

    if (!result) {
      throw new Error('Failed to create organization: no row returned');
    }

    return result;
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const [result] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return result ?? null;
  }

  /**
   * Find organizations with pagination
   *
   * @returns Object containing the paginated organizations and total count
   */
  async findMany(
    options: FindManyOrganizationsOptions = {}
  ): Promise<{ organizations: Organization[]; total: number }> {
    const { limit = 50, offset = 0 } = options;

    // Count total records
    const [countResult] = await this.db
      .select({ count: count() })
      .from(organizations);

    const total = countResult?.count ?? 0;

    // Fetch paginated results
    const results = await this.db
      .select()
      .from(organizations)
      .orderBy(desc(organizations.updatedAt))
      .limit(limit)
      .offset(offset);

    return { organizations: results, total };
  }

  /**
   * Update an organization
   */
  async update(
    id: string,
    data: Partial<Omit<NewOrganization, 'id'>>
  ): Promise<Organization | null> {
    const [result] = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();

    return result ?? null;
  }

  /**
   * Delete an organization
   *
   * @returns The deleted organization, or null if not found
   * @throws Error if organization has associated components (FK constraint)
   */
  async delete(id: string): Promise<Organization | null> {
    const [result] = await this.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    return result ?? null;
  }
}
