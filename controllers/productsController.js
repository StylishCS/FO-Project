const Products = require("../DB/Products.json");
const path = require("path");
const fs = require("fs");
const productsFilePath = path.resolve(__dirname, "..", "DB", "Products.json");
const { generateUID } = require("../utils/UUID");

async function getProductsController(req, res) {
  try {
    return res.status(200).json(Products);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getProductByIDController(req, res) {
  try {
    const product = Products.find((prod) => prod.id === req.params.id);
    if (!product) {
      return res.status(404).json("Product Not Found");
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
async function updateProductController(req, res) {
  try {
    if (req.file) {
      req.body.image = `http://127.0.0.1:3000/${req.file.filename}`;
    }
    const updatedProduct = req.body;
    let prodIndex = Products.findIndex((prod) => prod.id === req.params.id);
    if (prodIndex === -1) {
      return res.status(404).json("Product Not Found");
    }
    Products[prodIndex] = {
      ...Products[prodIndex],
      ...updatedProduct,
      id: req.params.id,
    };
    fs.writeFileSync(productsFilePath, JSON.stringify(Products, null, 2));
    return res.status(200).json(Products[prodIndex]);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}
async function deleteProductController(req, res) {
  try {
    let prodIndex = Products.findIndex((prod) => prod.id === req.params.id);
    if (prodIndex === -1) {
      return res.status(404).json("Product Not Found");
    }
    Products.splice(prodIndex, 1);
    fs.writeFileSync(productsFilePath, JSON.stringify(Products, null, 2));
    return res.status(200).json("Product Deleted Successfully");
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function addProductController(req, res) {
  try {
    const product = req.body;
    const productId = generateUID(10);
    product.id = productId;
    product.image = `http://127.0.0.1:3000/${req.file.filename}`;
    Products.push(product);
    fs.writeFileSync(productsFilePath, JSON.stringify(Products, null, 2));
    return res.status(200).json(Products);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  getProductsController,
  addProductController,
  updateProductController,
  deleteProductController,
  getProductByIDController,
};
