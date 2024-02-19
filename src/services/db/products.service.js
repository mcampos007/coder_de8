import  productsModel  from "./models/products.model.js";
import mongoose from "mongoose";

export default class ProductDao {
  constructor(){
    console.log("Calling product model a servise");
  }
  
  getAll = async () => {
   // let products = await productsModel.find() ;
    let products = await productsModel.paginate() ;
    return products;
  };
  
  save = async (product) => {
    let result = await productsModel.create(product);
    return result;    
  };

  findByTitle = async (title) => {
    const result = await productsModel.findOne({title: title});
    return result;
  };

  findById = async(id) =>{
    let result = await productsModel.findById(id);
    return result;
  }
  delete = async(id) => {
    const result = await productsModel.findByIdAndDelete(id);
    return result;
  };

  update = async(id, product) => {
    //const result = await productsModel.findByIdAndUpdate(id, product);
    let result = await productsModel.updateOne({ _id: id }, product);
    return result;
  }
}
