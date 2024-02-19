import passport from 'passport';
//import userModel from '../models/user.model.js';
import usersDao from "../services/db/users.service.js";
import UsertDTO from "../services/dto/user.dto.js";
import GitHubStrategy from "passport-github2";
import jwtStrategy from 'passport-jwt';
import passportLocal from 'passport-local';
import {  createHash } from '../utils.js';
//import {PRIVATE_KEY}  from  "./.env.js";
import config from "./config.js";

const PRIVATE_KEY = config.privatekey;
const PORT = config.port;


//console.log(PRIVATE_KEY);
const localStrategy = passportLocal.Strategy;

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const userService = new usersDao();


const initializePassport = () => {
    //Estrategia de obtener Token JWT por Cookie:
    passport.use('current', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: PRIVATE_KEY
        }, async (jwt_payload, done) => {
            console.log("Entrando a passport Strategy con JWT.");
            try {
                console.log("JWT obtenido del Payload");
                console.log(jwt_payload);
                return done(null, jwt_payload.user)
            } catch (error) {
                console.log("Error JWT.");
                return done(error)
            }
        }
    ));

    // Usando GitHub
    passport.use('github', new GitHubStrategy(
        {
            clientID: 'Iv1.dba638ea20862968', //8
            clientSecret: '3798abaa71634c7b427288d54526bf97c1a9dadb',
            callbackUrl: `http://localhost:${PORT}/api/sessions/githubcallback`
        },
        async (accessToken, refreshToken, profile, done) => {
           // console.log("Profile obtenido del usuario de GitHub: ");
           // console.log(profile);
            try {
                //Validamos si el user existe en la DB
                const email = profile._json.email
                //const user = await userSevice.getUserbyEmail(email);
                const user = await userService.findByUsername(email);
              //  console.log("Usuario encontrado en github para login:");
              //  console.log(user);
                if (!user) {
                    console.warn("User doesn't exists with username: " + profile._json.email);
                    let newUser = {
                        first_name: profile._json.name,
                        last_name: '',
                        age: 57,
                        email: profile._json.email,
                        password: '',
                        loggedBy: "GitHub",
                        role:"user"
                    }
                    const result = await userService.save(newUser);
                    return done(null, result)
                } else {
                    // Si entramos por aca significa que el user ya existe en la DB
                    if (user.loggedBy !="GitHub"){
                        //El  usuario  existe en la BD pero no es de guthub
                        console.log("El  usuario  existe en la BD pero no es de guthub");
                        return done(null, false ,{ message: 'El  usuario  existe en la BD pero no es de guthub' } )
                    }else{
                        // El usuario existe y es de GitHub
                        console.log("El usuario existe y es de GitHub");
                        return done(null, user)
                    }
                }

            } catch (error) {
                return done(error)
            }
        }
    ))


    passport.use('register', new localStrategy(
        // passReqToCallback: para convertirlo en un callback de request, para asi poder iteracturar con la data que viene del cliente
        // usernameField: renombramos el username
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            const newUser = new UsertDTO(req.body);
            try {
                //Validamos si el user existe en la DB
                const exist = await userService.findByUsername( email);
                if (exist) {
                    console.log("El user ya existe!!");
                    return done(null, false);
                }

                const user = {
                    first_name,
                    last_name,
                    email,
                    age,
                    // password //se encriptara despues...
                    password: createHash(password),
                    loggedBy: 'form',
                    //role:"user"
                }
                const result = await userService.save(user);
                console.log(result);
                // Todo sale ok
                return done(null, result)
            } catch (error) {
                return done(error)
            }
        }
    ));

    //Funciones de Serializacion y Desserializacion
    passport.serializeUser((user, done) => {
        //console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userService.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    });
};

const cookieExtractor = req => {
    let token = null;
    // console.log("Entrando a Cookie Extractor");
    if (req && req.cookies) {//Validamos que exista el request y las cookies.
        console.log("Cookies presentes: ");
        console.log(req.cookies);
        token = req.cookies['jwtCookieToken']
        console.log("Token obtenido desde Cookie:");
        console.log(token);
    }
    return token;
};

export default initializePassport;
