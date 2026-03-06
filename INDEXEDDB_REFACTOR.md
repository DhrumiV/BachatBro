# IndexedDB Refactor - Complete Documentation

## Overview

This document describes the complete refactoring of BachatBro's offline storage system from localStorage to IndexedDB using Dexie.js.

## What Changed

### Before (localStorage)
- Two separate storage keys:
  - `bachatbro_transactions_cache` - Full transaction list
  - `bachatbro_sync_queue` - Pending transactions
- Synchronous JSON parsing/stringifying
- Manual cache management
- Duplicate data storage
- Limited to ~5-10MB

### After (IndexedDB)
- Single source of truth: `bachatbro_db.transactions` table
- Asynchronous database operations
- Structured queries with indexes
- No data duplication
- Scales to hundreds of thousands of records

## New Architecture

### Database Schema

**Database Name:** `bachatbro_db`

**Table:** `transactions`

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key, generated with `crypto.randomUUID()` |
| date | string | Transaction date (YYYY-MM-DD) |
| month | string | Month (YYYY-MM) |
| category | string | Category name |
| subCategory | string | Subcategory name |
| paymentMethod | string | Payment method (Cash, UPI, Card, etc.) |
| cardName | string | Card name if payment method is Card |
| amount | number | Transaction amount |
| type | string | Transaction type (Expense, Income, EMI, Investment, Savings) |
| notes | string | Optional notes |
| createdAt | string (ISO) | Creation timestamp |
| updatedAt | string (ISO) | Last update timestamp |
| sheetRowIndex | number | Row number in Google Sheets (null if not synced) |
| syncStatus | string | 'pending' \| 'synced' \| 'failed' |

### Google Sheets Schema (Updated)

**New 