# ColabCode

This is a full-stack web application featuring a React frontend and a Node.js backend. It is fully containerized using Docker for easy deployment and development.

## Project Structure

- `frontend/`: Contains the React application built with Vite.
- `backend/`: Contains the Node.js backend server.
- `dockerfile`: Multi-stage Dockerfile to build both the frontend and backend into a single image.

## Getting Started

### Prerequisites

- Node.js (v22 or later recommended)
- Docker

### Running Locally without Docker

1. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

### Running with Docker

You can build and run the entire application using Docker. The Dockerfile uses a multi-stage build to compile the frontend and serve it via the backend.

1. **Build the image:**
   ```bash
   docker build -t colabcode-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 colabcode-app
   ```
   *(Adjust the port mapping depending on the port your backend server listens on)*

## License

This project is open-source.
