const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Pool } = require("pg");

const pool = new Pool({
  user: "carte",
  host: "localhost",
  database: "cyf_ecommerce",
  password: "p",
  port: 5432,
});

app.get("/customers", function (req, res) {
  pool.query("SELECT * FROM customers", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/suppliers", function (req, res) {
  pool.query("SELECT * FROM suppliers", (error, result) => {
    res.json(result.rows);
  });
});


app.get("/products/all", function (req, res) {
  pool.query("SELECT products.product_name, suppliers.supplier_name FROM products INNER JOIN suppliers on products.supplier_id = suppliers.id", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  pool
    .query("SELECT * FROM customers WHERE id = $1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/products", function (req, res) {
  const productQuery = req.query.name.toLowerCase();
  let query = "SELECT products.product_name, suppliers.supplier_name FROM products INNER JOIN suppliers on products.supplier_id = suppliers.id";

  if (productQuery) {
    query = `SELECT * FROM products WHERE LOWER (product_name) LIKE '%${productQuery}%' ORDER BY product_name`;
  }

  pool
    .query(query)
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.post("/customers", function (req, res) {
  const newCustomerName = req.body.name;
  const newCustomerAddress = req.body.address;
  const newCustomerCity = req.body.city;
  const newCustomerCountry = req.body.country;

  pool
    .query("SELECT * FROM customers WHERE name=$1", [newCustomerName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An customer with the same name already exists!");
      } else {
        const query =
          "INSERT INTO customers (name, address, city, country) VALUES ($1, $2, $3, $4)";
        pool
          .query(query, [
            newCustomerName,
            newCustomerAddress,
            newCustomerCity,
            newCustomerCountry,
          ])
          .then(() => res.send("Customer created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
