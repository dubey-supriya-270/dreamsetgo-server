import pgPromise from "pg-promise";
const postgresURL = "postgres://postgres:Supriya@localhost:5432/dreamsetgo";

const options = {
  error: (connError: any, e: any) => {
    if (e.cn) {
      // A connection-related error;
      console.log("CN:", e.cn);
      console.log("EVENT:", connError.message);
    }
  },
};

const pg = pgPromise(options);
export const db = pg(postgresURL);
