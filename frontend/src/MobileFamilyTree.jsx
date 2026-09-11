import { useState } from "react"

function MobileFamilyNode({
  person,
  family,
  onSelect,
  selectedPerson,
  depth = 0,
}) {
  const [expanded, setExpanded] = useState(depth === 0)

  const spouse = family.find((member) => member.id === person.spouseId)

  const children = family.filter((member) =>
    member.parentIds.includes(person.id),
  )

  const hasChildren = children.length > 0

  const isSelected =
    selectedPerson?.id === person.id || selectedPerson?.id === spouse?.id

  return (
    <div className="mobile-family-branch">
      <div
        className={`mobile-family-node ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${depth * 20}px` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded)
          }
        }}
      >
        <span
          onClick={(event) => {
            event.stopPropagation()
            onSelect(person)
          }}
        >
          {person.name}
        </span>

        {spouse && (
          <>
            {" - "}
            <span
              onClick={(event) => {
                event.stopPropagation()
                onSelect(spouse)
              }}
            >
              {spouse.name}
            </span>
          </>
        )}

        {hasChildren && (
          <button className="mobile-family-toggle" type="button">
            {expanded ? "▼" : "▶"}
          </button>
        )}
      </div>

      {expanded &&
        children.map((child) => (
          <MobileFamilyNode
            key={child.id}
            person={child}
            family={family}
            onSelect={onSelect}
            selectedPerson={selectedPerson}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}

function MobileFamilyTree({
  family,
  onSelect,
  selectedPerson,
  focusedPersonId,
}) {
  const rootPerson = family.find((person) => person.id === focusedPersonId)

  if (!rootPerson) {
    return null
  }

  return (
    <div className="mobile-family-tree" id="mobile-family-tree">
      <MobileFamilyNode
        person={rootPerson}
        family={family}
        onSelect={onSelect}
        selectedPerson={selectedPerson}
      />
    </div>
  )
}

export default MobileFamilyTree
