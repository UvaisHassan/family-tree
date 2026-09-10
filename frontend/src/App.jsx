import { useEffect, useState } from 'react'

import Person from './Person'
import MobileFamilyTree from './MobileFamilyTree'
import ParentSelector from './ParentSelector'

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

  const [parentSearch, setParentSearch] = useState("")
  const [addParentSearch, setAddParentSearch] = useState("")

  const [family, setFamily] = useState([])

  const matchingParents = selectedPerson
    ? family.filter(
        (person) =>
          person.id !== selectedPerson.id &&
          !editParentIds.includes(person.id) &&
          person.name.toLowerCase().includes(parentSearch.toLowerCase())
      )
    : []

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

  const rootPerson = family.find(
    (person) => person.id === focusedPersonId
  )

  const focusedParents = rootPerson
    ? family.filter((person) =>
        rootPerson.parentIds.includes(person.id)
      )
    : []

  const searchResults = family.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedChildren = selectedPerson
    ? family.filter((person) =>
        person.parentIds.includes(selectedPerson.id)
      )
    : []
  
  const selectedParents = selectedPerson
    ? family.filter((person) =>
        selectedPerson.parentIds.includes(person.id)
      )
    : []
  
  const selectedSpouse = selectedPerson
    ? family.find(
      (person) => person.id === selectedPerson.spouseId
    )
    : null

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
        <div className='add-person-section'>
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

          <h4>Parents</h4>

          <input
            className="parent-search"
            type="text"
            placeholder="Search for a family member..."
            value={addParentSearch}
            onChange={(event) => setAddParentSearch(event.target.value)}
          />

          {addParentSearch.trim() && (
            <>
              {family.filter(
                (person) =>
                  !newParentIds.includes(person.id) &&
                  person.name
                    .toLowerCase()
                    .includes(addParentSearch.toLowerCase())
              ).length === 0 ? (
                <p>No family members found.</p>
              ) : (
                family
                  .filter((person) =>
                    !newParentIds.includes(person.id) &&
                    person.name
                      .toLowerCase()
                      .includes(addParentSearch.toLowerCase())
                  )
                  .slice(0, 8)
                  .map((person) => (
                    <label
                      key={person.id}
                      className="parent-result"
                      onClick={(event) => {
                        event.preventDefault()

                        if (newParentIds.includes(person.id)) {
                          setNewParentIds(
                            newParentIds.filter((id) => id !== person.id)
                          )
                        } else {
                          if (newParentIds.length >= 2) {
                            return
                          }

                          setNewParentIds([
                            ...newParentIds,
                            person.id,
                          ])
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={newParentIds.includes(person.id)}
                        readOnly
                      />

                      <div className="parent-result-info">
                        <strong>{person.name}</strong>
                        <div>
                          {person.age} years old · {person.gender}
                        </div>
                        {person.spouseId && (
                          <div>
                            Spouse: {
                              family.find(
                                (member) => member.id === person.spouseId
                              )?.name || "Unknown"
                            }
                          </div>
                        )}
                      </div>
                    </label>
                  ))
              )}
            </>
          )}

          <h4>Selected parents</h4>

          {newParentIds.length > 0 ? (
            newParentIds.map((parentId) => {
              const parent = family.find(
                (person) => person.id === parentId
              )

              if (!parent) {
                return null
              }

              return (
                <div className="selected-parent" key={parent.id}>
                  <div className="parent-result-info">
                    <strong>{parent.name}</strong>
                    <div>
                      {parent.age} years old · {parent.gender}
                    </div>
                    {parent.spouseId && (
                      <div>
                        Spouse: {
                          family.find(
                            (person) => person.id === parent.spouseId
                          )?.name || "Unknown"
                        }
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewParentIds(
                        newParentIds.filter(
                          (id) => id !== parent.id
                        )
                      )
                    }}
                  >
                    Remove
                  </button>
                </div>
              )
            })
          ) : (
            <p>No parents selected</p>
          )}

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
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/people`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newPerson),
                  })

                  if (!response.ok) {
                    throw new Error("Failed to create person")
                  }

                  const savedPerson = await response.json()

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
                setAddParentSearch("")
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
          placeholder='Search for a person...'
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {searchTerm && (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  setSelectedPerson(person)
                  setSearchTerm("")

                  const element = document.getElementById(
                    `person-${person.id}`
                  )

                  element?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  })
                }}
              >
                <div className='search-result-name'>
                  {person.name}
                </div>
                <div className='search-result-meta'>
                  {person.age} years old - {person.gender}
                </div>
              </button>
            ))
          ) : (
            <div className="no-search-results">
              No family member found.
            </div>
          )}
        </div>
      )}

      <h2>
        Family tree of {rootPerson?.name}
      </h2>

      <div className="tree-zoom-controls">
        <button onClick={() => setTreeZoom(Math.min(treeZoom + 0.1, 1.5))}>
          +
        </button>

        <button onClick={() => setTreeZoom(Math.max(treeZoom - 0.1, 0.5))}>
          −
        </button>

        <button onClick={() => setTreeZoom(1)}>
          Reset
        </button>
      </div>
      
      <div className="main-layout">
        {focusedPersonId !== 1 && (
          <button
            onClick={() => setFocusedPersonId(1)}
          >
            Back to main tree
          </button>
        )}

        <div className='tree'>
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
          <div className='person-details'>
            <div className="person-details-header">
              <h2>{selectedPerson.name}</h2>
              <p>{selectedPerson.age} years old - {selectedPerson.gender}</p>
            </div>
            <div className="person-actions">
              <button
                className="primary-action-button"
                onClick={() => {
                  setEditName(selectedPerson.name)
                  setEditAge(selectedPerson.age)
                  setIsEditing(true)
                }}
              >
                Edit
              </button>
            </div>

            {isEditing && (
              <div className='edit-section'>
                <h3>Editing {selectedPerson.name}</h3>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
                <label>
                  Age
                  <input
                    type="number"
                    value={editAge}
                    onChange={(event) => setEditAge(event.target.value)}
                  />
                </label>

                <div className="form-actions">
                  <button
                    onClick={async () => {
                      if (!editName.trim()) {
                        alert("Please enter a name.")
                        return
                      }

                      if (!editAge || Number(editAge) < 0) {
                        alert("Please enter a valid age.")
                        return
                      }

                      try {
                        const response = await fetch(
                          `${import.meta.env.VITE_API_URL}/api/people/${selectedPerson.id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              name: editName,
                              age: Number(editAge),
                            }),
                          }
                        )

                        if (!response.ok) {
                          throw new Error("Failed to update person")
                        }

                        const updatedPerson = await response.json()

                        const updatedFamily = family.map((person) =>
                          person.id === updatedPerson.id
                            ? updatedPerson
                            : person
                        )
  
                        setFamily(updatedFamily)
                        setSelectedPerson(updatedPerson)
                        setIsEditing(false)
                      } catch (error) {
                        console.error("Failed to update person:", error)
                        alert("Failed to update family member.")
                      }
                    }}
                  >
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              className='delete-button'
              onClick={async () => {
                const confirmed = window.confirm(
                  `Delete ${selectedPerson.name}?`
                )

                if (!confirmed) {
                  return
                }

                try {
                  const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/people/${selectedPerson.id}`,
                    {
                      method: "DELETE",
                    }
                  )

                  if (!response.ok) {
                    throw new Error("Failed to delete person")
                  }
                  
                  const updatedFamily = family
                    .filter((person) => person.id !== selectedPerson.id)
                    .map((person) => ({
                      ...person,
                      parentIds: person.parentIds.filter(
                        (id) => id !== selectedPerson.id
                      ),
                      spouseId:
                        person.spouseId === selectedPerson.id
                          ? null
                          : person.spouseId,
                    }))
                  
                  setFamily(updatedFamily)
                  setSelectedPerson(null)
                } catch (error) {
                  console.error("Failed to delete person:", error)
                  alert("Failed to delete family member.")
                }
              }}
            >
              Delete
            </button>

            <div className="relationship-section">
              <h3>Parents</h3>
              
              {selectedParents.length > 0 ? (
                selectedParents.map((parent) => (
                  <button
                    className='person-link'
                    key={parent.id}
                    onClick={() => setSelectedPerson(parent)}
                  >
                    {parent.name}
                  </button>
                ))
              ) : (
                <p>Unknown</p>
              )}

              <button
                className="action-button"
                onClick={() => {
                  setEditParentIds(selectedPerson.parentIds)
                  setParentSearch("")
                  setIsEditingParents(true)
                }}
              >
                Edit Parents
              </button>
            </div>
            
            {isEditingParents && (
              <div>
                <h3>Edit Parents</h3>

                <h4>Selected parents</h4>

                {editParentIds.length > 0 ? (
                  editParentIds.map((parentId) => {
                    const parent = family.find(
                      (person) => person.id === parentId
                    )

                    if (!parent) {
                      return null
                    }

                    return (
                      <div className='selected-parent' key={parent.id}>
                        <div className="parent-result-info">
                          <strong>{parent.name}</strong>
                          <div>
                            {parent.age} years old - {parent.gender}
                          </div>
                          {parent.spouseId && (
                            <div>
                              Spouse: {
                                family.find(
                                  (person) => person.id === parent.spouseId
                                )?.name || "Unknown"
                              }
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setEditParentIds(
                              editParentIds.filter(
                                (id) => id !== parent.id
                              )
                            )
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <p>No parents selected</p>
                )}

                <input
                  className='parent-search'
                  type="text"
                  placeholder='Search for a family member...'
                  value={parentSearch}
                  onChange={(event) => setParentSearch(event.target.value)}
                />
                
                {parentSearch.trim() && (
                  <>
                    {family.filter(
                      (person) =>
                        person.id !== selectedPerson.id &&
                        !editParentIds.includes(person.id) &&
                        person.name.toLowerCase().includes(parentSearch.toLowerCase())
                    ).length === 0 ? (
                      <p>No family members found.</p>
                    ) : (
                      matchingParents
                        .slice(0, 8)
                        .map((person) => (
                          <label
                          key={person.id}
                          className='parent-result'
                          onClick={(event) => {
                            event.preventDefault()
                            
                            if (editParentIds.includes(person.id)) {
                              setEditParentIds(
                                  editParentIds.filter((id) => id !== person.id)
                                )
                              } else {
                                if (editParentIds.length >= 2) {
                                  return
                                }
                                
                                setEditParentIds([
                                  ...editParentIds,
                                  person.id,
                                ])
                              }
                            }}
                            >
                            <input
                              type='checkbox'
                              checked={editParentIds.includes(person.id)}
                              readOnly
                            />
                            <div className='parent-result-info'>
                              <strong>{person.name}</strong>
                              <div>
                                {person.age} years old - {person.gender}
                              </div>
                              {person.spouseId && (
                                <div>
                                  Spouse: {
                                    family.find(
                                      (member) => member.id === person.spouseId
                                    )?.name || "Unknown"
                                  }
                                </div>
                              )}
                            </div>
                          </label>
                        ))
                    )}

                    {matchingParents.length > 8 && (
                      <p>Showing first 8 results of {matchingParents.length}. Refine your search to see more.</p>
                    )}
                  </>
                )}

                <button
                  className='edit-parents-button'
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/people/${selectedPerson.id}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            name: selectedPerson.name,
                            age: selectedPerson.age,
                            parentIds: editParentIds,
                          }),
                        }
                      )

                      if (!response.ok) {
                        throw new Error("Failed to update parents")
                      }

                      const updatedPerson = await response.json()
                      
                      const updatedFamily = family.map((person) =>
                        person.id === updatedPerson.id
                          ? updatedPerson
                          : person
                      )
                  
                      setFamily(updatedFamily)
                      setSelectedPerson(updatedPerson)
                      setIsEditingParents(false)
                    } catch (error) {
                      console.error("Failed to update parents:", error)
                      alert("Failed to update parents.")
                    }

                  }}
                >
                  Save
                </button>
                <button
                  className='edit-parents-button'
                  onClick={() => {
                    setIsEditingParents(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="relationship-section">
              <h3>Spouse</h3>
              {selectedSpouse ? (
                <button
                  className='person-link'
                  onClick={() => setSelectedPerson(selectedSpouse)}
                >
                  {selectedSpouse.name}
                </button>
              ) : (
                <p>None</p>
              )}
            </div>
            <div className="relationship-section">
              <h3>Children</h3>
              {selectedChildren.length > 0 ? (
                selectedChildren.map((child) => (
                  <button
                    className='person-link'
                    key={child.id}
                    onClick={() => setSelectedPerson(child)}
                  >
                    {child.name}
                  </button>
                ))
              ) : (
                <p>No children</p>
              )}
              <button
                className="action-button"
                onClick={() => {
                  const parentIds = [selectedPerson.id]
                  if (selectedSpouse) {
                    parentIds.push(selectedSpouse.id)
                  }
                  setNewName("")
                  setNewAge("")
                  setNewParentIds(parentIds)
                  setIsAdding(true)
                }}
              >
                Add Child
              </button>
            </div>
            <div className="tree-actions">
              <button
                onClick={() => {
                  const element = document.getElementById(
                    `person-${selectedPerson.id}`
                  )
                  element?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  })
                }}
              >
                Show in tree
              </button>
              <button
                onClick={() => {
                  setFocusedPersonId(selectedPerson.id)
                }}
              >
                View this person's tree
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
