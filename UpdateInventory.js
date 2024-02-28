// Dependencies
const couchbase = require('couchbase');

// Couchbase Capella Configuration
const config = {
  connectionString: 'couchbases://<your-cluster>.dp.cloud.couchbase.com',
  username: '<your-username>',
  password: '<your-password>',
  bucketName: 'inventory',
};

// Initialize Couchbase connection
let cluster, bucket;

const initCouchbaseConnection = async () => {
  if (!cluster) {
    cluster = await couchbase.connect(config.connectionString, {
      username: config.username,
      password: config.password,
    });
    bucket = cluster.bucket(config.bucketName);
  }
};

exports.handler = async (event) => {
  await initCouchbaseConnection();
  const collection = bucket.defaultCollection();

  try {
    const { itemId, quantityChange } = event;
    const key = `item_${itemId}`;
    const getResult = await collection.get(key);
    const currentQuantity = getResult.value.quantity;
    const updatedQuantity = currentQuantity + quantityChange;

    await collection.upsert(key, { ...getResult.value, quantity: updatedQuantity });
    console.log(`Inventory updated for item ${itemId}: ${updatedQuantity}`);

    return { itemId, updatedQuantity };
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};
