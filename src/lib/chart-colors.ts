/** Hex values (not CSS variables) because Recharts writes them into SVG attributes. Keep in sync with globals.css. */
export const chartColors = {
  primary: "#115E52",
  muted: "#8A9490",
  grid: "#E4E8E5",
  status: {
    active: "#115E52",
    paused: "#7A6AA6",
    confirmed: "#5FB3A1",
    quotation: "#D9A441",
    draft: "#B9C2BE",
    closed: "#8A9490",
  },
} as const;
