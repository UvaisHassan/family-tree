import { useEffect, useState } from "react"

import Person from "./Person"
import MobileFamilyTree from "./MobileFamilyTree"
import ParentSelector from "./ParentSelector"
import PersonDetails from "./PersonDetails"

const SEARCH_RESULTS_LIMIT = 8

function App() {
  const [treeZoom, setTreeZoom] = useState(1)

  const [selectedPerson, setSelectedPerson] = useState(null)

  const handleSelectPerson = (person) => {
    setSelectedPerson(person)

    if (window.innerWidth <= 768) {
      setTimeout(() => {
        document.querySelector(".person-details")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 0)
    }
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAge, setEditAge] = useState("")

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newGender, setNewGender] = useState("female")
  const [newParentIds, setNewParentIds] = useState([])

  const [isEditingParents, setIsEditingParents] = useState(false)
  const [editParentIds, setEditParentIds] = useState([])

  const [searchTerm, setSearchTerm] = useState("")

  const [family, setFamily] = useState([])

  useEffect(() => {
    if (!selectedPerson || window.innerWidth > 768) return

    const element = document.getElementById("person-details")

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }, [selectedPerson])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/people`)
      .then((response) => response.json())
      .then((data) => {
        setFamily(data)
      })
      .catch((error) => {
        console.error("Failed to fetch family:", error)
      })
  }, [])

  const [focusedPersonId, setFocusedPersonId] = useState(1)

  const rootPerson = family.find((person) => person.id === focusedPersonId)

  const searchResults = family.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <h1>My Family Tree</h1>

      <button
        className="primary-button"
        onClick={() => {
          setNewName("")
          setNewAge("")
          setNewParentIds([])
          setIsAdding(true)
        }}
      >
        Add Person
      </button>

      {isAdding && (
        <div className="add-person-section" id="add-person-section">
          <h3>Add a family member</h3>

          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />

          <input
            type="number"
            placeholder="Age"
            value={newAge}
            onChange={(event) => setNewAge(event.target.value)}
          />

          <label>
            Gender
            <select
              value={newGender}
              onChange={(event) => setNewGender(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <h3>Parents</h3>

          <ParentSelector
            family={family}
            selectedParentIds={newParentIds}
            onChange={setNewParentIds}
            SEARCH_RESULTS_LIMIT={SEARCH_RESULTS_LIMIT}
          />

          <div className="form-actions">
            <button
              onClick={async () => {
                if (!newName.trim()) {
                  alert("Please enter a name.")
                  return
                }

                if (!newAge || Number(newAge) < 0) {
                  alert("Please enter a valid age.")
                  return
                }

                const newPerson = {
                  id: Date.now(),
                  name: newName,
                  age: Number(newAge),
                  gender: newGender,
                  parentIds: newParentIds,
                  spouseId: null,
                }

                try {
                  const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/people`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(newPerson),
                    },
                  )

                  if (!response.ok) {
                    throw new Error("Failed to create person")
                  }

                  setFamily([...family, newPerson])
                  setNewName("")
                  setNewAge("")
                  setNewGender("female")
                  setNewParentIds([])
                  setIsAdding(false)
                } catch (error) {
                  console.error("Failed to save person:", error)
                  alert("Failed to save family member.")
                }
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="search">
        <input
          type="text"
          placeholder="Search for a person..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {searchTerm && (
        <div className="search-results">
          {searchResults.length === 0 ? (
            <p>No family members found.</p>
          ) : (
            searchResults.slice(0, SEARCH_RESULTS_LIMIT).map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  setSelectedPerson(person)
                  setSearchTerm("")

                  if (window.innerWidth > 768) {
                    document
                      .getElementById(`person-${person.id}`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center",
                      })
                  }
                }}
              >
                <div className="search-result-name">{person.name}</div>
                <div className="search-result-meta">
                  {person.age} years old - {person.gender}
                </div>
              </button>
            ))
          )}

          {searchResults.length > SEARCH_RESULTS_LIMIT && (
            <p>
              Showing first {SEARCH_RESULTS_LIMIT} results of{" "}
              {searchResults.length}. Refine your search to see more.
            </p>
          )}
        </div>
      )}

      <h2 id="family-tree-heading">Family tree of {rootPerson?.name}</h2>

      <div className="tree-zoom-controls">
        <button onClick={() => setTreeZoom(Math.min(treeZoom + 0.1, 1.5))}>
          +
        </button>

        <button onClick={() => setTreeZoom(Math.max(treeZoom - 0.1, 0.5))}>
          −
        </button>

        <button onClick={() => setTreeZoom(1)}>Reset</button>
      </div>

      <div className="main-layout">
        {focusedPersonId !== 1 && (
          <button onClick={() => setFocusedPersonId(1)}>
            Back to main tree
          </button>
        )}

        <div className="tree">
          <div
            className="tree-content"
            style={{ transform: `scale(${treeZoom})` }}
          >
            {rootPerson && (
              <Person
                person={rootPerson}
                family={family}
                onSelect={handleSelectPerson}
                selectedPerson={selectedPerson}
              />
            )}
          </div>
        </div>

        <MobileFamilyTree
          family={family}
          onSelect={handleSelectPerson}
          selectedPerson={selectedPerson}
          focusedPersonId={focusedPersonId}
        />

        {selectedPerson && (
          <PersonDetails
            selectedPerson={selectedPerson}
            setSelectedPerson={setSelectedPerson}
            setEditName={setEditName}
            setEditAge={setEditAge}
            setIsEditing={setIsEditing}
            isEditing={isEditing}
            editName={editName}
            editAge={editAge}
            setFamily={setFamily}
            family={family}
            setEditParentIds={setEditParentIds}
            setIsEditingParents={setIsEditingParents}
            isEditingParents={isEditingParents}
            editParentIds={editParentIds}
            setNewName={setNewName}
            setNewAge={setNewAge}
            setNewParentIds={setNewParentIds}
            setIsAdding={setIsAdding}
            setFocusedPersonId={setFocusedPersonId}
            SEARCH_RESULTS_LIMIT={SEARCH_RESULTS_LIMIT}
          />
        )}
      </div>
    </div>
  )
}

export default App
