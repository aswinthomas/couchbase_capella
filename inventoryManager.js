const couchbase = require('couchbase');
const config = require('./config.json').couchbase; // Load configuration from config.json
let collection;

async function initCouchbase() {
    // Initialize Couchbase connection and bucket
    const cluster = await couchbase.connect(config.connectionString, {
        username: config.username,
        password: config.password,
        // Use the pre-configured profile below to avoid latency issues with your connection.
        configProfile: "wanDevelopment",
    });

    console.log('Connected to DB: ', config.connectionString)
    const bucket = cluster.bucket(config.bucketName);
    collection = bucket.scope(config.scopeName).collection(config.collectionName);
    console.log('Collection initialized:', collection);
}

// Function to add or update an inventory item
async function upsertInventoryItem(itemId, itemDetails) {
    try {
        await collection.upsert(itemId, itemDetails);
        console.log(`Item ${itemId} added/updated successfully.`);
    } catch (error) {
        console.error('Failed to upsert item:', error);
    }
}

// Function to get an inventory item's details
async function getInventoryItem(itemId) {
    try {
        const result = await collection.get(itemId);
        console.log(`Item ${itemId} details:`, result.value);
        return result.value;
    } catch (error) {
        console.error('Failed to get item:', error);
        return null;
    }
}

// Example usage
async function runExample() {
    await initCouchbase()
    const itemId = 'item1';
    const itemDetails = {
        name: 'Laptop',
        quantity: 100,
        description: 'High-performance laptop'
    };

    await upsertInventoryItem(itemId, itemDetails);

    const item = await getInventoryItem(itemId);
    console.log('Fetched item:', item);
}


runExample().catch(console.error);