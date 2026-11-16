import type { SubjectColor } from "./data/types";

/** Literal class names per subject hue, so Tailwind can generate them. */
export const SUBJECT_COLORS: Record<
  SubjectColor,
  { label: string; dot: string; text: string; soft: string; border: string; bar: string }
> = {
  cobalt: {
    label: "Cobalto",
    dot: "bg-subject-cobalt",
    text: "text-subject-cobalt",
    soft: "bg-subject-cobalt/10",
    border: "border-subject-cobalt",
    bar: "before:bg-subject-cobalt",
  },
  teal: {
    label: "Petróleo",
    dot: "bg-subject-teal",
    text: "text-subject-teal",
    soft: "bg-subject-teal/10",
    border: "border-subject-teal",
    bar: "before:bg-subject-teal",
  },
  coral: {
    label: "Terracota",
    dot: "bg-subject-coral",
    text: "text-subject-coral",
    soft: "bg-subject-coral/10",
    border: "border-subject-coral",
    bar: "before:bg-subject-coral",
  },
  amber: {
    label: "Âmbar",
    dot: "bg-subject-amber",
    text: "text-subject-amber",
    soft: "bg-subject-amber/12",
    border: "border-subject-amber",
    bar: "before:bg-subject-amber",
  },
  plum: {
    label: "Ameixa",
    dot: "bg-subject-plum",
    text: "text-subject-plum",
    soft: "bg-subject-plum/10",
    border: "border-subject-plum",
    bar: "before:bg-subject-plum",
  },
  sage: {
    label: "Sálvia",
    dot: "bg-subject-sage",
    text: "text-subject-sage",
    soft: "bg-subject-sage/12",
    border: "border-subject-sage",
    bar: "before:bg-subject-sage",
  },
};

export const SUBJECT_COLOR_KEYS = Object.keys(SUBJECT_COLORS) as SubjectColor[];
