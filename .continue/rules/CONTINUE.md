# CONTINUE.md for AsTimeGoesBy Project

## 1. Project Overview
The "As Time Goes By" project is a JavaScript web application that renders a life-in-months grid based on the user's birth month/year and an optional lifespan. This project uses Vite as its bundler and follows a simple structure with minimal dependencies.

### Key Technologies Used:
- **JavaScript**: The primary programming language for the web application.
- **Vite**: The build tool and development server used for the project.

## 2. Getting Started
Before you begin, make sure you have Node.js and npm installed on your system.

### Prerequisites:
- **Node.js** (version 14.x or higher)
- **npm** (comes with Node.js installation)

### Installation Instructions:
Navigate to the project directory and run:
```bash
npm install
```

### Basic Usage Examples:
- Start the development server:
  ```bash
  npm run dev
  ```
- Build the production version of the application:
  ```bash
  npm run build
  ```

Note: There is no real test suite configured at the moment.

## 3. Project Structure
The project has a simple structure with the main components being:

### Main Directories and Files:
- **src/index.html**: The entry point HTML file that loads the `main.js` script.
- **src/main.js**: Contains the working app logic, including localStorage, grid rendering, status toggles, etc.
- **src/style.css**: Minimal stylesheet for icon font definitions, keyframe animations, and only styles that are impractical with utility classes.

### Important Configuration Files:
- **package.json**: Defines scripts like `dev`, `build`, and `test`.
- **vite.config.js**: Configures Vite with settings like `root: 'src'` and `build.outDir: '../dist'`.

## 4. Development Workflow
Follow these guidelines for a smooth development experience:

### Coding Standards or Conventions:
There are no specific coding standards defined in the project.

### Testing Approach:
There is no real test suite configured at the moment.

### Build and Deployment Process:
- Run `npm run dev` to start the development server.
- Run `npm run build` to generate a production build of the application in the `dist` directory.

## 5. Key Concepts
Familiarize yourself with these key concepts:

### Domain-Specific Terminology:
- **Life-in-months grid**: A visual representation of each month as passed or remaining time based on user input.
- **LocalStorage persistence**: Data is stored in the browser's local storage so users can return to their previous input.

## 6. Common Tasks
Here are step-by-step guides for frequent development tasks:

### Running the Development Server:
```bash
npm run dev
```

### Building the Production Application:
```bash
npm run build
```

## 7. Troubleshooting
Common issues and solutions:

- **Issue**: The page doesn't load in `npm run dev`.
  - **Solution**: Ensure that Node.js, npm, and all dependencies are installed correctly.

## 8. References
Links to relevant documentation and important resources:

- [Vite Documentation](https://vitejs.dev/)