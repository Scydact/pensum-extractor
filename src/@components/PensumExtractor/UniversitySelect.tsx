import React from "react"

type Props = {
  universities: DataJson.University[],
  selected: string,
  setSelected: React.Dispatch<React.SetStateAction<string>>
}

function UniversitySelect({ universities, selected, setSelected }: Props) {
  return (
    <select
      name="university_select"
      id="university_select"
      value={selected}
      onChange={(evt) => setSelected(evt.target.value)}>
      {universities.map(uni => (
        <option
          key={uni.code}
          value={uni.code}>
          {`[${uni.shortName}] ${uni.longName}`}
        </option>
      ))}
    </select>
  )
}

export default UniversitySelect