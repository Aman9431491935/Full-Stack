import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory mock database
let products = [
  { _id: "1", name: "Laptop", price: 1200, category: "Electronics" },
  { _id: "2", name: "Wireless Mouse", price: 25, category: "Accessories" },
  { _id: "3", name: "Notebook", price: 5, category: "Stationery" },
];

// ---------------- API ROUTES ----------------

// ✅ READ all products
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

// ✅ CREATE a new product
app.post("/products", (req, res) => {
  const { name, price, category } = req.body;
  const newProduct = {
    _id: Date.now().toString(),
    name,
    price,
    category,
  };
  products.push(newProduct);
  res.status(201).json({ message: "Product added", product: newProduct });
});

// ✅ UPDATE a product by ID
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const product = products.find((p) => p._id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = name || product.name;
  product.price = price || product.price;
  product.category = category || product.category;

  res.json({ message: "Product updated", product });
});

// ✅ DELETE a product by ID
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p._id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  products = products.filter((p) => p._id !== id);
  res.json({ message: "Product deleted", product });
});

// ---------------- FRONTEND ----------------

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product CRUD API Demo</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        table { width: 80%; margin: 20px auto; border-collapse: collapse; }
        th, td { padding: 10px; border: 1px solid #ccc; }
        th { background: #f4f4f4; }
        input { margin: 5px; padding: 8px; }
        button { padding: 8px 12px; margin: 5px; cursor: pointer; }
        h1 { color: #2c3e50; }
      </style>
    </head>
    <body>
      <h1>Product CRUD API Demo</h1>
      <div>
        <input id="name" placeholder="Name" />
        <input id="price" placeholder="Price" type="number" />
        <input id="category" placeholder="Category" />
        <button onclick="addProduct()">Add Product</button>
      </div>
      <table id="productTable">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Action</th></tr>
        </thead>
        <tbody></tbody>
      </table>
      <script>
        const baseUrl = window.location.origin;

        async function fetchProducts() {
          const res = await fetch(baseUrl + '/products');
          const data = await res.json();
          const tbody = document.querySelector('#productTable tbody');
          tbody.innerHTML = '';
          data.forEach(p => {
            tbody.innerHTML += \`
              <tr>
                <td>\${p._id}</td>
                <td>\${p.name}</td>
                <td>\${p.price}</td>
                <td>\${p.category}</td>
                <td><button onclick="deleteProduct('\${p._id}')">Delete</button></td>
              </tr>\`;
          });
        }

        async function addProduct() {
          const name = document.getElementById('name').value;
          const price = parseFloat(document.getElementById('price').value);
          const category = document.getElementById('category').value;
          await fetch(baseUrl + '/products', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, price, category })
          });
          fetchProducts();
        }

        async function deleteProduct(id) {
          await fetch(baseUrl + '/products/' + id, { method: 'DELETE' });
          fetchProducts();
        }

        fetchProducts();
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server running on port " + 3000));
