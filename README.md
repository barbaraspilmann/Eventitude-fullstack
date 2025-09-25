# Eventitude: A Full-Stack Event Management Platform

## Project Overview

This project, **Eventitude**, is a full-stack event management platform developed as part of a software engineering assessment. Inspired by popular event management sites like Eventbrite, Eventitude aims to provide a robust and scalable solution for creating, managing, and attending events. The project emphasizes a modern full-stack architecture, separating the frontend and backend to allow for independent scaling and development.

## Assessment Context

This project serves as an assessment for a Full Stack Web Development module, focusing on implementing a high-quality software solution with a full-stack architecture and applying industry-relevant tools and techniques. The assignment involves developing both the backend API and the frontend application that interacts with it, adhering to a predefined specification. 
It is important to note that the primary focus of this project was on the robust implementation and development of the backend API, therefore the frontend may not be as fully developed or feature-rich. 
As this project was developed by a student aiming to improve their skills, it may contain issues or bugs. 
Feedback and suggestions for improvement are welcome.

## Technologies Used

Eventitude leverages a contemporary technology stack to deliver a responsive and efficient application:

### Frontend
*   **Vue.js 3**: A progressive JavaScript framework for building user interfaces.
*   **Vite**: A fast frontend build tool that provides an excellent development experience.

### Backend
*   **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
*   **SQLite**: A self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine.

## Features

Eventitude is designed to offer core functionalities for event management, including:

*   **User Authentication**: Secure user registration and login.
*   **Event Creation and Management**: Functionality for users to create, edit, and manage their events.
*   **Event Browsing**: Users can browse and search for events.
*   **API-driven Architecture**: A RESTful API serves as the backbone, ensuring clear separation of concerns between the frontend and backend.

## Getting Started

To set up and run the Eventitude project locally, follow these steps:

### Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm (Node Package Manager)

### Project Setup

1.  **Clone the repository** (if applicable, otherwise assume project files are already present):

    ```sh
    git clone <repository-url>
    cd eventitude-project
    ```

2.  **Install Backend Dependencies**:

    Navigate to the backend directory (e.g., `server` or `api`) and install the required packages:

    ```sh
    cd /path/to/backend/directory
    npm install
    ```

3.  **Install Frontend Dependencies**:

    Navigate to the frontend directory (e.g., `vue-project` or `client`) and install the required packages:

    ```sh
    cd /path/to/frontend/directory
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**:

    In a terminal, navigate to your backend directory and run:

    ```sh
    npm run dev
    ```

    This will typically start the API server, often with hot-reloading for development.

2.  **Start the Frontend Development Server**:

    In a separate terminal, navigate to your frontend directory and run:

    ```sh
    npm run dev
    ```

    This will launch the Vue.js application in development mode, usually accessible via `http://localhost:5173` (or a similar port).

### Compile and Minify for Production

To build the frontend for production, navigate to the frontend directory and run:

```sh
npm run build
```

This command will compile and minify your Vue.js application into static assets, typically found in a `dist` directory.

## Project Files

The following key project files are included:

*   `README.md`: This document.
*   `jsconfig.json`: JavaScript language service configuration.
*   `package.json`: Defines project metadata and manages dependencies for both frontend and backend (if combined, or separate for each).
*   `package-lock.json`: Records the exact versions of dependencies.
*   `vite.config.js`: Configuration for Vite, the frontend build tool.
*   `index.html`: The main HTML file for the Vue.js application.
*   `server.js`: The main entry point for the Node.js/Express.js backend server.
*   `access.log`: Log file for server access (may not be present in starter code).
*   `db.sqlite`: The SQLite database file.
