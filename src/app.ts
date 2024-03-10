import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { limiter } from "./middlewares/rateLimiting";
import search from "./routes/search.route";
import respond from "./utils/respond";
import { check, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import User from "./models/signup";
import { config } from "dotenv";

import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerJsDocConfig = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Locale Api",
      version: "1.0.1",
      description: "Locale's Official Api.",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    paths: {
      "/search": {
        get: {
          summary: "Get all states",
          responses: {
            "200": {
              description: "A list of states",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/State",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        State: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            data: {
              type: "object",
              example: {
                states: [
                  {
                    name: "Abia",
                    population: 2833999,
                    capital: "Umuahia",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(swaggerJsDocConfig);

config();
const app = express();

app.use(bodyParser.json());
app.use(limiter);
app.use("/search", search);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.post(
  "/signup",
  [check("email").isEmail(), check("password").isLength({ min: 5 })],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const apiKey = uuidv4();
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, // Ensure proper handling of password (e.g., hashing)
        apiKey,
      });
      await user.save();
      // Omit sensitive information from response
      const responseData = user.toJSON();
      respond(res, 200, "Successfully Signed Up", responseData);
    } catch (error) {
      console.error(error);
      respond(res, 500, "Something went wrong, please try again later.");
    }
  }
);

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && user.password === password) {
      const token = jwt.sign(
        { userId: user.id, username: user.username, type: "auth" },
        process.env.SECRET_KEY as string,
        { expiresIn: "1h" }
      );
      // Omit sensitive information from response
      const responseData = user.toJSON();
      // @ts-ignore
      delete responseData.apiKey;
      return res.status(200).json({
        message: "Successfully logged in",
        data: { ...responseData, token },
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
});

app.use("*", (req, res) => {
  respond(res, 404, `Endpoint not found!`);
});

export default app;
