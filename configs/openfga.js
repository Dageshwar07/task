const { OpenFgaClient } = require('@openfga/sdk');

const openFgaClient = new OpenFgaClient({
  apiScheme: process.env.OPENFGA_API_SCHEME || 'http',
  apiHost: process.env.OPENFGA_API_HOST || 'localhost:8080',
  storeId: process.env.OPENFGA_STORE_ID,
  authorizationModelId: process.env.OPENFGA_AUTH_MODEL_ID,
});

module.exports = openFgaClient;
