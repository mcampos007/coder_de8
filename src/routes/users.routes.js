import { Router } from "express";
import { validateUser } from "../utils/validateUser.js";
import __dirname from "../utils.js";
import UserService from "../services/db/users.service.js";
import UsertDTO from "../services/dto/user.dto.js"
import { createHash, isValidPassword } from '../utils.js'

const router = Router();

const userService = new UserService();

//Recuperar todos los usuarios
router.get('/', async(req,res) => {
    try{
        let users = await userService.getAll();
        res.send(users);
    }catch(error){
        console.log(error);
        res.status(500).send({ error: error, message: "No se pudo obtener los usuario." });
    }
});

//Crear un usuario
router.post('/', validateUser, async(req,res) =>{
    try {
        let newUser = new UsertDTO(req.body);
        newUser.password = createHash(newUser.password);
        newUser.loggedBy = "form";
        const userExist = await userService.findByUsername(newUser.email);
        if (userExist){
            //el usuario ya existe
            res.status(400).send({  message: "El usuario ya existe en la base de datos." });    
        }else{
            const result = await userService.save(newUser);
            res.status(201).send(result); 
        } 
    }catch(error){
        console.log(error);
        res.status(500).send({ error: error, message: "Error al crear el usuario." });
    } 
})

//Login del usuario
router.post('/login' , async (req, res) => {
    console.log(req.body);
    const {username, password, email} = req.body;
    if (email ==='adminCoder@coder.com' || password ==='adminCod3r123'){
        req.session.user = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role:"admin"
        }   
    }else {
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
        console.log(req.session.user);
    }
    
    res.send({ status: "success", payload: req.session.user, message: "¡Primer logueo realizado! :)" });
    /* console.log(user);
    req.session.user = username
    req.session.admin = true
    //res.send("login success!")
    console.log(req.session);
    res.redirect('/home'); */
})

export default router;  

