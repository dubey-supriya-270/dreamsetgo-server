// // Setting up Node-Express application
// import bodyParser from "body-parser";
// import cors from "cors";
// import express from "express";
// import helmet from "helmet";
// import morgan from "morgan";
// import error from "./src/middlewares/error";
// import hexagonal from './src/routes/hexagonal';

// // In case of production environment, disable console logs
// if (process.env.NODE_ENV === "production") {
//   console.log = (msg: string) => {};
//   console.info = (msg: string) => {};
//   console.warn = (msg: string) => {};
//   console.error = (msg: string) => {};
// }
// // Setting node thread pool size to 256 because the size of the DB pool is 256 plus 4 extra threads for V8
// process.env.UV_THREADPOOL_SIZE = "260";

// // Extending express name space to have a user property that is used by the authorize middleware
// declare module "express" {
//   interface Request {
//     user?: any;
//   }
// }
// // Create an instance of express
// const app = express();

// app.set("trust-proxy", 1);

// // Block all unwanted headers using helmet
// app.use(helmet());

// // Disable x-powered-by header separately
// app.disable("x-powered-by");

// // Setup server
// app.use(cors());
// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: false,
//   })
// );
// app.disable("etag"); // Disables caching
// morgan.token("remote-addr", (req: any) => {
//   return req.header("X-Real-IP") || req.ip;
// });
// app.use(
//   morgan("common", {
//     stream: {
//       write: (message) => console.log(message),
//     },
//   })
// );

// // Routes
// app.use('/api/hexagonal', hexagonal);

// app.use(error);

// // Check if port exists in the environment else use 3000
// const port = process.env.PORT || 5000;

// // If the environment is test, do not start the express server
// if (process.env.NODE_ENV !== "test") {
//   // createConnection();
//   app
//     .listen(parseInt(port.toString()), "0.0.0.0", () => {
//       // Listen the express server on the given port and log a message to the logs
//       console.log(`Server is listening on port ${port}`);
//     })
//     .on("error", (err: any) => {
//       // In case of an error, log the error to the logs
//       console.log(JSON.stringify(err));
//     });
// }

// export default app;

require("dotenv").config();
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { db } from "./src/db_init/dbConn";
import error from "./src/middlewares/error";
import hexagonal from "./src/routes/hexagonal";

const port = process.env.PORT || 5000;

declare module "express" {
  interface Request {
    user?: any;
    slowDown?: any;
  }
}

// create instance of express
const app = express();

app.set("trust-proxy", 1);

// block all unwanted header using helmet
app.use(helmet());

// disable x-powered-by header separately
app.disable("x-powered-by");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// disable caching
app.disable("etag");
morgan.token("remote-addr", (req: any) => {
  return req.header("X-Real-IP") || req.ip;
});
app.use(
  morgan("common", {
    stream: {
      write: (message) => console.log(message),
    },
  })
);

// Routes
app.use("/api/hexagonal", hexagonal);

// error middleware to handle error response
app.use(error);

db.connect()
  .then((conn) => {
    console.log("Connected to database");
    // on success, release the connection
    conn.done();

    // for test environment do not start the server
    if (process.env.NODE_ENV !== "test") {
      app
        .listen(parseInt(port.toString()), "0.0.0.0", () => {
          // log a message to confirm that the express server is running
          console.log(`Server is listening on ${port}`);
        })
        .on("error", (err: any) => {
          // in case of error, log the error
          console.log(JSON.stringify(err));
        });
    }
  })
  .catch((err) => {
    console.log(JSON.stringify(err));
  });

export default app;
