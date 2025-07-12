import { parseArgs } from "@std/cli/parse-args";

export interface CliOptions {
  create?: string;
  c?: string;
  name?: string;
  n?: string;
  path?: string;
  p?: string;
}

export function parseCliArgs(args: string[]): CliOptions {
  return parseArgs(args, {
    alias: {
      create: "c",
      name: "n",
      path: "p",
    },
  });
}

export function printHelp() {
  console.log(
    `ℹ️ Usage: chimera-cli create sync --name=<integration_name> --path=<optional relative/path>`,
  );
}

export function printInvalidCommand() {
  console.log(`Invalid command, please use \"chimera-cli --help\" for more information`);
}
