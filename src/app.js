//process.env.TZ = 'America/Argentina/Buenos_Aires';
import express from 'express';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { logger } from './utils/logger.js';
import program from "./process.js";
import {Server} from "socket.io";
import methodOverride from "method-override";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import session from "express-session";
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import config from "./config/config.js";
//import moment from "moment-timezone";

// Establecer la zona horaria para Argentina (Buenos Aires)/
//moment.tz.setDefault('America/Argentina/Buenos_Aires');

// Establecer la zona horaria en UTC (puedes ajustarla según tus necesidades)
//moment.tz.setDefault('UTC');
//console.log('Fecha y hora antes de configurar la zona horaria:', new Date());

//console.log('Fecha y hora después de configurar la zona horaria:', new Date());

//Routers a importar
import viewsRouter from './routes/views.router.js';
import sessionRouter from "./routes/sessions.routes.js";
import jwtRouter from "./routes/jwt.routes.js";
import productRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import messageRouter from "./routes/messages.routes.js";
import UsersExtendRouter from './routes/custom/users.extend.router.js'
import usersRouter from "./routes/users.routes.js";

const PRIVATE_KEY = config.privatekey;
const PORT = config.port;

const app = express();

app.use(cookieParser(PRIVATE_KEY));
app.use(logger);

const MONGO_URL =  config.urlMongo      //`mongodb+srv://mcamposinfocam:${password}@cluster0.alvwu9f.mongodb.net/${db_name}?retryWrites=true&w=majority`;

 app.use(session(
    {
         store: MongoStore.create({
            mongoUrl: MONGO_URL,
            //mongoOptions --> opciones de confi para el save de las sessions
            mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
            ttl: 10 * 60
        }), 

        secret: PRIVATE_KEY,
        resave: false, // guarda en memoria
        saveUninitialized: true //lo guarda a penas se crea
    }
))  

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

//Inicializndo el motor
app.engine(
    "hbs",
    handlebars.engine({
        extname: "hbs",
        defaultLayout: "main",
        layoutsDir: __dirname+"/views/layouts",
        partialsDir:__dirname+"/views/partials",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
          },
    })
  );
app.set("view engine", "hbs");
app.set('views', __dirname + '/views')

//Declaración de Routers:
app.use('/', viewsRouter)
app.use("/api/products", productRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users",  usersRouter);
app.use("/api/messages", messageRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/jwt', jwtRouter);
// Custom Router
const usersExtendRouter = new UsersExtendRouter();
app.use("/api/extend/users", usersExtendRouter.getRouter());

//const PORT = 9090
app.listen(PORT, () => {
    console.log(`Server run on port: ${PORT}`);
    //process.exit(5);
    //consolelog();
    
})

/*=============================================
=            connectMongoDB                   =
=============================================*/
const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL)
        console.log("Conectado con exito a la DB usando Mongoose!!");
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
}
connectMongoDB();

