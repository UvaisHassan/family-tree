const mongoose = require("mongoose")

const personSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  age: {
    type: Number,
    required: true,
    min: 0,
  },

  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },

  parentIds: {
    type: [Number],
    default: [],
  },

  spouseId: {
    type: Number,
    default: null,
  },
})

module.exports = mongoose.model("Person", personSchema)
