Implement a **popup navigation menu for the collapsed sidebar icons**.

When the sidebar is in **icon-only (collapsed) mode**, clicking any icon must display a **popup menu panel next to the sidebar** showing the full module name and its submenu items.

System behavior:

1. When the user **clicks any sidebar icon**, a **popup menu should appear to the right side of the sidebar**.
2. The popup must show the **module title and all its submenu items**.

Example:

Click **Billing icon**
Popup menu shows:

* Labour Bill
* Estimation
* Receipt
* Payment

Click **Inventory icon**
Popup menu shows:

* Purchase
* Sales
* Stock List
* Stock Adjustment

Click **Accounts icon**
Popup menu shows:

* Expense Entry
* Staff Advance
* Salary Entry
* Cash Register
* Bank Ledger

Click **Reports icon**
Popup menu shows:

* Alignment Register
* Expense Register
* Receipt Register
* Cash Register
* GST Report
* MIS Report
* Stock Report

Click **Masters icon**
Popup menu shows:

* Transport
* Vehicle Make
* Work Group
* Work Type
* Supplier

Click **Settings icon**
Popup menu shows:

* Company
* Backup
* Restore
* Financial Year
* User Management

Popup behavior requirements:

• Popup appears **aligned with the clicked icon**
• Popup opens with **smooth slide/fade animation**
• Sidebar remains collapsed
• Clicking a submenu item **opens the page in the right-side content panel**
• Popup closes automatically when the user clicks outside
• Popup closes when another sidebar icon is clicked
• Popup uses the **same dark theme UI design**

UI structure:

Collapsed Sidebar Icon
→ Click icon
→ Show Floating Popup Menu
→ Select submenu
→ Open module in **main right content area**

Goal:

Create a **smart collapsed sidebar navigation system** where users can access all modules quickly through **popup menus triggered by sidebar icons**.
