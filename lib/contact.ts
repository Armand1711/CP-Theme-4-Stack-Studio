import { contactInterests } from "./content";

export type ContactInterest = (typeof contactInterests)[number];

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  company?: string;
  interest?: ContactInterest | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared by the client form and the API route. Returns field → message for anything invalid. */
export function validateContact(input: Partial<ContactPayload>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name?.trim()) errors.name = "Please add your name.";
  if (!input.email?.trim() || !EMAIL_RE.test(input.email.trim())) errors.email = "Please add a valid email.";
  if (!input.message?.trim()) errors.message = "Tell us a little about what you're building.";
  else if (input.message.length > 5000) errors.message = "Please keep it under 5,000 characters.";
  if (input.interest && !contactInterests.includes(input.interest)) errors.interest = "Unknown option.";
  return errors;
}
