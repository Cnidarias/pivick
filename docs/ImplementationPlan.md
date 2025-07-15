# Implementation Plan: Interactive Data Explorer

This document outlines the step-by-step plan to implement the Interactive Data Explorer as described in the `FunctionalDescription.md`. The implementation will be divided into logical phases, starting with the backend API and progressively building the frontend and integrating the two.

---

## Phase 1: Backend Foundation (FastAPI)

The goal of this phase is to establish the core backend components, including data modeling, database connectivity, and the initial API structure.

### 1.1. Define Logical Model Schemas

-   **Technology**: Use Pydantic models to define the structure of the Logical Model.
-   **Models**:
    -   `Measure`: Defines a numerical, aggregatable field (name, column, agg type).
    -   `DimensionAttribute`: A descriptive field within a dimension (name, column).
    -   `Hierarchy`: An ordered list of dimension attributes.
    -   `Dimension`: A collection of attributes and hierarchies (name, table).
    -   `Join`: Defines the relationship between two tables (type, left_table, right_table, on).
    -   `LogicalModel`: The root model that brings everything together (name, fact_source, joins, dimensions, measures).
-   **Location**: These models will be created in `pivick_api/app/routes/v1/schema.py`.

### 1.2. Implement Logical Model Management

-   **Storage**: For V1, Logical Models will be defined in a YAML file (`models.yml`) in the `pivick_api` directory.
-   **Loading**: Create a utility function to load and parse the YAML file into a list of Pydantic `LogicalModel` objects at startup.
-   **API Endpoint**:
    -   `GET /schema`: Create an endpoint that returns a list of all available `LogicalModel` definitions.
    -   `GET /schema/{model_name}`: Create an endpoint that returns the details of a single `LogicalModel`.

### 1.3. Database Connection Management

-   **Configuration**: Store database connection strings securely, for example, in environment variables (`.env` file).
-   **Connection Pooling**: Implement a mechanism to manage and pool connections to both PostgreSQL and ClickHouse to handle concurrent requests efficiently.
-   **Dialect Abstraction**: Create a simple abstraction layer to handle differences between PostgreSQL and ClickHouse connections.

---

## Phase 2: Frontend Scaffolding (Angular)

This phase focuses on building the basic UI structure and components for the analysis view.

### 2.1. Analysis View Layout

-   **Component**: Create a new Angular component `AnalysisViewComponent`.
-   **Layout**: Use CSS Grid or Flexbox to create the three main sections:
    1.  **Data Source Pane** (left sidebar)
    2.  **Layout Shelves** (top)
    3.  **Canvas** (main content area)
-   **Routing**: Set up a route in `app.routes.ts` to display the `AnalysisViewComponent`.

### 2.2. Data Source Pane

-   **Service**: Create an `ApiService` to fetch the list of Logical Models from the backend (`GET /schema`).
-   **Component**: Create a `DataSourcePaneComponent`.
-   **Functionality**:
    -   On initialization, it will use the `ApiService` to get the available models.
    -   Display the selected model's dimensions and measures in a tree-like structure.
    -   Make the items in the tree draggable.

### 2.3. Layout Shelves & Canvas

-   **Components**:
    -   `LayoutShelvesComponent`: Will contain three drop zones for "Rows", "Columns", and "Filters".
    -   `CanvasComponent`: The area where the pivot table or chart will be rendered.
-   **State Management**: Implement a service (e.g., `QueryStateService`) to manage the state of the analysis (which fields are on which shelf).

---

## Phase 3: Core Interaction & Query Generation

This phase connects the frontend and backend to enable dynamic query generation based on user actions.

### 3.1. Frontend Drag-and-Drop Logic

-   **Library**: Utilize the Angular CDK's Drag & Drop module.
-   **Functionality**:
    -   Implement logic to handle dropping items from the `DataSourcePaneComponent` onto the `LayoutShelvesComponent`.
    -   When an item is dropped, update the `QueryStateService`.
    -   When the state changes, trigger a request to the backend to get the query results.

### 3.2. Query Generation Engine (Backend)

-   **API Endpoint**:
    -   `POST /query/{model_name}`: A new endpoint that accepts a query definition from the frontend.
-   **Request Body**: The body will contain the lists of dimensions for rows/columns, the measures to calculate, and any active filters.
-   **Logic**:
    -   Parse the incoming request body.
    -   Dynamically construct a SQL query based on the request.
        -   `SELECT`: Measures and dimension attributes.
        -   `FROM`: The `fact_source` table.
        -   `JOIN`: Add joins for all tables involved in the selected dimensions.
        -   `WHERE`: Apply filters from the "Filters" shelf.
        -   `GROUP BY`: The dimensions on the "Rows" and "Columns" shelves.
    -   The engine must be aware of the database dialect (PostgreSQL vs. ClickHouse) specified in the model.

### 3.3. Data Rendering

-   **Backend**: The `/query` endpoint will execute the generated SQL and return the result set as JSON.
-   **Frontend**:
    -   The `CanvasComponent` will receive the JSON data.
    -   Initially, render the data in a simple HTML table (pivot table).

---

## Phase 4: Visualizations & Advanced Features

This final phase focuses on adding charting capabilities and other key features from the functional description.

### 4.1. Charting

-   **Library**: Integrate a charting library like `ngx-charts` or `Chart.js`.
-   **Component**: Create a `ChartToggleComponent` to switch between the pivot table and chart views.
-   **Functionality**:
    -   When toggled to a chart, transform the JSON data from the API into the format required by the charting library.
    -   Implement Bar, Line, and Pie charts. The chart type will be determined by the dimensions on the shelves.

### 4.2. Calculated Measures

-   **UI**: Add a simple form in the frontend to define a calculated measure (name and formula).
-   **Backend**:
    -   Enhance the `Query Generation Engine` to parse the formula.
    -   For V1, support basic arithmetic operations (`+`, `-`, `*`, `/`) between existing measures.
    -   Inject the calculated measure expression directly into the `SELECT` clause of the generated SQL.

### 4.3. UI/UX Polish

-   **Loading Indicators**: Add loading spinners while queries are executing.
-   **Error Handling**: Display user-friendly error messages if the backend returns an error.
-   **Styling**: Refine the CSS to ensure the application is visually appealing and intuitive.
-   **Drill-Down/Up**: Implement the `+`/`-` icons on hierarchical dimensions to modify the query state and re-run the analysis.
