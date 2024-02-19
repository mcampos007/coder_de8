import { Router } from "express";
import { validateCart } from "../utils/validateCart.js";
import __dirname from "../utils.js";
import CartService from "../services/db/carts.service.js";
import CartDTO from "../services/dto/cart.dto.js"

const router = Router();

const cartService = new CartService;

// Recuperar todos los carritos
router.get('/', async (req, res) => {
    try {
        let carts = await cartService.getAll();
        res.send(carts);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo obtener los carts." });
    }

});

//Registra un carrito
router.post('/', validateCart , async (req, res) => {
    try {
        let newCart = new CartDTO(req.body);
        let result = await cartService.save(newCart);
        res.status(201).send(result);    
    }catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo guardar el Cart." });
    }
});

//Registrar un producto a uncarrito
router.post('/:cid/product/:pid', validateCart , async (req, res) => {
     try {
        const {cid, pid} = req.params;
        let cart = await cartService.findById(cid);
        if (!cart){
            res.status(500).send({  message: "No existe el carrito a actualizar." });
        }
        let result = await cartService.addProductToCart(cart, pid);
        res.status(201).send(result);    
     }catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo actualizar la cantidad del item en el Cart." });
    }
 });   

// Delete Cart
router.delete('/:cid', async (req,res) => {
    try{
        let {cid} = req.params;
        //const cartEliminado = await cartsDao.deleteCart(cid);
        const result = await cartService.delete(cid);
        res.status(204).send(result);    
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo eliminar el carrito." });
    }

})   

//eliminar del carrito el producto seleccionado
//DELETE api/carts/:cid/products/:pid 
/* router.delete('/:cid/products/:pid', async(req, res) => {
    try{
        const {cid, pid } = req.params;
        console.log(`cid${cid}`);
        console.log(`pid${pid}`);
        const productoEliminado = await cartsDao.deleteProductToCart(cid, pid);
        res.json({
            productoEliminado
        });
    }
    catch(error){
        console.log(error);
        res.json({
            error:error
        });
    }
    
}); */

export default router;  

