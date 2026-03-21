# Form Validation Guide - KK Enterprises

## Overview

This guide explains how to implement consistent form validation with red stars (*) and red borders for required fields across all screens in the KK Enterprises application.

## Features

✅ **Automatic red star (*) for required fields**  
✅ **Real-time validation with red border for empty required fields**  
✅ **Red border disappears when field is filled**  
✅ **Consistent styling across all forms**  
✅ **Works with text, number, date, email, textarea, and select inputs**

---

## Quick Start

### Method 1: Using FormField Component (Recommended)

```tsx
import { FormField } from '../components/ui/FormField';

// In your component:
<FormField
  label="Customer Name"
  name="customerName"
  value={formData.customerName}
  onChange={handleInputChange}
  required
  isDarkMode={isDarkMode}
  showValidation={true}
/>
```

### Method 2: Using Validation Utilities

```tsx
import { 
  getInputClassWithValidation,
  getLabelClass,
  isFieldEmpty 
} from '../../utils/formStyles';

// In your JSX:
<div>
  <label className={getLabelClass(isDarkMode)}>
    Customer Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.name))}
    placeholder="Enter customer name"
  />
</div>
```

---

## Available Validation Functions

### 1. `isFieldEmpty(value: any): boolean`

Checks if a field is empty.

```tsx
isFieldEmpty('')           // true
isFieldEmpty(null)         // true
isFieldEmpty(undefined)    // true
isFieldEmpty('  ')         // true (whitespace only)
isFieldEmpty('hello')      // false
isFieldEmpty(0)            // false (numbers are valid)
isFieldEmpty(['a'])        // false
```

### 2. `getInputClassWithValidation(isDarkMode: boolean, hasError: boolean)`

Returns input class with red border when hasError is true.

```tsx
// Red border for empty required field
className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.name))}

// Normal styling when filled
className={getInputClassWithValidation(isDarkMode, false)}
```

### 3. `getTextareaClassWithValidation(isDarkMode: boolean, hasError: boolean)`

Same as above but for textarea elements.

```tsx
<textarea
  className={getTextareaClassWithValidation(isDarkMode, isFieldEmpty(formData.description))}
  ...
/>
```

### 4. `getSelectClassWithValidation(isDarkMode: boolean, hasError: boolean)`

Same as above but for select/dropdown elements.

```tsx
<select
  className={getSelectClassWithValidation(isDarkMode, isFieldEmpty(formData.category))}
  ...
/>
```

---

## FormField Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | string | ✅ | - | Label text |
| `name` | string | ✅ | - | Input name attribute |
| `value` | any | ✅ | - | Input value |
| `onChange` | function | ✅ | - | Change handler |
| `type` | string | ❌ | 'text' | Input type (text, number, date, email, tel, textarea, select) |
| `placeholder` | string | ❌ | - | Placeholder text |
| `required` | boolean | ❌ | false | Mark field as required |
| `isDarkMode` | boolean | ✅ | - | Dark mode state |
| `disabled` | boolean | ❌ | false | Disable input |
| `options` | array | ❌ | [] | Options for select type |
| `showValidation` | boolean | ❌ | true | Enable real-time validation |

### Examples

**Text Input:**
```tsx
<FormField
  label="Customer Name"
  name="customerName"
  value={formData.customerName}
  onChange={handleChange}
  required
  isDarkMode={isDarkMode}
  placeholder="Enter customer name"
/>
```

**Phone Input:**
```tsx
<FormField
  label="Phone Number"
  name="phone"
  type="tel"
  value={formData.phone}
  onChange={handleChange}
  required
  isDarkMode={isDarkMode}
  placeholder="10-digit phone number"
/>
```

**Email Input:**
```tsx
<FormField
  label="Email Address"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  isDarkMode={isDarkMode}
  placeholder="customer@email.com"
/>
```

**Textarea:**
```tsx
<FormField
  label="Description"
  name="description"
  type="textarea"
  value={formData.description}
  onChange={handleChange}
  isDarkMode={isDarkMode}
  rows={4}
/>
```

**Select/Dropdown:**
```tsx
<FormField
  label="Category"
  name="category"
  type="select"
  value={formData.category}
  onChange={handleChange}
  required
  isDarkMode={isDarkMode}
  options={[
    { value: 'service', label: 'Service' },
    { value: 'product', label: 'Product' }
  ]}
/>
```

---

## Form Validation Hook

Use the `useFormValidation` hook for advanced validation logic:

```tsx
import { useFormValidation } from '../../hooks/useFormValidation';

const validationRules = [
  { field: 'name', required: true, message: 'Name is required' },
  { field: 'phone', required: true, minLength: 10, message: 'Phone must be 10 digits' },
  { field: 'email', required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
];

const { errors, validateForm, isFormValid } = useFormValidation(formData, validationRules);

const handleSave = () => {
  if (!isFormValid()) {
    toast.error('Please fill all required fields');
    return;
  }
  
  // Save logic...
};
```

---

## Complete Example: Customer Form

```tsx
import React, { useState } from 'react';
import { FormField } from '../components/ui/FormField';
import { 
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  isFieldEmpty 
} from '../../utils/formStyles';
import { toast } from 'sonner@2.0.3';

export function CustomerForm({ isDarkMode }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Check required fields
    if (isFieldEmpty(formData.name)) {
      toast.error('Please enter customer name');
      return;
    }
    if (isFieldEmpty(formData.phone)) {
      toast.error('Please enter phone number');
      return;
    }

    // Save logic...
    toast.success('Customer saved successfully');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Customer Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          isDarkMode={isDarkMode}
          placeholder="Enter customer name"
        />

        <FormField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          isDarkMode={isDarkMode}
          placeholder="10-digit phone number"
        />
      </div>

      <FormField
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        isDarkMode={isDarkMode}
        placeholder="customer@email.com"
      />

      <FormField
        label="Address"
        name="address"
        type="textarea"
        value={formData.address}
        onChange={handleChange}
        isDarkMode={isDarkMode}
        placeholder="Enter complete address"
        rows={3}
      />

      <div className="flex gap-4 justify-end mt-6">
        <button
          onClick={handleSave}
          className={getPrimaryButtonClass()}
        >
          Save Customer
        </button>
        <button
          className={getSecondaryButtonClass(isDarkMode)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

---

## Styling Details

### Light Mode - Required Field (Empty)
- **Border:** `border-red-500`
- **Focus Ring:** `focus:ring-red-500/20`
- **Label:** Red asterisk (*)

### Light Mode - Required Field (Filled)
- **Border:** `border-gray-300` (normal blue on focus)
- **Label:** Red asterisk (*) remains

### Dark Mode - Required Field (Empty)
- **Border:** `border-red-500`
- **Background:** `bg-gray-700/50`
- **Label:** Red asterisk (*)

### Dark Mode - Required Field (Filled)
- **Border:** `border-gray-600` (normal blue on focus)
- **Background:** `bg-gray-700/50`
- **Label:** Red asterisk (*) remains

---

## Best Practices

1. **Always use red asterisk (*) for required fields**
   ```tsx
   <label>
     Field Name <span className="text-red-500">*</span>
   </label>
   ```

2. **Enable real-time validation for better UX**
   ```tsx
   className={getInputClassWithValidation(isDarkMode, isFieldEmpty(value))}
   ```

3. **Show toast error on save attempt with empty required fields**
   ```tsx
   if (isFieldEmpty(formData.name)) {
     toast.error('Please enter customer name');
     return;
   }
   ```

4. **Use FormField component for consistency**
   - Automatically handles red stars
   - Built-in validation styling
   - Consistent across all screens

5. **Validate before saving**
   ```tsx
   const handleSave = () => {
     if (!isFormValid()) {
       toast.error('Please fill all required fields');
       return;
     }
     // Save logic...
   };
   ```

---

## Migration Guide

### Before (Old Code):
```tsx
<div>
  <label className={labelClass}>
    Customer Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className={inputClass}  // ❌ No validation styling
    placeholder="Enter customer name"
  />
</div>
```

### After (New Code):
```tsx
<div>
  <label className={labelClass}>
    Customer Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.name))}  // ✅ With validation
    placeholder="Enter customer name"
  />
</div>
```

### Even Better (Using FormField):
```tsx
<FormField
  label="Customer Name"
  name="name"
  value={formData.name}
  onChange={handleChange}
  required
  isDarkMode={isDarkMode}
  placeholder="Enter customer name"
/>
```

---

## Screens Already Updated

✅ **Customer Master Screen** - Full validation implemented

## Screens To Update

- Job Card Form
- Vehicle Registry Form
- Labour Bill Form
- Estimation Form
- Sales/Purchase Forms
- All other form screens

---

## Support

For questions or issues with form validation, refer to:
- `/utils/formStyles.ts` - Validation utilities
- `/components/ui/FormField.tsx` - FormField component
- `/hooks/useFormValidation.ts` - Validation hook
- `/components/screens/CustomerMasterScreen.tsx` - Example implementation
