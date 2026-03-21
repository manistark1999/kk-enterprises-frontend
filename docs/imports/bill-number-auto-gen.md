Fix the **Bill Number auto-generation and icon visibility in the Document Information section** while keeping the **existing UI design, layout, colors, alignment, width, height, spacing, and styling exactly the same**.

Functional Requirements:

1. **Bill Number Auto Generation**

   * The **Bill No. field must automatically generate the next bill number** when a new billing entry is created.
   * The format must follow the existing pattern:

     `LB-YYYY-XXX`

     Example:

     * LB-2024-001
     * LB-2024-002
     * LB-2024-003

2. **Automatic Increment**

   * When a bill is **saved successfully**, the system must:

     * Store the current bill number.
     * Automatically generate the **next bill number** for the next billing entry.
   * Example:

     * After saving **LB-2024-001**, the next bill should become **LB-2024-002** automatically.

3. **Year Handling**

   * If the **year changes**, the bill number counter should reset.
   * Example:

     * Last bill: `LB-2024-150`
     * New year entry → `LB-2025-001`

4. **Read-Only Field**

   * The **Bill No. field must remain auto-generated and not editable by the user**.

5. **Icon Visibility**

   * Ensure the **Document Information icon** and field icons display correctly in both **Light Mode and Dark Mode**.
   * Icons must remain visible and properly aligned with the field labels.

6. **Data Integrity**

   * The system must prevent duplicate bill numbers.
   * The bill number must always be unique for each saved billing record.

7. **UI Protection**
   Do **not modify**:

   * Layout
   * Alignment
   * Width / Height
   * Margins / Spacing
   * Colors
   * Component styling

Goal:

Ensure the **Bill Number automatically increments after each completed billing entry**, while the **Document Information icons remain visible and properly aligned across the interface**.
