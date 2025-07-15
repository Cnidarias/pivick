# Functional Specification: Interactive Data Explorer for SQL Databases

## 1. Vision & Introduction

> This document outlines the functional requirements for a web-based, interactive data exploration tool. The primary goal is to provide business users with an intuitive, drag-and-drop interface to perform ad-hoc analysis on data stored in ClickHouse and PostgreSQL databases.
>
> The user experience will be similar to established OLAP explorers like Pentaho Analyzer, but it will operate without a traditional, pre-aggregated OLAP cube. Instead, it will dynamically generate and execute SQL queries against the source databases in real-time, leveraging their native performance.

---

## 2. Core Concepts

The system will be built on two fundamental concepts: the *Logical Model* and the *Query Generation Engine*.

### 2.1. Logical Model (The "Virtual Cube")

Since there is no physical cube, the tool requires a metadata layer to understand the relationships in the data. An administrator or data modeler will define this logical model, which consists of:

- **Fact Source**: The central table or view containing the quantitative data to be analyzed (e.g., a `sales_transactions` table).
- **Measures**: The numerical columns within the fact source that can be aggregated (e.g., `quantity`, `price`). Each measure will have a default aggregation type (e.g., `SUM`, `COUNT`, `AVG`, `MIN`, `MAX`).
- **Dimensions**: Descriptive attributes that provide context to the measures. These are typically linked from other tables (e.g., `Products`, `Customers`, `Time`).
- **Joins**: Explicit definitions of how dimension tables are joined to the fact source.
- **Hierarchies**: Ordered levels within a dimension that allow for drill-down and drill-up analysis (e.g., *Geography* dimension might have a hierarchy of *Country -> State -> City*).

### 2.2. Query Generation Engine

The backend of the application will be responsible for translating user actions in the UI into efficient, optimized SQL queries. This engine must be dialect-aware to generate correct syntax for both PostgreSQL and ClickHouse.

---

## 3. Key Features (User-Facing)

The user interface will be the primary way users interact with their data.

### 3.1. Analysis View Layout

The main screen will be divided into three primary sections:

1.  **Data Source Pane**: A tree-view list of all available dimensions, hierarchies, and measures defined in the active Logical Model.
2.  **Layout Shelves**: Designated drop-zones for "Rows", "Columns", and "Filters". Users will drag items from the Data Source Pane onto these shelves.
3.  **Canvas**: The main area where the results of the analysis are rendered, either as a pivot table or a chart.

### 3.2. Core Interactions

The user will build their analysis by dragging and dropping elements. Each action will trigger the Query Generation Engine to produce and run a new SQL query.

- **Dicing (Placing dimensions on Rows/Columns)**:
    - Dragging a dimension (e.g., *Product Category*) to the "Rows" shelf will group the results vertically by that dimension.
    - Dragging a dimension (e.g., *Time (Year)*) to the "Columns" shelf will create a horizontal grouping.
    - *This action directly translates to the `GROUP BY` clause in the generated SQL.*

- **Measure Selection**:
    - Dragging a measure (e.g., *SUM(Sales)*) onto the canvas or a designated "Measures" shelf will calculate that value for each intersection of the row and column dimensions.
    - *This translates to the aggregate functions in the `SELECT` clause of the SQL.*

- **Slicing (Filtering)**:
    - Dragging a dimension to the "Filters" shelf will open a dialog allowing the user to select which members to include or exclude (e.g., select only *USA* and *Canada* from the *Country* dimension).
    - *This translates to the `WHERE` clause in the generated SQL.*

- **Drilling (Down and Up)**:
    - If a dimension with a hierarchy (e.g., *Time*) is on a shelf, users can click a `+` icon next to a member (e.g., *2023*) to "drill down" to the next level (e.g., *Q1, Q2, Q3, Q4*).
    - This modifies the `GROUP BY` clause to include the lower-level fields. Clicking `-` will "drill up".

### 3.3. Visualizations

The canvas will support, at a minimum, two types of visualizations.

#### 3.3.1. Pivot Table (Crosstab)

- The default view for displaying data.
- Must clearly render rows, columns, and aggregated values.
- Should support the display of grand totals and subtotals.

#### 3.3.2. Charting

- A toggle to switch the view from a pivot table to a chart.
- Initial chart types to support: Bar Chart, Line Chart, and Pie Chart.
- The chart's axes and series will be automatically determined by the dimensions on the Rows and Columns shelves.

### 3.4. Calculated Measures

- Provide a simple UI for users to create new, temporary measures based on existing ones.
- *Example*: A user could create a measure named "Average Unit Price" with the formula `SUM(sales_amount) / SUM(quantity_sold)`.
- The Query Generation Engine must be able to parse this expression and embed it into the `SELECT` clause of the SQL.

---

## 4. Administrative Features

### 4.1. Logical Model Management

A way for an administrator to define and manage the Logical Models. This could initially be done by editing a configuration file (e.g., YAML or JSON) and later evolved into a UI.

An example of a simple model definition in YAML:

```yaml
name: SalesAnalysis
fact_source: public.sales_transactions
joins:
  - type: left
    left_table: public.sales_transactions
    right_table: public.products
    on: sales_transactions.product_id = products.id
dimensions:
  - name: Product
    table: public.products
    attributes:
      - name: ProductCategory
        column: category
      - name: ProductName
        column: name
  - name: Time
    # ...
measures:
  - name: TotalSales
    column: sale_price
    agg: SUM
  - name: UnitsSold
    column: quantity
    agg: SUM
```

### 4.2. Database Connection Management

A secure way to store and manage connection details for ClickHouse and PostgreSQL data sources.

---

## 5. Out of Scope (for Version 1.0)

To ensure a focused initial release, the following features will be considered for future versions:

- Advanced statistical functions and complex, multi-pass calculations.
- Data write-back capabilities.
- In-application security models (e.g., row-level security). All security will be deferred to the underlying database user's permissions.
- Report scheduling, exporting (beyond simple CSV/PNG), and distribution.
- Materialized views or caching summary tables managed by the tool itself.
