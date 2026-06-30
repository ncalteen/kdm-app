import { getUserId, getUserIdOrNull } from '@/lib/dal/user'
import { Database, TablesInsert, TablesUpdate } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Public Table Name
 *
 * Encompasses all tables in the public schema.
 */
type PublicTableName = Extract<keyof Database['public']['Tables'], string>

/**
 * Public Table
 *
 * Provides the shape of tables in the public schema.
 */
type PublicTable<TableName extends PublicTableName> =
  Database['public']['Tables'][TableName]

/**
 * Custom Catalog Table Name
 *
 * Represents tables in the public schema that have the standard `id`,
 * `custom`, `user_id`, and `archived_at` columns.
 */
type CustomCatalogTableName = {
  [TableName in PublicTableName]: PublicTable<TableName>['Row'] extends {
    archived_at: string | null
    custom: boolean
    id: string
    user_id: string | null
  }
    ? TableName
    : never
}[PublicTableName]

/**
 * Detail with ID
 *
 * Represents a detail object that includes an `id` property.
 */
type DetailWithId = { id: string }

/**
 * Custom Catalog Insert Input
 *
 * Represents the input required to insert a new row into a custom catalog
 * table, excluding automatically-managed columns.
 */
type CustomCatalogInsertInput<TableName extends CustomCatalogTableName> = Omit<
  TablesInsert<TableName>,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'archived_at'
>

/**
 * Custom Catalog Update Input
 *
 * Represents the input required to update an existing row in a custom catalog
 * table, excluding automatically-managed columns.
 */
type CustomCatalogUpdateInput<TableName extends CustomCatalogTableName> = Omit<
  TablesUpdate<TableName>,
  'id' | 'created_at' | 'updated_at' | 'custom' | 'user_id'
>

/**
 * Mutable Insert
 *
 * Represents the input required to insert a new row into a custom catalog
 * table, including optional `custom` and `user_id` fields.
 */
type MutableInsert<TableName extends CustomCatalogTableName> =
  TablesInsert<TableName> & {
    custom?: boolean
    user_id?: string | null
  }

/**
 * Mutable Update
 *
 * Represents the input required to update an existing row in a custom catalog
 * table, including optional `custom` and `user_id` fields.
 */
type MutableUpdate<TableName extends CustomCatalogTableName> =
  TablesUpdate<TableName> & {
    custom?: boolean
    user_id?: string | null
  }

/**
 * Custom Catalog Friendly Type Names
 *
 * Represents the user-facing type names used for catalog entry communications.
 */
type CustomCatalogFriendlyTypeNames = {
  /** Plural Form */
  plural: string
  /** Singular Form */
  singular: string
}

/**
 * Custom Catalog CRUD Config
 *
 * Represents the configuration options for a custom catalog CRUD instance.
 */
type CustomCatalogCrudConfig<TableName extends CustomCatalogTableName> = {
  friendlyTypeNames: CustomCatalogFriendlyTypeNames
  select: string
  selectDetail: string
  tableName: TableName
}

/**
 * Error Actions
 *
 * Represents the different actions that can result in errors during CRUD
 * operations, along with their corresponding user-facing labels.
 */
const ERROR_ACTIONS = {
  add: { action: 'Adding', typeName: 'singular' },
  fetchAll: { action: 'Fetching', typeName: 'plural' },
  fetchCustom: { action: 'Fetching Custom', typeName: 'plural' },
  remove: { action: 'Removing', typeName: 'singular' },
  update: { action: 'Updating', typeName: 'singular' }
}

/**
 * Query Response
 *
 * Represents the response returned from a query, including the data and any
 * error that may have occurred.
 */
type QueryResponse<Data> = {
  data: Data
  error: { message: string } | null
}

/**
 * Filter Builder
 *
 * Represents a builder for constructing filter queries.
 */
type FilterBuilder<Data> = {
  eq(column: string, value: unknown): FilterBuilder<Data>
  is(column: string, value: unknown): PromiseLike<QueryResponse<Data>>
}

/**
 * Equal Result Builder
 *
 * Represents a builder for constructing equality-based queries that return a
 * `QueryResponse` with `null` data.
 */
type EqResultBuilder = {
  eq(column: string, value: unknown): PromiseLike<QueryResponse<null>>
}

/**
 * Insert Select Builder
 *
 * Represents a builder for constructing insert queries that return a
 * `QueryResponse` with the inserted detail.
 */
type InsertSelectBuilder = {
  select(columns: string): {
    single(): PromiseLike<QueryResponse<DetailWithId>>
  }
}

/**
 * Table Query
 *
 * Represents a query builder for a specific table, providing methods for
 * common CRUD operations.
 */
type TableQuery = {
  delete(): EqResultBuilder
  insert(values: Record<string, unknown>): InsertSelectBuilder
  select(columns: string): unknown
  update(values: Record<string, unknown>): EqResultBuilder
}

/**
 * Table Client
 *
 * Represents a client for interacting with a specific table, providing methods
 * to perform CRUD operations.
 */
type TableClient = {
  from(tableName: string): TableQuery
}

/**
 * Custom Catalog CRUD
 *
 * Provides reusable CRUD operations for custom catalog tables that share the
 * standard `id`, `custom`, `user_id`, and `archived_at` columns.
 */
export interface CustomCatalogCrud<
  TableName extends CustomCatalogTableName,
  Detail extends DetailWithId
> {
  /** Add Row */
  add(input: CustomCatalogInsertInput<TableName>): Promise<string>
  /** Get All Visible Rows */
  getAll(detail?: boolean): Promise<Record<string, Detail>>
  /** Get Current User Custom Rows */
  getUserCustom(detail?: boolean): Promise<Record<string, Detail>>
  /** Remove Row */
  remove(id: string): Promise<void>
  /** Update Row */
  update(id: string, input: CustomCatalogUpdateInput<TableName>): Promise<void>
}

/**
 * To Data Map
 *
 * Converts an array of details with IDs into a map keyed by the ID.
 *
 * @param rows Rows to Convert
 * @returns Rows Keyed by ID
 */
function toDataMap<Detail extends DetailWithId>(
  rows: Detail[] | null
): Record<string, Detail> {
  const map: Record<string, Detail> = {}

  for (const row of rows ?? []) map[row.id] = row

  return map
}

/**
 * Get Table Query
 *
 * Gets a query builder for the specified table.
 *
 * @param tableName Table Name
 * @returns Table Query
 */
function getTableQuery(tableName: string): TableQuery {
  return (createClient() as unknown as TableClient).from(tableName)
}

/**
 * Create CRUD Error Message
 *
 * Creates a standardized error message for CRUD operations.
 *
 * @param config CRUD Configuration
 * @param action CRUD Action
 * @param message Error Message
 * @returns Formatted Error Message
 */
function createCrudErrorMessage(
  config: CustomCatalogCrudConfig<CustomCatalogTableName>,
  action: keyof typeof ERROR_ACTIONS,
  message: string
): string {
  const { action: actionLabel, typeName } = ERROR_ACTIONS[action]

  return `Error ${actionLabel} ${config.friendlyTypeNames[typeName as keyof typeof config.friendlyTypeNames]}: ${message}`
}

/**
 * Get Select Query
 *
 * Gets the appropriate select query for base or detail catalog loading.
 *
 * @param config CRUD Configuration
 * @param detail Include Detail Select
 * @returns Select Query
 */
function getSelectQuery(
  config: CustomCatalogCrudConfig<CustomCatalogTableName>,
  detail: boolean
): string {
  return detail ? config.selectDetail : config.select
}

/**
 * Prepare Custom Insert
 *
 * Prepares the data for inserting a custom catalog row, ensuring the user is
 * authenticated if the row is marked as custom.
 *
 * @param input Custom Catalog Insert Input
 * @param userId Current User ID
 * @returns Prepared Insert Data
 */
function prepareCustomInsert<TableName extends CustomCatalogTableName>(
  input: CustomCatalogInsertInput<TableName>,
  userId: string | null
): Record<string, unknown> {
  const insertData = { ...input } as unknown as MutableInsert<TableName>

  // Always drop the user ID so it can be sourced from authentication data.
  delete insertData.user_id

  if (insertData.custom === true && !userId)
    throw new Error('Not Authenticated')

  return {
    ...insertData,
    custom: true,
    user_id: userId
  } as Record<string, unknown>
}

/**
 * Prepare Update
 *
 * Prepares the data for updating a custom catalog row, ensuring that certain
 * fields are not modified directly.
 *
 * @param input Custom Catalog Update Input
 * @returns Prepared Update Data
 */
function prepareUpdate<TableName extends CustomCatalogTableName>(
  input: CustomCatalogUpdateInput<TableName>
): Record<string, unknown> {
  const updateData = { ...input } as unknown as MutableUpdate<TableName>

  // Ensure the custom and user_id fields cannot be updated.
  delete updateData.custom
  delete updateData.user_id

  return updateData as Record<string, unknown>
}

/**
 * Create Custom Catalog CRUD
 *
 * Creates reusable DAL operations for custom catalog tables while letting
 * table-specific modules keep their domain names and one-off helpers.
 *
 * @param config CRUD Configuration
 * @returns Custom Catalog CRUD Operations
 */
export function createCustomCatalogCrud<
  TableName extends CustomCatalogTableName,
  Detail extends DetailWithId
>(
  config: CustomCatalogCrudConfig<TableName>
): CustomCatalogCrud<TableName, Detail> {
  return {
    async add(input) {
      const userId = await getUserIdOrNull()
      const table = getTableQuery(config.tableName)
      const insertData = prepareCustomInsert(input, userId)

      const { data, error } = await table
        .insert(insertData)
        .select('id')
        .single()

      if (error)
        throw new Error(createCrudErrorMessage(config, 'add', error.message))

      return data.id
    },
    async getAll(detail = false) {
      await getUserId()
      const table = getTableQuery(config.tableName)
      const select = getSelectQuery(config, detail)

      const { data, error } = (await table.select(select)) as QueryResponse<
        Detail[] | null
      >

      if (error)
        throw new Error(
          createCrudErrorMessage(config, 'fetchAll', error.message)
        )

      return toDataMap(data)
    },
    async getUserCustom(detail = false) {
      const userId = await getUserId()
      const table = getTableQuery(config.tableName)
      const select = getSelectQuery(config, detail)

      const { data, error } = await (
        table.select(select) as FilterBuilder<Detail[] | null>
      )
        .eq('custom', true)
        .eq('user_id', userId)
        .is('archived_at', null)

      if (error)
        throw new Error(
          createCrudErrorMessage(config, 'fetchCustom', error.message)
        )

      return toDataMap(data)
    },
    async remove(id) {
      const table = getTableQuery(config.tableName)

      const { error } = await table.delete().eq('id', id)

      if (error)
        throw new Error(createCrudErrorMessage(config, 'remove', error.message))
    },
    async update(id, input) {
      const table = getTableQuery(config.tableName)
      const updateData = prepareUpdate(input)

      const { error } = await table.update(updateData).eq('id', id)

      if (error)
        throw new Error(createCrudErrorMessage(config, 'update', error.message))
    }
  }
}
