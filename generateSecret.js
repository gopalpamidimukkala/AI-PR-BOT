const crypto = require('crypto');

// Generate a random string
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('Your Session Secret:');
console.log(sessionSecret); 