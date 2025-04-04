import { useFormContext } from "react-hook-form"

type FormFieldProps = {
  index: number
  onRemove: () => void
}

export default function FormField({ index, onRemove }: FormFieldProps) {
  const { register, watch } = useFormContext()

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between mb-2">
        <input
          {...register(`formFields.${index}.label` as const)}
          type="text"
          placeholder="Field Label"
          className="w-full p-2 border rounded mr-2"
        />
        <select
          {...register(`formFields.${index}.type` as const)}
          className="p-2 border rounded"
        >
          <option value="text">Text</option>
          <option value="select">Select</option>
          <option value="multiSelect">Multi Select</option>
          <option value="radio">Radio</option>
          <option value="slider">Slider</option>
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-red-600 hover:text-red-800"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Field type specific configurations */}
      {watch(`formFields.${index}.type`) === "slider" && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input
            {...register(`formFields.${index}.range.min` as const)}
            type="number"
            placeholder="Min"
            className="p-2 border rounded"
          />
          <input
            {...register(`formFields.${index}.range.max` as const)}
            type="number"
            placeholder="Max"
            className="p-2 border rounded"
          />
          <input
            {...register(`formFields.${index}.range.step` as const)}
            type="number"
            placeholder="Step"
            className="p-2 border rounded"
          />
        </div>
      )}

      {(watch(`formFields.${index}.type`) === "select" ||
        watch(`formFields.${index}.type`) === "multiSelect" ||
        watch(`formFields.${index}.type`) === "radio") && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">
            Options (one per line)
          </div>
          <textarea
            {...register(`formFields.${index}.options` as const, {
              setValueAs: (value: string) =>
                value
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((label) => ({
                    value: label.toLowerCase().replace(/\s+/g, "_"),
                    label: label.trim()
                  }))
            })}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <div className="mt-2">
        <label className="flex items-center space-x-2">
          <input
            {...register(`formFields.${index}.required` as const)}
            type="checkbox"
          />
          <span className="text-sm text-gray-600">Required field</span>
        </label>
      </div>
    </div>
  )
}
