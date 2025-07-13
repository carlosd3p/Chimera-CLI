import { join } from "@std/path";
import { isPascalCase } from "@ntnyq/uncase";
import {
  generateIntegrationFileContent,
  generateReadmeFileContent,
  generateRequestsFileContent,
  generateSandboxFileContent,
  generateTestFileContent,
  generateTypesFileContent,
  generateZodSchemaFileContent,
} from "./generators/index.ts";

export async function createIntegration(name: string, path: string) {
  const lowerCasedName = name.toLowerCase();
  const integrationDir = join(path, lowerCasedName);
  const className = name;
  const integrationFilePath = join(integrationDir, `${lowerCasedName}.ts`);
  const typesFilePath = join(integrationDir, "types.ts");
  const readmeFilePath = join(integrationDir, "README.md");
  const requestsFilePath = join(integrationDir, "lib/requests.ts");
  const sandboxFilePath = join(integrationDir, "lib/sandbox.ts");
  const testsFilePath = join(
    integrationDir,
    `tests/${name.toLowerCase()}.test.ts`,
  );
  const zodSchemaFilePath = join(
    "Chimera/zod-schemas",
    `${lowerCasedName}.ts`,
  );

  if (!isPascalCase(name)) {
    console.error("Invalid integration name. It must be in PascalCase.");
    Deno.exit(1);
  }

  await Deno.mkdir(integrationDir, { recursive: true });
  await Deno.mkdir("Chimera/zod-schemas", { recursive: true });
  await Deno.mkdir(join(integrationDir, "lib"), { recursive: true });
  await Deno.mkdir(join(integrationDir, "tests"), { recursive: true });

  const integrationFileContent = generateIntegrationFileContent(className);
  const typesFileContent = generateTypesFileContent(
    className,
    lowerCasedName,
  );
  const requestsFileContent = generateRequestsFileContent(
    className,
    lowerCasedName,
  );
  const sandboxFileContent = generateSandboxFileContent(className);
  const readmeFileContent = generateReadmeFileContent(
    className,
    lowerCasedName,
  );
  const testFileContent = generateTestFileContent(className, lowerCasedName);
  const zodSchemaFileContent = generateZodSchemaFileContent(
    className,
    lowerCasedName,
  );

  await Promise.all([
     Deno.writeTextFile(integrationFilePath, integrationFileContent),
     Deno.writeTextFile(typesFilePath, typesFileContent),
     Deno.writeTextFile(requestsFilePath, requestsFileContent),
     Deno.writeTextFile(sandboxFilePath, sandboxFileContent),
     Deno.writeTextFile(readmeFilePath, readmeFileContent),
     Deno.writeTextFile(testsFilePath, testFileContent),
     Deno.writeTextFile(zodSchemaFilePath, zodSchemaFileContent),
  ]);
  console.log(
    `✅ Created: ${integrationFilePath}, don't forget to add the zod schema in the import/export inside zod-schemas/index.ts and the integration import the integration in the Chimera/integrations/index.js file`,
  );
}
