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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
            <div className="mb-4">
              <input
                {...methods.register("name", {
                  required: "Group name is required"
                })}
                type="text"
                placeholder="Group Name"
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                {...methods.register("description")}
                placeholder="Group Description"
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Form Fields Section */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Feedback Form Fields</h3>
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
                className="mt-4 w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-500 hover:text-gray-800"
              >
                + Add Form Field
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
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
