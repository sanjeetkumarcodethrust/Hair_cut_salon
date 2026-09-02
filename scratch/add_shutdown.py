import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

graceful_shutdown = """
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
"""

if "gracefulShutdown" not in content:
    content = content.replace("httpServer.listen(PORT, () => {", graceful_shutdown + "\nhttpServer.listen(PORT, () => {")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added graceful shutdown to server.js")
