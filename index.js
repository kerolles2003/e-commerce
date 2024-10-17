import path from 'path';
import express from 'express';
import dotenv from "dotenv";
import { dbConnection } from './DB/Connection.js';
import { bootStrap } from './src/bootStrap.js';
const app = express()
const port = process.env.PORT || 3000;
dotenv.config({ path: path.resolve("./config/.env") })
// connect to db
dbConnection()
// import bootstrap files
bootStrap(app, express)

app.listen(port, () => console.log(`app listening on port ${port}!`))