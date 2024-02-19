import { Router } from "express";
import { validateProduct } from "../utils/validateProduct.js";
import __dirname from "../utils.js";
import ProductService from "../services/db/products.service.js";
import ProductDTO from "../services/dto/product.dto.js"

const router = Router();

const productService = new ProductService();

//Recuperar todos los productos
router.get('/', async (req, res) => {
    try {
        let products = await productService.getAll();
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo obtener los productos." });
    }

})

// Recuperar un producto por ID
router.get('/:pid', async (req, res) =>{
    try{
        let {pid} = req.params;
        const result = await productService.findById(pid);
            if (!result){
                return res.json({
                    error:"El Producto No Existe"
                });
            }
            res.json({
                result
            });
    }catch(error){
        console.log(error);
            res.json({
                error: error
            });
    }
});

//REgistrar Producto
router.post('/', validateProduct , async (req, res) => {
    try {
        let newProduct = new ProductDTO(req.body);
        let result = await productService.save(newProduct);
        res.status(201).send(result);    
    }catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo guardar el producto." });
    }
});

//Updte Product
router.put('/:pid', validateProduct, async(req, res) =>{
    
    try {
        const pid = req.params.pid;
        let newProduct = new ProductDTO(req.body);
        let result = await productService.update(pid,newProduct);
        res.status(201).send(result); 
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo Actualizar el producto." });
    }
});

//Delete Product
router.delete('/:pid', async (req,res) => {
    try{
        let {pid} = req.params;
        const result = await productService.delete(pid);
        res.status(201).send(result); 
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: error, message: "No se pudo Eliminar el producto." });
    }

})





/* router.param("word", async (req, res, next, name) => {
    console.log("Buscando título de producto, valor: " + name);
    try {
        let result = await ProductService.findByName(name);
        if (!result) {
            req.product = null;
            throw new Error('No products found');
        } else {
            req.product = result
        }
        next();
    } catch (error) {
        console.error('Ocurrió un error:', error.message);
        res.status(500).send({ error: "Error:", message: error.message });
    }
}); */

router.get("*", (req, res) => {
    res.status(400).send("Cannot get that URL!!")
});
export default router;