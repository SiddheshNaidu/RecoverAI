/**
 * surgeryTypes.js — Display labels and metadata per surgery type.
 */

export const SURGERY_TYPES = {
  appendectomy: {
    label:       "Appendectomy",
    shortLabel:  "Appendectomy",
    icon:        "medical_services",
    description: "Surgical removal of the appendix",
    color:       "primary-container",
  },
  c_section: {
    label:       "C-Section",
    shortLabel:  "C-Section",
    icon:        "child_care",
    description: "Caesarean delivery surgery",
    color:       "tertiary-container",
  },
  knee_replacement: {
    label:       "Knee Replacement",
    shortLabel:  "Knee",
    icon:        "join_right",
    description: "Total or partial knee replacement",
    color:       "secondary-container",
  },
  gallbladder: {
    label:       "Gallbladder Removal",
    shortLabel:  "Gallbladder",
    icon:        "fluid_med",
    description: "Laparoscopic cholecystectomy",
    color:       "surface-container-high",
  },
};

export const SURGERY_TYPE_KEYS = ["appendectomy", "c_section", "knee_replacement", "gallbladder"];

export function getSurgeryLabel(key) {
  return SURGERY_TYPES[key]?.label ?? key ?? "Unknown Surgery";
}

export function getSurgeryIcon(key) {
  return SURGERY_TYPES[key]?.icon ?? "medical_services";
}
