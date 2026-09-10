const mongoose = require("mongoose")
require("dotenv").config()

const Person = require("./models/Person")
const familyData = require("./seed")

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("Connected to MongoDB")

    await Person.deleteMany({})
    console.log("Existing people cleared")

    await Person.insertMany(familyData)
    console.log(`${familyData.length} people imported`)

    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  } catch (error) {
    console.error("Import failed:", error)
  }
}

importData()