const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const Person = require("./models/Person")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })

app.get("/", (req, res) => {
  res.send("Family Tree API is running")
})

app.get("/api/people", async (req, res) => {
  try {
    const people = await Person.find()
    res.json(people)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch people" })
  }
})

app.post("/api/people", async (req, res) => {
  try {
    const person = await Person.create(req.body)
    res.status(201).json(person)
  } catch (error) {
    console.error("Failed to create person:", error)
    res.status(400).json({ error: "Failed to create person" })
  }
})

app.delete("/api/people/:id", async (req, res) => {
  try {
    const personId = Number(req.params.id)

    const person = await Person.findOneAndDelete({
      id: personId,
    })

    if (!person) {
      return res.status(404).json({ error: "Person not found" })
    }

    // Remove this person from other people's parent relationships
    await Person.updateMany(
      { parentIds: personId },
      { $pull: { parentIds: personId } }
    )

    // Remove this person from anyone's spouse relationship
    await Person.updateMany(
      { spouseId: personId },
      { $set: { spouseId: null } }
    )

    res.json(person)
  } catch (error) {
    console.error("Failed to delete person:", error)
    res.status(500).json({ error: "Failed to delete person" })
  }
})

app.put("/api/people/:id", async (req, res) => {
  try {
    const person = await Person.findOneAndUpdate(
      { id: Number(req.params.id) },
      {
        name: req.body.name,
        age: req.body.age,
        parentIds: req.body.parentIds,
      },
      { new: true, runValidators: true }
    )

    if (!person) {
      return res.status(404).json({ error: "Person not found" })
    }

    res.json(person)
  } catch (error) {
    console.error("Failed to update person:", error)
    res.status(400).json({ error: "Failed to update person" })
  }
})

app.put("/api/people/:id/spouse", async (req, res) => {
  try {
    const personId = Number(req.params.id)
    const spouseId =
      req.body.spouseId === null
        ? null
        : Number(req.body.spouseId)

    const person = await Person.findOne({ id: personId })

    if (!person) {
      return res.status(404).json({ error: "Person not found" })
    }

    if (spouseId !== null) {
      const spouse = await Person.findOne({ id: spouseId })

      if (!spouse) {
        return res.status(404).json({ error: "Spouse not found" })
      }

      if (spouseId === personId) {
        return res.status(400).json({
          error: "A person cannot be their own spouse",
        })
      }

      if (person.spouseId !== null) {
        await Person.findOneAndUpdate(
          { id: person.spouseId },
          { spouseId: null }
        )
      }

      if (spouse.spouseId !== null) {
        await Person.findOneAndUpdate(
          { id: spouse.spouseId },
          { spouseId: null }
        )
      }

      person.spouseId = spouseId
      spouse.spouseId = personId

      await person.save()
      await spouse.save()
    } else {
      if (person.spouseId !== null) {
        await Person.findOneAndUpdate(
          { id: person.spouseId },
          { spouseId: null }
        )
      }

      person.spouseId = null
      await person.save()
    }

    res.json(person)
  } catch (error) {
    console.error("Failed to update spouse:", error)
    res.status(400).json({ error: "Failed to update spouse" })
  }
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
