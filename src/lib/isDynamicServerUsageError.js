export function isDynamicServerUsageError(error) {
  if (!error || typeof error !== "object") return false;

  const digest = error.digest;
  const message = typeof error.message === "string" ? error.message : "";
  const description =
    typeof error.description === "string" ? error.description : "";

  return (
    digest === "DYNAMIC_SERVER_USAGE" ||
    message.includes("Dynamic server usage") ||
    description.includes("Dynamic server usage")
  );
}

