import { prisma } from '../../main/database/database.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';
import { createLogger } from '../utils/logger.js';
import { z } from 'zod';
const logger = createLogger('BaseRepository');
/**
 * Base repository with common database operations
 *
 * This generic repository provides standard CRUD operations with validation
 * and error handling.
 */
export class BaseRepository {
    constructor(tableName, validationSchema) {
        this.prisma = prisma;
        this.tableName = tableName;
        this.validationSchema = validationSchema;
    }
    /**
     * Validate input data against the schema
     */
    validate(data, operation) {
        try {
            return this.validationSchema.parse(data);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = {};
                error.errors.forEach(err => {
                    const path = err.path.join('.') || 'value';
                    formattedErrors[path] = err.message;
                });
                const errorMessage = `Validation failed for ${this.tableName} during ${operation}: ${Object.values(formattedErrors).join(', ')}`;
                logger.error(errorMessage, { errors: formattedErrors, data });
                const ValidationError = require('../utils/errors/AppError').ValidationError;
                throw new ValidationError(errorMessage, formattedErrors, { context: { operation, data } });
            }
            throw error;
        }
    }
    /**
     * Get all records
     */
    async getAll(options = {}) {
        try {
            // @ts-ignore - Dynamic access to Prisma models
            return await this.prisma[this.tableName].findMany(options);
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getAll',
                table: this.tableName
            });
        }
    }
    /**
     * Get a record by ID
     */
    async getById(id, options = {}) {
        try {
            // @ts-ignore - Dynamic access to Prisma models
            return await this.prisma[this.tableName].findUnique({
                where: { id },
                ...options
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getById',
                table: this.tableName,
                id
            });
        }
    }
    /**
     * Create a new record
     */
    async create(data) {
        try {
            // Validate the data
            const validatedData = this.validate(data, 'create');
            // Create the record
            // @ts-ignore - Dynamic access to Prisma models
            return await this.prisma[this.tableName].create({
                data: validatedData
            });
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
                throw error; // Re-throw validation errors
            }
            return handleDatabaseError(error, {
                operation: 'create',
                table: this.tableName,
                data
            });
        }
    }
    /**
     * Update a record
     */
    async update(id, data) {
        try {
            // Validate the data
            const validatedData = this.validate({ ...data, id }, 'update');
            // Remove id from the data to update
            const { id: _, ...dataToUpdate } = validatedData;
            // Update the record
            // @ts-ignore - Dynamic access to Prisma models
            return await this.prisma[this.tableName].update({
                where: { id },
                data: dataToUpdate
            });
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
                throw error; // Re-throw validation errors
            }
            return handleDatabaseError(error, {
                operation: 'update',
                table: this.tableName,
                id,
                data
            });
        }
    }
    /**
     * Delete a record
     */
    async delete(id) {
        try {
            // @ts-ignore - Dynamic access to Prisma models
            return await this.prisma[this.tableName].delete({
                where: { id }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'delete',
                table: this.tableName,
                id
            });
        }
    }
    parseJsonField(jsonString, defaultValue) {
        if (!jsonString)
            return defaultValue;
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            logger.error(`Failed to parse JSON field in ${this.tableName}`, { error, tableName: this.tableName });
            return defaultValue;
        }
    }
    stringifyJsonField(data) {
        if (data === null || data === undefined)
            return '{}';
        try {
            return JSON.stringify(data);
        }
        catch (error) {
            logger.error(`Failed to stringify JSON field in ${this.tableName}`, { error, tableName: this.tableName });
            return '{}';
        }
    }
}
