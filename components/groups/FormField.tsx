import { useFormContext } from "react-hook-form"

type FormFieldProps = {
  index: number
  onRemove: () => void
}

export default function FormField({ index, onRemove }: FormFieldProps) {
  const { register, watch } = useFormContext()
  const fieldType = watch(`formFields.${index}.type`)

  return (
    <div className="p-4 border border-bandada-gold/40 rounded-md bg-bandada-black/60">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-bandada-gold font-mono">Field #{index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 transition-colors"
          aria-label="Remove field"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
            Field Type
          </label>
          <select
            {...register(`formFields.${index}.type`)}
            className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
          >
            <option value="text">Text</option>
            <option value="single-select">Multiple Choice</option>
            <option value="multi-select">Checkbox</option>
            <option value="slider">Slider</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
            Question
          </label>
          <input
            type="text"
            {...register(`formFields.${index}.label`)}
            placeholder="Enter Question"
            className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            {...register(`formFields.${index}.required`)}
            className="form-checkbox h-4 w-4 text-bandada-gold border-bandada-gold/50 rounded focus:ring-bandada-gold focus:ring-offset-black"
          />
          <span className="ml-2 text-white font-mono">Required field</span>
        </label>
      </div>

      {(fieldType === "single-select" || fieldType === "multi-select") && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
            Choices (comma separated)
          </label>
          <input
            type="text"
            {...register(`formFields.${index}.options`)}
            placeholder="Option 1, Option 2, Option 3"
            className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
          />
        </div>
      )}

      {fieldType === "slider" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
              Min Value
            </label>
            <input
              type="number"
              {...register(`formFields.${index}.min`)}
              placeholder="0"
              className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
              Max Value
            </label>
            <input
              type="number"
              {...register(`formFields.${index}.max`)}
              placeholder="100"
              className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bandada-gold font-mono mb-2">
              Step
            </label>
            <input
              type="number"
              {...register(`formFields.${index}.step`)}
              placeholder="1"
              className="w-full p-2 bg-black border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
            />
          </div>
        </div>
      )}
    </div>
  )
}
