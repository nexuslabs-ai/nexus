/**
 * Organization Repository
 *
 * Simple CRUD operations for organizations.
 */

import { eq } from 'drizzle-orm';

import type { Database } from '../client.js';
import {
  type NewOrganization,
  type Organization,
  organizations,
} from '../schema.js';

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
   * Find all organizations
   */
  async findAll(): Promise<Organization[]> {
    return this.db.select().from(organizations);
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
