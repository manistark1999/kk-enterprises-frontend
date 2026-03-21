Prompt

In the Service Items section of the Labour Bill form, when the user clicks the "+ Add Item" button, the system should display a dropdown list containing all available service items.

Requirements:

When "+ Add Item" is clicked:

A new row should be added to the Service Items table.

The Item Name dropdown should automatically open showing all available service items.

The dropdown should display all items from the Service Item master list, such as:

Oil Change

Engine Repair

Brake Service

Wheel Alignment

etc.

When the user selects an item:

The Rate should auto-fill based on the selected item.

The GST % should auto-fill if applicable.

The Amount should auto-calculate:

Amount = Quantity × Rate

The user should still be able to manually change Quantity if needed.

Each row should include:

Item Name (dropdown)

Quantity

Rate

GST %

Amount

Delete icon

Maintain the same UI style as the existing Service Items table.