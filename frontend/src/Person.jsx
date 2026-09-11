function Person({ person, family, onSelect, selectedPerson }) {
  const children = family.filter((member) =>
    member.parentIds.includes(person.id),
  )

  const spouse = family.find((member) => member.id === person.spouseId)

  const showSpouse = spouse && person.id < spouse.id

  return (
    <div className="person">
      <div className="couple" id={`person-${person.id}`}>
        <div
          className={`person-card ${
            selectedPerson?.id === person.id ? "selected" : ""
          }`}
          onClick={() => onSelect(person)}
        >
          <div className="person-name">{person.name}</div>

          <div className="person-age">{person.age} years old</div>

          <div className="person-gender">{person.gender}</div>
        </div>

        {showSpouse && (
          <div
            className={`person-card ${
              selectedPerson?.id === spouse.id ? "selected" : ""
            }`}
            onClick={() => onSelect(spouse)}
          >
            <div className="person-name">{spouse.name}</div>

            <div className="person-age">{spouse.age} years old</div>

            <div className="person-gender">{spouse.gender}</div>
          </div>
        )}
      </div>

      <div className="children">
        {children.map((child) => (
          <Person
            key={child.id}
            person={child}
            family={family}
            onSelect={onSelect}
            selectedPerson={selectedPerson}
          />
        ))}
      </div>
    </div>
  )
}

export default Person
