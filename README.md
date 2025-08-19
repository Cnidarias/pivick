# Pivick UI

Pivick UI is a frontend application for visualizing data using the [cube.dev](https://cube.dev/) ecosystem. 
It provides an intuitive interface for interacting with Pivick services.

## Focus Points
- **Data Visualization**: Leverages cube.dev for powerful data analytics and visualization.
- **User Experience**: Designed with a focus on usability and performance.
- **Data Exploration**: Allows non-technical users to explore and analyze data efficiently, not reliant on having a buisiness analysis create a complex dashboard

## Technologies Used

- Angular
- [cube.dev](https://cube.dev/)
- Docker (compose)
- Clickhouse

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/pivick_ui.git
cd pivick_ui
```

Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Application

Start the development server:

```bash
ng serve
```

You should also have the backend services running. If you have Docker installed, you can use the provided `docker-compose.yml` to start the backend services:

```bash
docker-compose up -d
```
This will start the necessary services, including Clickhouse and cube.dev.

The app will be available at [http://localhost:4200](http://localhost:4200).

### Building for Production

```bash
ng build --prod
```

Contributions are welcome! Please open issues or submit pull requests for improvements.
