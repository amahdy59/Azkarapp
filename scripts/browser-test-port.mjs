export function browserTestPort(value = process.env.E2E_PORT) {
  if (value === undefined || value === "") return 4173;
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error("E2E_PORT must be an integer from 1 to 65535.");
  }
  return Number(value);
}
