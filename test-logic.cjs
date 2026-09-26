const aiResponses = require('./frontend/src/data/aiResponses.json');
const currentInput = 'hello';
let reply = aiResponses.default;
for (const intent of aiResponses.intents) {
  const matched = intent.keywords.some(keyword => currentInput.includes(keyword) || currentInput.match(new RegExp(`\\b${keyword}\\b`)));
  if (matched) {
    reply = intent.reply;
    break;
  }
}
console.log(reply);
