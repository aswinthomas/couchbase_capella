const express = require('express');
const bodyParser = require('body-parser');
const couchbase = require('couchbase');
const config = require('./config.json'); // Assuming your configuration is stored here

const cors = require('cors');



const app = express();
app.use(bodyParser.json());
// Use CORS middleware to allow cross-origin requests
app.use(cors());

let cluster, bucket, collection;

async function initDb() {
    cluster = await couchbase.connect(config.couchbase.connectionString, {
        username: config.couchbase.username,
        password: config.couchbase.password,
    });
    bucket = cluster.bucket(config.couchbase.bucketName);
    collection = bucket.scope(config.couchbase.scopeName).collection(config.couchbase.collectionName);
    console.log(`Got collection ${config.couchbase.collectionName}`);
}

async function createPrimaryIndex() {
  try {
    const query = 'CREATE PRIMARY INDEX ON `inventory`.`_default`.`items`';
    await cluster.query(query);
    console.log('Primary index created successfully');
  } catch (error) {
    console.error('Failed to create primary index:', error);
  }
}

app.post('/api/items', async (req, res) => {
    try {
        const { id, name, quantity, description } = req.body;
        await collection.upsert(id, { name, quantity, description });
        res.status(200).send({ success: true, message: 'Item added/updated successfully' });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to add/update item', error: error.message });
    }
});

// Function to fetch all items from the collection
async function fetchAllItemsFromCollection() {
  const n1qlQuery = `SELECT META(\`${config.couchbase.collectionName}\`).id AS id, * FROM \`${config.couchbase.bucketName}\`.\`${config.couchbase.scopeName}\`.\`${config.couchbase.collectionName}\``;
  try {
    const result = await cluster.query(n1qlQuery);
    return result.rows || [];
  } catch (error) {
    console.error('Error executing query:', n1qlQuery, 'Error:', error);
    throw error;  // Rethrow the error to be handled by the caller
  }
}

app.get('/api/items', async (req, res) => {
  try {
    const items = await fetchAllItemsFromCollection();
    res.status(200).send({ success: true, items: items });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).send({ success: false, message: 'Failed to retrieve items', error: error.message });
  }
});



async function startServer() {
    await initDb(); // Ensure DB is initialized before starting the server
    await createPrimaryIndex(); // Call this function to create the index, ideally during application initialization
    app.listen(config.server.port, () => {
        console.log(`Server listening on port ${config.server.port}`);
    });
}

startServer().catch(console.error);
