**FULL PROMPT: Create and Integrate Items & Services Master Module**

Update the Truck / Workshop Management System by implementing a complete **Items & Services Master Module** and integrating it across all related modules such as Labour Bill, Estimation, Purchase, Sales, and Reports.

### 1. Create Items & Services Master

Add a new module in **Masters → Items & Services**.

This module will store all workshop service operations and spare parts used in billing, purchases, and inventory.

Users must be able to:

* Add Item or Service
* Edit Item or Service
* Delete Item or Service
* Activate or deactivate records
* Search and filter items

### 2. Fields Required

Create the following fields:

* Item / Service Name
* Type (Item or Service)
* Category (Optional)
* Work Group
* Default Rate
* GST Percentage
* Unit (Piece, Liter, Box, etc.)
* Description
* Status (Active / Inactive)
* Created Date

Example records:

Services:

* Wheel Alignment
* Oil Change
* Engine Repair
* Brake Service

Items:

* Engine Oil
* Brake Pad
* Air Filter
* Fuel Filter

### 3. Database Structure

Create a table called:

items_services

Fields:

id
name
type (Item / Service)
category
work_group_id
default_rate
gst_percentage
unit
description
status
created_at

### 4. Integration With Labour Bill

In the **Labour Bill → Items & Services section**:

The dropdown **“Choose an item or service to add”** must automatically load records from the Items & Services master.

When a user selects an item/service:

The system should automatically fill:

* Item Name
* Default Rate
* GST %
* Quantity (default 1)

The system must automatically calculate:

Amount = Quantity × Rate
GST Amount
Final Total

Example:

User selects **Wheel Alignment**

Auto fill:

Rate → ₹500
GST → 18%

Calculation:

Amount → ₹500
GST → ₹90
Total → ₹590

### 5. Integration With Estimation

The Estimation module must use the same Items & Services master so that:

* Users can select services
* Rate and GST auto populate
* Total estimation amount is calculated automatically

### 6. Integration With Purchase

If the item type is **Item**, it should also be available in the **Purchase module**.

Purchase will:

* Increase stock quantity
* Update stock valuation

### 7. Integration With Sales

Sales module should allow selecting **Items only**.

When sales occur:

* Stock quantity decreases
* Sales report updates

### 8. Stock Integration

If the record type is **Item**, it must be linked to stock management.

Stock fields:

* Item ID
* Quantity
* Stock Value
* Minimum Stock Level

Stock must update automatically when:

Purchase → Stock increases
Sales → Stock decreases
Stock Adjustment → Manual correction

### 9. Validation

Implement validation rules:

* Prevent duplicate item names
* Rate must be greater than zero
* GST must be valid percentage
* Required fields must not be empty

### 10. UI Requirements

Items & Services page must include:

* Table listing all items
* Add Item button
* Edit and Delete actions
* Search bar
* Filter by Type (Item / Service)
* Pagination
* Responsive layout

### 11. Automatic Synchronization

Ensure all modules automatically update when Items & Services are added or edited.

Modules affected:

Labour Bill
Estimation
Purchase
Sales
Reports
Dashboard

The system must ensure that the **Items & Services master acts as the central data source for all item and service selections across the application**.

### 12. Reports Integration

Reports should include:

* Service Revenue Report
* Item Sales Report
* Stock Movement Report

### 13. Final Expected Result

After implementation:

Masters → Items & Services
↓
Labour Bill → Select item/service
↓
Auto fill rate, GST, and amount
↓
Reports and stock update automatically.

The system should function as a **fully integrated workshop ERP where all items and services are centrally managed and automatically synchronized across the entire system.**
