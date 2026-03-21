# KK Enterprises - Modal Layout Guide

## Overview
All popup forms and modal windows must appear **perfectly centered on the screen** with proper alignment, consistent dimensions, and professional styling.

## Core Requirements

### 1. **Perfect Center Alignment**
- Modals must be centered both **horizontally and vertically**
- Uses flexbox centering with backdrop overlay
- Responsive on all screen sizes

### 2. **Consistent Modal Width**
- Small modals: **500px**
- Medium modals: **650px** (recommended, 600px-700px range)
- Large modals: **800px**

### 3. **Input Field Specifications**
- Input height: **48px** (h-12)
- Border radius: **8px**
- Field spacing: **16px-20px** between rows
- Labels properly aligned above inputs with 8px margin

### 4. **Two-Column Grid Layout**
```
Date          | Customer
Amount        | Payment Mode
Description   [Full Width]
```

### 5. **Button Alignment**
- **Save button on the LEFT**
- **Cancel button on the RIGHT**
- Equal button height (48px) and spacing (16px gap)

### 6. **Background Overlay**
- Dark overlay with blur effect (`bg-black/60 backdrop-blur-sm`)
- Focuses attention on the modal

## Complete Modal Template

```typescript
import { 
  getModalOverlayClass,
  getModalContentClass,
  getModalHeaderClass,
  getModalBodyClass,
  getModalFooterClass,
  getModalButtonGroupClass,
  getModalGridClass,
  getFullWidthFieldClass,
  getLabelClass,
  getInputClass,
  getSelectClass,
  getTextareaClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

function MyModal({ isOpen, onClose, isDarkMode }: MyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Perfect center with backdrop blur */}
          <motion.div
            className={getModalOverlayClass()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal Content - Centered with consistent width */}
            <motion.div
              className={getModalContentClass(isDarkMode, 'medium')}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={getModalHeaderClass(isDarkMode)}>
                <h2 className="text-xl font-bold">
                  Add Payment
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className={getModalBodyClass()}>
                {/* 2-Column Grid */}
                <div className={getModalGridClass()}>
                  {/* Field 1 */}
                  <div>
                    <label className={getLabelClass(isDarkMode)}>
                      Date
                    </label>
                    <input
                      type="date"
                      className={getInputClass(isDarkMode)}
                    />
                  </div>

                  {/* Field 2 */}
                  <div>
                    <label className={getLabelClass(isDarkMode)}>
                      Customer
                    </label>
                    <select className={getSelectClass(isDarkMode)}>
                      <option>Select customer</option>
                    </select>
                  </div>

                  {/* Field 3 */}
                  <div>
                    <label className={getLabelClass(isDarkMode)}>
                      Amount
                    </label>
                    <input
                      type="number"
                      className={getInputClass(isDarkMode)}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Field 4 */}
                  <div>
                    <label className={getLabelClass(isDarkMode)}>
                      Payment Mode
                    </label>
                    <select className={getSelectClass(isDarkMode)}>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                    </select>
                  </div>

                  {/* Full Width Field - Description */}
                  <div className={getFullWidthFieldClass()}>
                    <label className={getLabelClass(isDarkMode)}>
                      Description
                    </label>
                    <textarea
                      className={getTextareaClass(isDarkMode)}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Save LEFT, Cancel RIGHT */}
              <div className={getModalFooterClass(isDarkMode)}>
                <button className={getPrimaryButtonClass()}>
                  Save
                </button>
                <button 
                  className={getSecondaryButtonClass(isDarkMode)}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## Utility Functions Reference

### Modal Structure
- `getModalOverlayClass()` - Fixed overlay with center alignment and backdrop blur
- `getModalContentClass(isDarkMode, size)` - Modal container with consistent width
- `getModalHeaderClass(isDarkMode)` - Header with border and padding
- `getModalBodyClass()` - Body with proper padding
- `getModalFooterClass(isDarkMode)` - Footer with border and button layout

### Modal Layout
- `getModalGridClass()` - 2-column responsive grid for form fields
- `getModalButtonGroupClass()` - Button group (Save left, Cancel right)
- `getFullWidthFieldClass()` - Full-width field (spans 2 columns)

### Form Elements (Same as main forms)
- `getLabelClass(isDarkMode)` - Label styling
- `getInputClass(isDarkMode)` - Input styling (48px height)
- `getSelectClass(isDarkMode)` - Dropdown styling
- `getTextareaClass(isDarkMode)` - Textarea styling
- `getPrimaryButtonClass()` - Primary button (Save)
- `getSecondaryButtonClass(isDarkMode)` - Secondary button (Cancel)

## Key Differences from Main Forms

| Aspect | Main Forms | Modal Forms |
|--------|------------|-------------|
| **Container** | `getFormContainerClass()` | `getModalContentClass()` |
| **Background** | None | Dark overlay with blur |
| **Position** | Static flow | Fixed center (vertical + horizontal) |
| **Width** | 900px-1100px | 500px-700px |
| **Buttons** | Right aligned | Save LEFT, Cancel RIGHT |
| **Grid** | `getFormGridClass()` | `getModalGridClass()` (same) |

## Modal Sizes

### Small Modal (500px)
```typescript
getModalContentClass(isDarkMode, 'small')
```
Use for: Simple forms with 2-4 fields

### Medium Modal (650px) - **Recommended**
```typescript
getModalContentClass(isDarkMode, 'medium')
```
Use for: Standard forms with 4-8 fields

### Large Modal (800px)
```typescript
getModalContentClass(isDarkMode, 'large')
```
Use for: Complex forms with 8+ fields

## Modals in the System

### Billing
- Receipt Modal
- Payment Modal
- Estimation Modal

### Inventory
- Purchase Modal
- Stock Adjustment Modal
- Item/Service Modal

### Accounts
- Expense Entry Modal
- Staff Advance Modal
- Salary Entry Modal
- Cash Entry Modal

### Masters
- Customer Modal
- Vehicle Make Modal
- Work Group Modal
- Work Type Modal
- Supplier Modal
- Transport Modal
- Staff Modal
- Brand Modal
- Item Modal

### Settings
- User Management Modal
- Bank Account Modal

## Animation Best Practices

```typescript
// Overlay animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>

// Modal content animation
<motion.div
  initial={{ scale: 0.95, opacity: 0, y: 20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.95, opacity: 0, y: 20 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

## Responsive Behavior

### Desktop (>1024px)
- Modal width: Full specified width (500px/650px/800px)
- 2-column grid layout
- Centered vertically and horizontally

### Tablet (768px-1024px)
- Modal width: Full specified width with padding
- 2-column grid layout maintained
- Centered vertically and horizontally

### Mobile (<768px)
- Modal width: Full width minus padding
- Single column layout (grid collapses)
- Centered vertically and horizontally
- `max-h-[90vh]` ensures scrollable content

## Common Mistakes to Avoid

❌ Don't use absolute positioning without centering
❌ Don't forget the backdrop overlay
❌ Don't use inconsistent modal widths
❌ Don't align buttons on the right (Save should be left in modals)
❌ Don't forget to make description/notes full width
❌ Don't skip the AnimatePresence wrapper
❌ Don't forget to stop propagation on modal content click

## Accessibility

- Press `Escape` to close modal
- Click outside modal to close
- Focus trap within modal
- Proper ARIA labels

```typescript
// Add keyboard handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
  }
  
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

## Final Checklist

✅ Modal perfectly centered (horizontal + vertical)
✅ Consistent width (500px/650px/800px)
✅ Input height 48px with 8px border radius
✅ Field spacing 16px-20px
✅ 2-column grid layout
✅ Description spans full width
✅ Save button on LEFT, Cancel on RIGHT
✅ Dark backdrop with blur effect
✅ Smooth animations
✅ Responsive design
✅ Click outside to close
✅ Escape key to close

All modals will now have a consistent, professional appearance across the entire workshop management system!
