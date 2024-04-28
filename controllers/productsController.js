const Products = require("../DB/Products.json");

async function getProductsController(req, res) {
  try {
    return res.status(200).json(Products);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getProductsController };
