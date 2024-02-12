import { Router } from "express";
import { validateProduct } from "../utils/validateProduct.js";
import __dirname from "../utils.js";
import productsDao from "../controllers/products.controller.js";

const router = Router();

//Recuperar todos los productos
router.get("/", async (req, res) => {
    try { 
        const products = await productsDao.getAllProducts(req.query);
        res.json(products);
    }catch(error){
        console.log(error);
        res.status(400).json({
            error: error
        });
    }  
  });



/* //Recuperar un producto por titulo
//[a-zA-Z\s%C3%A1%C3%A9%20]+
//[a-zA-Z%C3%A1%C3%A9%20]+
router.get("/:word([a-zA-Z0-9%C3%A1%C3%A9%20]+)", async (req, res) => {
    try {
        console.log("Producto despues de la busqueda!!");
        //const products = await productsDao.findByName(req.params.word)
        console.log(req.product);
        const products = req.product
        if (!products) {
            res.status(202).send({ message: "No product found" });
            throw new Error('No product found');
        }
        res.json(products)
    } catch (error) {
        console.error(error);
    }
}); */

// Recuperar un producto por ID
router.get('/:pid', async (req, res) =>{
    try{
        let {pid} = req.params;
        const productoBuscado = await productsDao.getProductById(pid);
            if (!productoBuscado){
                return res.json({
                    error:"El Producto No Existe"
                });
            }
            res.json({
                productoBuscado
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
    const {  title, description, code, price, status, stock, category, thumbnail } = req.body;
    let product = {};
    try {
        product.title = title;
        product.description = description;
        product.code = code;
        product.price = price;
        product.status = status;
        product.stock = stock;
        product.category = category;
        product.thumbnail = thumbnail;
        const ProductAdded = await productsDao.createProduct(product);
        res.json({
                message: "product created",
                ProductAdded,
              });
        console.log("Producto creado:");
        console.log(ProductAdded);
        }
    catch (e) {
      res.json({
        error: e.message,
      });
    }
});

//Updte Product
router.put('/:pid', validateProduct, async(req, res) =>{
    const pid = req.params.pid;
    
    const { title, description, code, price, status, stock, category,thumbnail} = req.body;
    
    const product = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnail,
      };

    try {
        const ProductAdded = await productsDao.updateProduct(pid, product);
        if (ProductAdded){
            res.json({
                message: "updated product",
                ProductAdded,
              });
        }
        else
        {
            res.json({
             error: "I cannot update the product",
            });
        };
      
    } catch (e) {
      res.json({
        error: e.message,
      });
    }
});

//Delete Product
router.delete('/:pid', async (req,res) => {
    try{
        let {pid} = req.params;
        const productoEliminado = await productsDao.deleteProduct(pid);
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

})





/* router.param("word", async (req, res, next, name) => {
    console.log("Buscando título de producto, valor: " + name);
    try {
        let result = await productsDao.findByName(name);
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