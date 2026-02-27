// This file mocks the Prisma Client types because 'prisma generate' fails in this environment.

import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

declare module '@prisma/client' {
    export enum Role {
        SUPPLIER = 'SUPPLIER',
        ADMIN = 'ADMIN',
        SUPER_ADMIN = 'SUPER_ADMIN',
    }

    export enum SupplierStatus {
        DRAFT = 'DRAFT',
        SUBMITTED = 'SUBMITTED',
        UNDER_REVIEW = 'UNDER_REVIEW',
        VERIFIED = 'VERIFIED',
        CONDITIONAL = 'CONDITIONAL',
        REJECTED = 'REJECTED',
        SUSPENDED = 'SUSPENDED',
    }

    export enum ProductStatus {
        DRAFT = 'DRAFT',
        PENDING_APPROVAL = 'PENDING_APPROVAL',
        LIVE = 'LIVE',
        REJECTED = 'REJECTED',
        DELISTED = 'DELISTED',
    }

    export interface User {
        id: string;
        email: string;
        password: string;
        role: Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface Supplier {
        id: string;
        userId: string;
        companyName: string;
        status: SupplierStatus;
        [key: string]: any;
    }

    export interface Product {
        id: string;
        supplierId: string;
        name: string;
        status: ProductStatus;
        isLive: boolean;
        [key: string]: any;
    }

    export interface Document {
        id: string;
        supplierId: string;
        fileUrl: string;
        [key: string]: any;
    }

    export namespace Prisma {
        export interface UserCreateInput {
            email: string;
            password?: string;
            role?: Role;
            [key: string]: any;
        }
        export interface SupplierCreateInput {
            userId?: string;
            companyName: string;
            [key: string]: any;
        }
        export interface ProductCreateInput {
            supplierId?: string;
            name: string;
            [key: string]: any;
        }
        export interface DocumentCreateInput {
            supplierId?: string;
            fileUrl: string;
            [key: string]: any;
        }
    }

    export class PrismaClient {
        constructor(options?: any);
        $connect(): Promise<void>;
        $disconnect(): Promise<void>;
        $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;

        user: {
            findUnique(args: any): Promise<User | null>;
            create(args: any): Promise<User>;
            findMany(args?: any): Promise<User[]>;
            update(args: any): Promise<User>;
            delete(args: any): Promise<User>;
            count(args?: any): Promise<number>;
        };
        supplier: {
            findUnique(args: any): Promise<Supplier | null>;
            create(args: any): Promise<Supplier>;
            findMany(args?: any): Promise<Supplier[]>;
            update(args: any): Promise<Supplier>;
            count(args?: any): Promise<number>;
        };
        product: {
            findUnique(args: any): Promise<Product | null>;
            create(args: any): Promise<Product>;
            findMany(args?: any): Promise<Product[]>;
            update(args: any): Promise<Product>;
            findFirst(args?: any): Promise<Product | null>;
            delete(args: any): Promise<Product>;
            count(args?: any): Promise<number>;
        };
        document: {
            create(args: any): Promise<Document>;
            findMany(args?: any): Promise<Document[]>;
            count(args?: any): Promise<number>;
        };
        auditLog: {
            create(args: any): Promise<any>;
            count(args?: any): Promise<number>;
        };
    }
}
