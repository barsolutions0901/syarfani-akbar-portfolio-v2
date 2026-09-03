export type ActionState =
  | { error: string; success?: never }
  | { error?: never; success: true };

export const initialState: ActionState = { error: "" };