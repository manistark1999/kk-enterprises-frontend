**Prompt: Add Vehicle Model Management to Vehicle Make Module**

Update the Masters → Vehicle Make module to support **Vehicle Model management**. Currently, the system only stores the vehicle make, but the Labour Bill requires both **Vehicle Make and Vehicle Model**.

Implement the following improvements:

1. Add a **Vehicle Model management section** linked to each Vehicle Make.
2. Each Vehicle Make should support **multiple Vehicle Models** (one-to-many relationship).

Example:

Vehicle Make: Tata
Vehicle Models:

* 407
* 1613
* Signa 2823

Vehicle Make: Ashok Leyland
Vehicle Models:

* 1616
* 2518
* Dost

3. Modify the Vehicle Make screen so that when editing or creating a make, the user can:

* Add multiple vehicle models
* Edit existing models
* Remove models

4. Update the database structure to support this relationship:

vehicle_makes

* id
* make_name
* country
* status

vehicle_models

* id
* make_id (foreign key referencing vehicle_makes)
* model_name
* status

5. In the Labour Bill module:

* When a user selects **Vehicle Make**, automatically filter and show only the **Vehicle Models that belong to that make**.

Example workflow:

User selects Vehicle Make → Tata
Vehicle Model dropdown automatically shows:

* 407
* 1613
* Signa 2823

6. Ensure the Vehicle Model dropdown is dynamically populated from the master data and updates automatically when new models are added.

7. Add validation to prevent duplicate models under the same vehicle make.

8. Ensure all dropdowns using Vehicle Model (Labour Bill, Estimation, etc.) are automatically synchronized with the Masters data.

The final result should allow users to manage **Vehicle Makes and their Models properly**, and the Labour Bill form must always show the correct models based on the selected make.
