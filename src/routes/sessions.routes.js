import { Router } from "express";
import __dirname from "../utils.js";
import usersDao from "../services/db/users.service.js";
import { createHash, isValidPassword, generateJWToken, authToken } from '../utils.js'
import {validateUsers} from "../utils/validateUsers.js";
import passport from 'passport';
import config from "../config/config.js";


const router = Router();

/*=============================================
=                   Passport Github           =
=============================================*/
router.get("/github", passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {
    { }
})

router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/github/error' }), async (req, res) => {
    
    const user = req.user;
    // Solo si utilizamos session
   /*  req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role:user.role
    }; */
   // req.session.admin = true;
   let tokenUser
   if(!user){
    console.warn(`User doesn't exist with username:${user.email}`);
    return res.status(204).send({ status: "Not found", error: "usuario no encontrado con el email:"+email});
    }
    const ADMIN_NAME = config.adminName;
    const ADMIN_PASSWORD =  config.adminPassword;
    
    if (user.email ===ADMIN_NAME || user.password ===ADMIN_PASSWORD){
         tokenUser = {
            name: `ADMIN`,
            email: "admin@admin",
            edad: 0,
            role: "admin"
        } 
    }else{
        /* if (!isValidPassword(user, user.password)){
            console.warn("Invalid credentials for user: " +user.email);
            return res.status(401).send({status:"error", error:"Invalid credentials"});
        }*/
         tokenUser = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            edad: user.age,
            role: user.role
        } 
    }
        // IMplementamos jwt
    const access_token = generateJWToken(tokenUser);
    //console.log("Access_token");
    //console.log(access_token);

        // 1ro usando localStorage
        //res.send({message:"Login successfull" , jwt:acces_token});

        // 2do con Cookies
    res.cookie('jwtCookieToken', access_token,
        {
            maxAge: 60*1000*10, //10 Minutos
            httpOnly: true //No se expone la cookie
            // httpOnly: false //Si se expone la cookie
        }
    )
    //res.status(200).send({ message: "Login success!!" });
    

   //// fin jwt
    //res.redirect("/ghproducts")
    res.redirect("/products")
})


// Register de usuario de GitHub
/* router.post('/register', passport.authenticate('register', {
    failureRedirect: '/api/sessions/fail-register'}), 
    async (req, res) => {
        console.log("Registrando usuario:");
        res.status(201).send({ status: "success", message: "Usuario creado con extito." });
})
 */
//End Point para la falla del Registro
router.get("/fail-register", (req, res) => {
    // console.log(res);
    res.status(401).send({ error: "Failed to process register!" , message:"User already exists"});
});

//Login del usuario
router.post('/login', 
     passport.authenticate('login',
        {
            failureRedirect: 'api/sessions/fail-login'
        }), 
        async (req, res) => {
    console.log(req.body);
    const {username, password, email} = req.body;
    /* if (username !=='pepe' || password !=='pepepass'){
        return res.send("Login failed");
    } */
    if (email ==='adminCoder@coder.com' || password ==='adminCod3r123'){
        req.session.user = {
            name: `Administrador`,
            email: email,
            age: 0,
            role:"Admin"
        }
        
    }else{
        const user = await usersDao.getUserbyEmail(email);
        if (!user) return res.status(401).send({ status: 'error', error: "Incorrect credentials" })
        if (!isValidPassword(user, password)) {
            return res.status(401).send({ status: "error", error: "Incorrect credentials" })
        }

        
        req.session.user = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role:"usuario"
        } 
    }
    console.log("Datos de la session");
    console.log(req.session.user);
    res.send({ status: "success", payload: req.session.user, message: "¡Primer logueo realizado! :)" });
    /* console.log(user);
    req.session.user = username
    req.session.admin = true
    //res.send("login success!")
    console.log(req.session);
    res.redirect('/home'); */
})

//End Point para la falla del Login
router.get("/fail-login", (req, res) => {
    res.status(401).send({ error: "Failed to process login!" });
});

router.post('/passwordreset', async(req, res) => {
    //console.log(req.body);
    if (!req.body.email || !req.body.password){
        console.log("Missing data!!!");
        return res.status(400).send({
            error:"Missing data!!!", message:"You must enter email and new password"
        })    
    }
    //buscar el usuario por el mail ingresado
    const {email, password } = req.body;
    const user = await usersDao.getUserbyEmail(email);
    user.password = createHash(password);
    const result = await usersDao.updateUser(user._id, user);
    console.log("Resultado de la actualización");
    res.status(200).send(result);
})

//router.get('/current', )
export default router;  

