import { CreateGroupFormData } from "@/types/group"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import FormField from "./FormField"

type CreateGroupModalProps = {
  onClose: () => void
  onSubmit: (data: CreateGroupFormData) => void
}

export default function CreateGroupModal({
  onClose,
  onSubmit
}: CreateGroupModalProps) {
  const methods = useForm<CreateGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      formFields: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "formFields"
  })

  const handleAddField = () => {
    append({
      id: crypto.randomUUID(),
      type: "text",
      label: "",
      required: false
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-black border-2 border-bandada-gold/70 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(244,215,125,0.15)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-bandada-gold font-mono">
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-bandada-gold transition-colors"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Group Basic Info */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-bandada-gold font-mono mb-2"
              >
                Group Name
              </label>
              <input
                id="name"
                {...methods.register("name", {
                  required: "Group name is required"
                })}
                type="text"
                placeholder="Enter group name"
                className="w-full p-3 bg-bandada-black/80 border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono"
              />
              {methods.formState.errors.name && (
                <p className="mt-1 text-red-400 text-sm font-mono">
                  {methods.formState.errors.name.message}
                </p>
              )}

              <label
                htmlFor="description"
                className="block text-sm font-medium text-bandada-gold font-mono mt-4 mb-2"
              >
                Group Description
              </label>
              <textarea
                id="description"
                {...methods.register("description")}
                placeholder="Enter group description"
                className="w-full p-3 bg-bandada-black/80 border border-bandada-gold/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bandada-gold focus:border-transparent font-mono min-h-[100px]"
              />
            </div>

            {/* Form Fields Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-bandada-gold font-mono">
                  Feedback Form Fields
                </h3>
                <div className="h-px flex-grow bg-gradient-to-r from-bandada-gold/70 to-transparent ml-4"></div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddField}
                className="mt-4 w-full py-3 px-4 border border-dashed border-bandada-gold/50 rounded-md text-bandada-gold hover:border-bandada-gold hover:text-gold-light hover:bg-bandada-gold/5 transition-colors duration-200 font-mono"
              >
                + Add Form Field
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 bg-transparent border border-bandada-gold/50 text-bandada-gold rounded-md hover:bg-bandada-gold/10 hover:border-bandada-gold transition-colors duration-200 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-bandada-gold text-bandada-black rounded-md hover:bg-gold-light transition-colors duration-200 font-mono font-medium"
              >
                Create Group
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
