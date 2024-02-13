import dotenv from 'dotenv';
import program from '../process.js';


//dotenv.config();

//let environment = "dev";

const environment = program.opts().mode;
let filesetting = "";
console.log(`Env: ${environment}`);


switch (environment) {
  case "prod":
    filesetting = './src/config/.env.production';
    break;
  case "dev":
    filesetting = './src/config/.env.development';
    break;
  case "local":
    filesetting = './src/config/.env.local';
    break;
  default:
    filesetting = './src/config/.env.development';
}


/* dotenv.config({
     path: environment === "prod" ? "./src/config/.env.production" : "./src/config/.env.development"
});*/

dotenv.config({
    path: filesetting
});

console.log( process.env.PORT);

export default {
    port: process.env.PORT,
    urlMongo: process.env.MONGO_URL,
    privatekey:process.env.PRIVATE_KEY,
    adminName: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
}