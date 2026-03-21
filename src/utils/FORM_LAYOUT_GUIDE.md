# KK Enterprises - Form Layout Guide

## Overview
All forms across the KK Enterprises Workshop Management System follow a consistent, centered layout pattern to ensure a clean and professional user interface.

## Core Principles

### 1. **Centered Layout**
- All forms must be center-aligned inside the main content panel
- Form containers have a maximum width of 900px-1100px
- Horizontal centering using `margin: 0 auto`

### 2. **Standard Dimensions**

#### Container Widths:
```typescript
import { getFormContainerClass } from './formStyles';

// Small forms (900px)
<div className={getFormContainerClass('small')}>

// Medium forms (1000px) - DEFAULT
<div className={getFormContainerClass('medium')}>

// Large forms (1100px)
<div className={getFormContainerClass('large')}>
```

#### Input Heights:
- Standard input height: **48px** (h-12)
- Button height: **48px** (h-12)
- Textarea minimum height: **100px**

#### Spacing:
- Top margin: **24px** (mt-6)
- Card padding: **28px** (p-7)
- Label spacing: **8px** above inputs (mb-2)
- Field gap: **20px** between rows (gap-5)
- Button gap: **16px** between buttons (gap-4)

### 3. **Two-Column Grid Layout**

All forms should use a responsive 2-column grid:

```typescript
import { getFormGridClass } from './formStyles';

<div className={getFormGridClass()}>
  {/* Left column */}
  <div>
    <label>Vehicle Number</label>
    <input />
  </div>
  
  {/* Right column */}
  <div>
    <label>Vehicle Make</label>
    <select />
  </div>
</div>
```

**Example Layout:**
```
Vehicle Number    | Vehicle Make
Vehicle Model     | KM Reading
Fuel Level        | Status
```

### 4. **Button Alignment**

Save/Cancel buttons should be **right-aligned at the bottom**:

```typescript
import { getButtonGroupClass } from './formStyles';

<div className={getButtonGroupClass()}>
  <button>Cancel</button>
  <button>Save</button>
</div>
```

## Complete Form Template

```typescript
import { 
  getFormContainerClass,
  getFormSectionClass,
  getFormGridClass,
  getLabelClass,
  getInputClass,
  getSelectClass,
  getButtonGroupClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';

function MyFormScreen({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={getFormContainerClass('medium')}>
      {/* Form Section */}
      <div className={getFormSectionClass(isDarkMode)}>
        {/* Form Grid - 2 columns */}
        <div className={getFormGridClass()}>
          {/* Field 1 */}
          <div>
            <label className={getLabelClass(isDarkMode)}>
              Vehicle Number
            </label>
            <input 
              type="text"
              className={getInputClass(isDarkMode)}
              placeholder="Enter vehicle number"
            />
          </div>

          {/* Field 2 */}
          <div>
            <label className={getLabelClass(isDarkMode)}>
              Vehicle Make
            </label>
            <select className={getSelectClass(isDarkMode)}>
              <option>Select make</option>
            </select>
          </div>

          {/* More fields... */}
        </div>

        {/* Button Group - Right aligned */}
        <div className={getButtonGroupClass()}>
          <button className={getSecondaryButtonClass(isDarkMode)}>
            Cancel
          </button>
          <button className={getPrimaryButtonClass()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Utility Functions Reference

### Container & Layout
- `getFormContainerClass(size)` - Centered form container with max-width
- `getFormSectionClass(isDarkMode)` - Glassmorphic card for form sections
- `getFormGridClass()` - 2-column responsive grid layout
- `getButtonGroupClass()` - Right-aligned button group

### Form Elements
- `getLabelClass(isDarkMode)` - Consistent label styling
- `getInputClass(isDarkMode)` - Standard input styling (48px height)
- `getSelectClass(isDarkMode)` - Dropdown/select styling (48px height)
- `getTextareaClass(isDarkMode)` - Textarea styling (min 100px)

### Buttons
- `getPrimaryButtonClass()` - Primary action buttons (blue gradient)
- `getSecondaryButtonClass(isDarkMode)` - Secondary action buttons
- `getIconButtonClass(isDarkMode, scheme)` - Icon-only action buttons

### Cards & Display
- `getCardClass(isDarkMode)` - Glassmorphic card styling
- `getTableHeaderClass(isDarkMode)` - Table header cell styling
- `getTableCellClass(isDarkMode)` - Table body cell styling

## Modules Using This Layout

### Billing
- Labour Bill
- Estimation
- Receipt
- Payment

### Inventory
- Purchase
- Sales
- Stock List
- Stock Adjustment

### Accounts
- Expense Entry
- Staff Advance
- Salary Entry
- Cash Entry
- Bank Ledger

### Masters
- Customer
- Transport
- Vehicle Make
- Work Group
- Work Type
- Supplier
- Staff
- Brand
- Item
- Bank Accounts

### Settings
- Company
- Backup
- Restore
- Financial Year
- User Management

## Key Design Goals

✅ **Center-aligned** - Forms don't stretch full width
✅ **Consistent spacing** - Same margins, padding, gaps everywhere
✅ **Equal dimensions** - All inputs have uniform height
✅ **Professional appearance** - Clean, modern dashboard UI
✅ **Responsive** - Works on desktop, tablet, and mobile
✅ **Glassmorphic** - Backdrop blur effects for premium feel

## Common Mistakes to Avoid

❌ Don't use full-width forms without max-width constraint
❌ Don't use inconsistent input heights
❌ Don't left-align buttons (they should be right-aligned)
❌ Don't create custom padding/spacing (use utilities)
❌ Don't skip the 2-column grid layout
❌ Don't use single-column layouts for multi-field forms

## Questions?

All form styling constants are defined in `/utils/formStyles.ts`. Import the utility functions and use them consistently across all screens.
