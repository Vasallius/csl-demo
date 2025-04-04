export type FormFieldType =
  | "text"
  | "select"
  | "multiSelect"
  | "radio"
  | "slider"

export type FormFieldOption = {
  value: string
  label: string
}

export type FormField = {
  id: string
  type: FormFieldType
  label: string
  required: boolean
  options?: FormFieldOption[]
  range?: {
    min: number
    max: number
    step: number
  }
}

export type Group = {
  id: string
  name: string
  description: string
  members: number
  formFields: FormField[]
}

export type CreateGroupFormData = {
  name: string
  description: string
  formFields: FormField[]
}
