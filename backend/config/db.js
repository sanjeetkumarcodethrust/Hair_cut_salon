import dns from 'node:dns';
import mongoose from 'mongoose';
import env from './env.js';

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const describeMongoUri = (mongoUri) => {
  try {
    const parsedUri = new URL(mongoUri);
    return {
      protocol: parsedUri.protocol,
      host: parsedUri.hostname,
      database: parsedUri.pathname || '(default)',
      usernamePresent: Boolean(parsedUri.username),
      passwordPresent: Boolean(parsedUri.password),
    };
  } catch {
    return null;
  }
};

const describeConnectionError = (error) => {
  const message = error?.message || 'Unknown MongoDB error';
  if (/querySrv|ENOTFOUND|EAI_AGAIN|ECONNREFUSED/i.test(message)) {
    return 'DNS or network access failed. Check the Atlas hostname, internet connection, and Network Access IP allowlist.';
  }
  if (/authentication failed|bad auth|auth failed/i.test(message)) {
    return 'MongoDB authentication failed. Check the database username and password, including URL encoding for special characters.';
  }
  if (/timed out|server selection/i.test(message)) {
    return 'MongoDB server selection timed out. Check the Atlas IP allowlist, firewall, VPN, and cluster availability.';
  }
  if (/invalid scheme|invalid connection string|must be a string/i.test(message)) {
    return 'The MongoDB URI format is invalid. It must start with mongodb:// or mongodb+srv://.';
  }
  return 'Check the full MongoDB error above and verify the Atlas connection settings.';
};

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] connection state: connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] connection state: disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error(`[MongoDB] connection event error: ${error.message}`);
});

const connectDB = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    try {
      dns.setServers(env.mongoDnsServers);
    } catch (dnsErr) {
      console.warn(`[MongoDB] Custom DNS servers warning: ${dnsErr.message}`);
    }
    const uriDetails = describeMongoUri(env.mongoUri);
    if (!uriDetails) {
      throw new Error('MONGO_URI is not a valid URL. Check backend/.env.');
    }

    console.log('[MongoDB] starting connection');
    console.log('[MongoDB] URI details:', uriDetails);
    console.log('[MongoDB] DNS servers:', env.mongoDnsServers);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[MongoDB] connection established successfully');
  } catch (error) {
    console.error(`[MongoDB] connection failed: ${error.message}`);
    console.error(`[MongoDB] diagnosis: ${describeConnectionError(error)}`);
    // Do not exit process, allow backend to stay up to serve 500 errors gracefully
  }
};

export default connectDB;
