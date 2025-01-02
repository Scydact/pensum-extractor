import { ReactNode, cloneElement, useEffect, useRef, useState } from 'react'

type EditableInputProps = {
    type?: 'text' | 'number' | 'textarea'
    getter: () => any
    setter: (value: any) => void
    min?: number
    max?: number
    rows?: number
    placeholder?: string
    display?: (value: any) => ReactNode
}
export default function EditableInput({
    type = 'text',
    getter,
    setter,
    min = -Infinity,
    max = +Infinity,
    rows,
    display = (value) => value,
}: EditableInputProps) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState('')
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.focus()
        }
    }, [editing])

    if (!editing) {
        return (
            <div
                tabIndex={0}
                onFocus={() => {
                    setEditing(true)
                    setValue(getter())
                }}
                className="w-100 h-100 d-flex align-items-center flex-wrap"
                style={{ minHeight: '1.5rem' }}
            >
                {display(getter())}
                {/* Add a whitespace so CSS doesnt set height to zero.
        <span style={{whiteSpace: 'pre-wrap'}}> </span>  */}
            </div>
        )
    }
    const Elem = type === 'textarea' ? <textarea /> : <input />
    return cloneElement(Elem, {
        ref,
        type,
        value,
        onChange: (evt: React.ChangeEvent<HTMLInputElement>) => setValue(evt.target.value),
        className: 'w-100 h-100',
        min,
        max,
        rows,
        onBlurCapture: () => {
            setEditing(false)
            setter(value)
        },
        onKeyUp: (evt: React.KeyboardEvent<HTMLInputElement>) => {
            switch (evt.key.toLowerCase()) {
                case 'escape':
                    setEditing(false)
                    break
                case 'enter':
                    setEditing(false)
                    setter(value)
            }
        },
    })
}
