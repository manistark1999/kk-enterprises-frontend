**Prompt: Fix Work Group Integration in Items & Services Module**

Update the Items & Services form so that the **Work Group dropdown is properly connected to the Work Group master data**.

### 1. Connect Work Group Master

The **Work Group dropdown** must fetch all active work groups from the **Masters → Work Group** module.

Example Work Groups:

* Alignment
* Engine Work
* Electrical
* Suspension
* Oil Service

These values must appear automatically in the dropdown.

---

### 2. Database Relationship

Ensure the Items & Services table includes a reference to Work Group.

Table: items_services

Fields:

* id
* name
* type (Item / Service)
* category
* work_group_id (foreign key referencing work_groups.id)
* default_rate
* gst_percentage
* unit
* description
* status
* created_at

Table: work_groups

Fields:

* id
* group_name
* description
* status

---

### 3. Dropdown Logic

When the Items & Services form loads:

* Fetch all active work groups.
* Populate the dropdown list.

Example dropdown values:

Alignment
Engine Work
Electrical
Suspension
Oil Service

---

### 4. Selection Behavior

When a user selects a Work Group:

The selected **work_group_id** must be saved with the item/service record.

Example:

Item Name: Wheel Alignment
Work Group: Alignment
Rate: ₹500
GST: 18%

Saved record:

work_group_id → Alignment ID

---

### 5. Integration With Labour Bill

When the item/service is selected in **Labour Bill**:

The system should automatically know which **Work Group** the service belongs to.

Example:

Wheel Alignment → Work Group → Alignment

This helps generate reports like:

* Work Group Revenue
* Service category analysis
* Workshop productivity reports

---

### 6. Validation

Add validation rules:

* Work Group must be selected for Service type.
* Prevent saving without selecting a Work Group.
* Only active work groups should appear in the dropdown.

---

### 7. Final Expected Result

Masters → Work Group
↓
Items & Services → Work Group dropdown populated
↓
Item saved with Work Group ID
↓
Labour Bill automatically understands service category.

The system must ensure that **Items & Services are properly categorized using Work Groups and fully synchronized with the Masters module.**
