const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
  city: String
});

const Model = mongoose.model('TestRegex', schema);

const searchTerm = 'lakme';

const regexObj = { $regex: searchTerm, $options: 'i' };
const query1 = {
  $and: [
    {
      $or: [
        { name: regexObj },
        { city: regexObj }
      ]
    }
  ]
};

const regexPrim = new RegExp(searchTerm, 'i');
const query2 = {
  $and: [
    {
      $or: [
        { name: regexPrim },
        { city: regexPrim }
      ]
    }
  ]
};

console.log("Query 1:", JSON.stringify(Model.find(query1).getQuery(), null, 2));
console.log("Query 2:", JSON.stringify(Model.find(query2).getQuery(), null, 2));
