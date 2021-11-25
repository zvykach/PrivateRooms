export interface IUser {
    who: string
    by: string
    reason: string
    time: Date
}

export const UserSchemaInner = {
    who: { type: String, required: true },
    by: { type: String, required: true },
    reason: { type: String, default: "No reason"},
    time: { type: Date, default: Date.now }
}