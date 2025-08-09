import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import dotenv from "dotenv";
import "./sync/main";
import { SwaggerOptions } from "./swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerSpec = swaggerJsdoc(SwaggerOptions);

// Middleware
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api", routes);

app.listen(PORT, async () => {
    console.log(`Proxy API server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
