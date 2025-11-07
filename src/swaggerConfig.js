import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ReferMe API",
      version: "1.0.0",
      description: "API documentation for ReferMe Backend",
    },
    servers: [
      {
        url: "https://dev.youreferredme.com/",
        // url: 'https://devapi.refermellc.com/',
        // url: 'https://devapi.refermellc.com/',
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};
const specs = swaggerJsdoc(options);
export { swaggerUi, specs };