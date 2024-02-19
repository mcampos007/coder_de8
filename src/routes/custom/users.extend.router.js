import CustomRouter from './custom.router.js';
import UserService from '../../services/db/users.service.js';
import { createHash, isValidPassword, generateJWToken } from '../../utils.js';
import config from '../../config/config.js';


export default class UsersExtendRouter extends CustomRouter {
    init() {

        const userService = new UserService();

        /*====================================================
                    EJEMPLO de como se conecta con el CustomRouter
                    --> this.verboHTTP(path, policies, ...callbacks);                   
        =====================================================*/

        this.get('/', ["PUBLIC"], (req, res) => {
            console.log("TEST");
            res.send("Hola coders!!")
        })


        this.get('/currentUser', ["USER", "USER_PREMIUM"], (req, res) => {
            res.sendSuccess(req.user)
        })


        this.get('/premiumUser', ["USER_PREMIUM"], (req, res) => {
            res.sendSuccess(req.user)
        })

        this.get('/adminUser', ["ADMIN"], (req, res) => {
            res.sendSuccess(req.user)
        })


        this.post('/login', ["PUBLIC"], async (req, res) => {
            const { email, password } = req.body;
            
            try {
                //Validar si es admin
                const userAdmin = config.adminName;
                const passAdmin = config.adminPassword;

                let tokenUser = {}
                let userId = "";
                if (email === userAdmin && password === passAdmin)
                {
                        //Es administrador
                     tokenUser = {
                            name: `${userAdmin}`,
                            email: userAdmin,
                            age: 57,
                            role: "Admin"
                        }
                } else {
                    const user = await userService.findByUsername(email);
                    console.log("Usuario encontrado para login:");
                    console.log(user);
                    if (!user) {
                        console.warn("User doesn't exists with username: " + email);
                        return res.status(202).send({ error: "Not found", message: "Usuario no encontrado con username: " + email });
                    }
                
                    if (!isValidPassword(user, password)) {
                        console.warn("Invalid credentials for user: " + email);
                        return res.status(401).send({ status: "error", error: "El usuario y la contraseña no coinciden!" });
                    }
                     tokenUser = {
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        age: user.age,
                        role: user.role
                    }
                    userId = user._id;
                    
                }

                const access_token = generateJWToken(tokenUser);
                res.cookie('jwtCookieToken', access_token,
                {
                    maxAge: 10*60*1000,
                    httpOnly: true //No se expone la cookie
                    // httpOnly: false //Si se expone la cookie
                }
            )
                console.log(access_token);
               // res.send({ message: "Login successful!", access_token: access_token, id: user._id });
               
              
                   
                
               res.send({ message: "Login successful!", access_token: access_token, id: userId });

            } catch (error) {
                console.error(error);
                return res.status(500).send({ status: "error", error: "Error interno de la applicacion." });
            }
        })


        this.post("/register", ["PUBLIC"], async (req, res) => {
            const { first_name, last_name, email, age, password } = req.body;
            console.log("Registrando usuario:");
            console.log(req.body);

            const exists = await userService.findByUsername(email);
            if (exists) {
                return res.status(400).send({ status: "error", message: "Usuario ya existe." });
            }
            const user = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            };
            const result = await userService.save(user);
            res.status(201).send({ status: "success", message: "Usuario creado con extito con ID: " + result.id });
        });

    }

}
