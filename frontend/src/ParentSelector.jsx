import { useState } from "react"

function ParentSelector({
  family,
  selectedParentIds,
  onChange,
  SEARCH_RESULTS_LIMIT,
}) {
  const [search, setSearch] = useState("")

  const matchingParents = family.filter(
    (person) =>
      !selectedParentIds.includes(person.id) &&
      person.name.toLowerCase().includes(search.toLowerCase()),
  )

  const addParent = (personId) => {
    if (selectedParentIds.includes(personId)) {
      onChange(selectedParentIds.filter((id) => id !== personId))
      return
    }

    if (selectedParentIds.length >= 2) {
      return
    }

    onChange([...selectedParentIds, personId])
  }

  const removeParent = (personId) => {
    onChange(selectedParentIds.filter((id) => id !== personId))
  }

  return (
    <>
      <h4>Selected parents</h4>

      {selectedParentIds.length > 0 ? (
        selectedParentIds.map((parentId) => {
          const parent = family.find((person) => person.id === parentId)

          if (!parent) {
            return null
          }

          return (
            <div className="selected-parent" key={parent.id}>
              <div className="parent-result-info">
                <strong>{parent.name}</strong>
                <div>
                  {parent.age} years old - {parent.gender}
                </div>

                {parent.spouseId && (
                  <div>
                    Spouse:{" "}
                    {family.find((person) => person.id === parent.spouseId)
                      ?.name || "Unknown"}
                  </div>
                )}
              </div>

              <button type="button" onClick={() => removeParent(parent.id)}>
                Remove
              </button>
            </div>
          )
        })
      ) : (
        <p>No parents selected</p>
      )}

      <input
        className="parent-search"
        type="text"
        placeholder="Search for a family member..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {search.trim() && (
        <>
          {matchingParents.length === 0 ? (
            <p>No family members found.</p>
          ) : (
            matchingParents.slice(0, SEARCH_RESULTS_LIMIT).map((person) => (
              <label
                key={person.id}
                className="parent-result"
                onClick={(event) => {
                  event.preventDefault()
                  addParent(person.id)
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedParentIds.includes(person.id)}
                  readOnly
                />

                <div className="parent-result-info">
                  <strong>{person.name}</strong>
                  <div>
                    {person.age} years old · {person.gender}
                  </div>

                  {person.spouseId && (
                    <div>
                      Spouse:{" "}
                      {family.find((member) => member.id === person.spouseId)
                        ?.name || "Unknown"}
                    </div>
                  )}
                </div>
              </label>
            ))
          )}

          {matchingParents.length > SEARCH_RESULTS_LIMIT && (
            <p>
              Showing first {SEARCH_RESULTS_LIMIT} results of{" "}
              {matchingParents.length}. Refine your search to see more.
            </p>
          )}
        </>
      )}
    </>
  )
}

export default ParentSelector
