export const HACCP_STANDARDS = {
  cooking: {
    limit: "Core temperature ≥ 75°C for at least 30 seconds (or equivalent time/temp combination like 70°C for 2 mins).",
    monitoring: "Check core temperature of thickest part of food using a calibrated probe thermometer.",
    corrective_action: "Continue cooking until temperature is reached. If not possible, discard product."
  },
  cooling: {
    limit: "Cool from 60°C to 10°C within 2 hours; or 60°C to 21°C in 2 hours, then to 5°C within 4 more hours.",
    monitoring: "Check time and temperature at start and end of cooling process.",
    corrective_action: "If limit exceeded: Reheat to 75°C immediately and re-cool, or use for immediate service. If time greatly exceeded (>4 hours), discard."
  },
  reheating: {
    limit: "Core temperature ≥ 75°C for at least 30 seconds.",
    monitoring: "Check core temperature with probe thermometer.",
    corrective_action: "Continue reheating until temperature reached. Discard if equipment fails."
  },
  chilled_storage: {
    limit: "Air temperature ≤ 5°C (Food core temp ≤ 8°C allowed for short periods during prep).",
    monitoring: "Check fridge display temperature twice daily. Cross-check with manual probe weekly.",
    corrective_action: "Adjust dial. Move food to working fridge. If food >8°C for >4 hours, discard."
  },
  frozen_storage: {
    limit: "Air temperature ≤ -18°C.",
    monitoring: "Check freezer display temperature daily.",
    corrective_action: "Adjust dial. Move food. If thawed but <5°C, use immediately. If >5°C, discard."
  },
  hot_holding: {
    limit: "Core temperature ≥ 63°C.",
    monitoring: "Check temperature every 2 hours.",
    corrective_action: "Turn up heat. If <63°C for <2 hours, reheat to 75°C. If >2 hours, discard."
  },
  thawing: {
    limit: "Thaw in fridge <5°C. No thawing at room temperature.",
    monitoring: "Visual check of method. Fridge temp check.",
    corrective_action: "Move to fridge. If surface >8°C for >4 hours, discard."
  },
  metal_detection: {
    limit: "Detection and rejection of Fe >1.5mm, Non-Fe >2.0mm, SS >2.5mm (device specific).",
    monitoring: "Test with test pieces (Fe, Non-Fe, SS) at start, end, and hourly.",
    corrective_action: "Stop line. Re-check all product since last successful check. Repair device."
  },
  delivery_receipt: {
    limit: "Chilled food ≤ 5°C, Frozen ≤ -18°C, Hot ≥ 63°C.",
    monitoring: "Check temp of incoming goods before accepting.",
    corrective_action: "Reject delivery."
  }
};
