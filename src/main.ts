import { parseCliArgs, printHelp, printInvalidCommand } from "./cli.ts";
import { createIntegration } from "./scaffold/scaffold.ts";

if (import.meta.main) {
  const parsed = parseCliArgs(Deno.args);
  const command = parsed.create;

  if (command === "help") {
    printHelp();
    Deno.exit(0);
  }

  if (command === "sync") {
    const name = parsed.name || parsed.n;
    const path = parsed.path || parsed.p || "./Chimera/integrations";
    if (!name) {
      console.error("--name is required");
      Deno.exit(1);
    }
    await createIntegration(name, path).catch((e) => {
      console.error("💥 Failed to create integration:", e);
      Deno.exit(1);
    });
  } else {
    printInvalidCommand();
    Deno.exit(1);
  }
}
