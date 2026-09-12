import ParentSelector from "./ParentSelector"

function PersonDetails({
  selectedPerson,
  setSelectedPerson,
  setEditName,
  setEditAge,
  setIsEditing,
  isEditing,
  editName,
  editAge,
  setFamily,
  family,
  setEditParentIds,
  setIsEditingParents,
  isEditingParents,
  editParentIds,
  setNewName,
  setNewAge,
  setNewParentIds,
  setIsAdding,
  setFocusedPersonId,
  SEARCH_RESULTS_LIMIT,
}) {
  const selectedChildren = selectedPerson
    ? family.filter((person) => person.parentIds.includes(selectedPerson.id))
    : []

  const selectedParents = selectedPerson
    ? family.filter((person) => selectedPerson.parentIds.includes(person.id))
    : []

  const selectedSpouse = selectedPerson
    ? family.find((person) => person.id === selectedPerson.spouseId)
    : null

  return (
    <div className="person-details">
      <div className="person-details-header">
        <h2>{selectedPerson.name}</h2>
        <p>
          {selectedPerson.age} years old - {selectedPerson.gender}
        </p>
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
        <div className="edit-section">
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
                    },
                  )

                  if (!response.ok) {
                    throw new Error("Failed to update person")
                  }

                  const updatedPerson = await response.json()

                  const updatedFamily = family.map((person) =>
                    person.id === updatedPerson.id ? updatedPerson : person,
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

            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      <button
        className="delete-button"
        onClick={async () => {
          const confirmed = window.confirm(`Delete ${selectedPerson.name}?`)

          if (!confirmed) {
            return
          }

          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/people/${selectedPerson.id}`,
              {
                method: "DELETE",
              },
            )

            if (!response.ok) {
              throw new Error("Failed to delete person")
            }

            const updatedFamily = family
              .filter((person) => person.id !== selectedPerson.id)
              .map((person) => ({
                ...person,
                parentIds: person.parentIds.filter(
                  (id) => id !== selectedPerson.id,
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
              className="person-link"
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
            setIsEditingParents(true)
          }}
        >
          Edit Parents
        </button>
      </div>

      {isEditingParents && (
        <div>
          <h3>Edit Parents</h3>

          <ParentSelector
            family={family}
            selectedParentIds={editParentIds}
            onChange={setEditParentIds}
            SEARCH_RESULTS_LIMIT={SEARCH_RESULTS_LIMIT}
          />

          <button
            className="edit-parents-button"
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
                  },
                )

                if (!response.ok) {
                  throw new Error("Failed to update parents")
                }

                const updatedPerson = await response.json()

                const updatedFamily = family.map((person) =>
                  person.id === updatedPerson.id ? updatedPerson : person,
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
            className="edit-parents-button"
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
            className="person-link"
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
              className="person-link"
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

            setTimeout(() => {
              document.getElementById("add-person-section")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }, 0)
          }}
        >
          Add Child
        </button>
      </div>

      <div className="tree-actions">
        <button
          onClick={() => {
            const target =
              window.innerWidth <= 768
                ? document.getElementById("mobile-family-tree")
                : document.getElementById(`person-${selectedPerson.id}`)

            target?.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "center",
            })
          }}
        >
          Show in tree
        </button>

        <button
          onClick={() => {
            setFocusedPersonId(selectedPerson.id)

            setTimeout(() => {
              document.getElementById("family-tree-heading")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }, 0)
          }}
        >
          View this person's tree
        </button>
      </div>
    </div>
  )
}

export default PersonDetails
