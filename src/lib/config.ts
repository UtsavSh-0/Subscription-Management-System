/** Single place to change money formatting. */
export const CURRENCY = { code: "INR", locale: "en-IN" } as const;

/** "Today" (UTC date) used by overdue and renewal calculations. */
export const REF_DATE = new Date().toISOString().slice(0, 10);
