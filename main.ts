import { parseArgs } from "@std/cli/parse-args";
import { join } from "@std/path";
import { isPascalCase } from "@ntnyq/uncase";

async function createIntegration(name: string, path: string) {
  const integrationDir = join(path, name);
  const className = name;
  const lowerCasedName = name.toLowerCase();
  const integrationFilePath = join(integrationDir, `${lowerCasedName}.ts`);
  const typesFilePath = join(integrationDir, 'types.ts');
  const readmeFilePath = join(integrationDir, 'README.md');
  const requestsFilePath = join(integrationDir, 'lib/requests.ts');
  const sandboxFilePath = join(integrationDir, 'lib/sandbox.ts');
  const testsFilePath = join(integrationDir, `tests/${name.toLowerCase()}.test.ts`);
  const zodSchemaFilePath = join('Chimera/zod-schemas', `${lowerCasedName}.ts`);

  if (!isPascalCase(name)) {
    console.error("Invalid integration name. It must be in PascalCase.");
    Deno.exit(1);
  }

  await Deno.mkdir(integrationDir, { recursive: true });
  await Deno.mkdir('Chimera/zod-schemas', { recursive: true });
  await Deno.mkdir(join(integrationDir, 'lib'), { recursive: true });
  await Deno.mkdir(join(integrationDir, 'tests'), { recursive: true });

  const integrationFileContent = `
import type { Options } from '../../types/integration/options';
import type { Step1BuildRequestOptions, Step1ExecuteOptions } from './types';
import type { ParseResponseOptions, RawResponse } from '../../types/integration/integration';

import Integration from '../integration';
import { responseTemplate } from '../../utility';
import { } from './lib/requests';

export default class ${className} extends Integration {
  constructor(options: Options) {
    super(options);
    this.flags = {
      useOptionsObject: true,
    };

    this.steps = {
      step1: {
        firstStep: true,
        buildRequest: ({ credentials, validatedPayload }: Step1BuildRequestOptions) => {
          this.checkMissingCredentials(credentials, ['api_key']);
          return {
            api_key: credentials.api_key,
          };
        },
        execute: async ({ validatedPayload, credentials }: Step1ExecuteOptions) => {
          const { data } = await this.requestWrapper.makeRequest(
            anAsyncFunction()
          );

          return data as RawResponse;
        }
      }
    };

    this.parseResponse = ({ validatedResponse }: ParseResponseOptions) => {
      const response = responseTemplate();
      response.raw = validatedResponse.slice(-1);
      return response;
    };
  }
}

`;

const typesFileContent = `
import type { Artifacts } from '../../types/integration/integration';
import type { InferSchemaWithRequiredProps } from '../../types/schema';
import type { ${lowerCasedName}Base } from '../../zod-schemas/${lowerCasedName}';

export interface Credentials {
  private_key: string;
  env?: 'sandbox' | 'prod';
}

export type Step1ValidatedPayload = InferSchemaWithRequiredProps<typeof ${lowerCasedName}Base, 'required_field'>;

export interface Step1BuildRequestOptions {
  validatedPayload: Step1ValidatedPayload;
  credentials: Credentials;
}

export interface Step1ExecuteOptions extends Step1BuildRequestOptions {
  artifacts: Artifacts;
}

export interface ${className}AsyncOperationResponse {
  results: unknown;
}
`;

const requestsFileContent = `
import type { MakeRequestOptions } from '../../../lib/requests/types';
import type { Credentials, ${className}AsyncOperationResponse } from '../types';
import { getAsyncOperationSandboxResponse } from './sandbox';

const SANDBOX_BASE_URL = 'https://api.${lowerCasedName}-mock--sandbox-integration.com';
const PROD_BASE_URL = 'https://api.${lowerCasedName}.com';

interface ${className}RequestOptions {
  required_field: string;
  credentials: Credentials;
}

const getCommonSettings = ({ credentials, required_field }: ${className}RequestOptions) => {
  const baseUrl = credentials.env === 'sandbox' ? SANDBOX_BASE_URL : PROD_BASE_URL;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'api-version': '1.0',
    'x-api-key': credentials.api_key,
    'X-Incode-Hardware-Id': required_field
  };

  return {
    baseUrl,
    headers
  };
};

export const getAsyncOperation = ({ required_field, credentials }: ${className}RequestOptions) => {
  const { baseUrl, headers } = getCommonSettings({ credentials, required_field });
  return {
    resource: 'fetch-user-profile',
    liveConfig: {
      method: 'GET',
      url: "\${baseUrl}/users/1",
      headers
    },
    sandboxResponse: getUserProfileSandboxResponse()
  } satisfies MakeRequestOptions<${className}AsyncOperationResponse>;
};

`;

const sandboxFileContent = `
import type { ${className}AsyncOperationResponse } from '../types';
import type { RequestResponse } from '../../../lib/requests/types';

export const getAsyncOperationSandboxResponse = (): RequestResponse<${className}AsyncOperationResponse> => ({
  status: 200,
  data: {
    someField: 'someValue'
  }
});

`;

const readmeFileContent = `
# ${className}

${className} description.

**API Version**: v1

- [${className} API Docs](https://developer.${lowerCasedName}.com/docs)
- [Notion Documentation](https://www.notion.so/alloy/${className})

## Service Requirements
| Credential               | Required?         | Notes                                   |
| ------------------------ | ----------------- | --------------------------------------- |
|                          |                   |                                         |

### Client Payload

This section describes the structure and content of the information that the client must send to Alloy to get the results of the ${className} identity verification.

#### **Payload Structure**

#### **Field Descriptions**

#### **Payload Example**

#### Validations and Constraints

## Build Request (Cache)

- Validates required credentials.
- Maps payload to cache key.

## Execute Flow

## Testing Guide

`;

const testFileContent = `
import type { SinonStub } from 'sinon';
import type { Credentials, Step1BuildRequestOptions, Step1ExecuteOptions } from '../types';
import type ${className} from '../${className}';
import type {
  ParseResponseOptions,
  ParseResponseWithOptions,
  BuildRequestWithOptions,
  ExecuteWithOptions
} from '../../../types/integration/integration';

import sinon from 'sinon';
import { expect } from '../../../test/unit/lib/chai';
import { mockIntegration } from '../../../test/unit/lib/roundtripTestHelpers';
import { UserError } from '../../../errors';
import { getAsyncOperationSandboxResponse } from '../lib/sandbox';

describe('${className}', () => {
  let ${className.toLowerCase()}: ${className};
  const credentials: Credentials = {
    api_key: 'test_api_key'
  };
  const sandboxedAsyncOperationResponse = getAsyncOperationSandboxResponse();

  describe('step1', () => {
    describe('buildRequest', () => {
      before(async () => {
        ({ integration: ${lowerCasedName} } = await mockIntegration({ name: '${lowerCasedName}', credentials }));
      });

      it('should throw a UserError for missing credentials', () => {
        let error;
        try {
          (${lowerCasedName}.steps.step1.buildRequest as BuildRequestWithOptions)({
            validatedPayload: {},
            credentials: {}
          });
        } catch (e) {
          error = e;
        }
        expect(error).to.be.instanceOf(UserError);
      });

      it('should build request successfully with required fields', () => {
        const actual = (${lowerCasedName}.steps.step1.buildRequest as BuildRequestWithOptions)({
          validatedPayload: {
            requiredField: 'some value'
          },
          credentials
        } as Step1BuildRequestOptions);

        expect(actual).to.deep.equal({
          api_key: 'test_api_key',
          requiredField: 'some value'
        });
      });
    });

    describe('execute', () => {
      let requestStub: SinonStub;

      beforeEach(async () => {
        ({ integration: ${lowerCasedName} } = await mockIntegration({ name: '${lowerCasedName}', credentials }));
        requestStub = sinon.stub(${lowerCasedName}.requestWrapper, 'makeRequest');
      });

      afterEach(() => {
        sinon.restore();
      });

      it('should return async operation response', async () => {
        const mockUserProfileResponse = { data: sandboxedAsyncOperationResponse };

        requestStub.resolves(mockUserProfileResponse);

        const response = await (${lowerCasedName}.steps.step1.execute as ExecuteWithOptions)({
          credentials,
          validatedPayload: {
            requiredField: 'some value'
          }
        } as Step1ExecuteOptions);

        expect(requestStub.callCount).to.equal(1);
        expect(response).to.deep.equal(sandboxedAsyncOperationResponse);
      });

      it('should handle API errors appropriately', async () => {
        requestStub.rejects(new Error('API Error'));

        let error;
        try {
          await (${lowerCasedName}.steps.step1.execute as ExecuteWithOptions)({
            credentials,
            validatedPayload: {
              requiredField: 'some value'
            }
          } as Step1ExecuteOptions);
        } catch (e) {
          error = e;
        }

        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('API Error');
      });
    });
  });

  describe('parseResponse', () => {
    before(async () => {
      ({ integration: ${lowerCasedName} } = await mockIntegration({ name: '${lowerCasedName}', credentials }));
    });

    after(sinon.restore);

    it('should return last raw response in template', () => {
      const mockResponse = [sandboxedAsyncOperationResponse];

      const actual = (${lowerCasedName}.parseResponse as ParseResponseWithOptions)({
        validatedResponse: mockResponse
      } as ParseResponseOptions);

      expect(actual.raw).to.deep.equal([mockResponse.at(-1)]);
    });

    it('should handle empty response gracefully', () => {
      const mockResponse: any = {};

      const actual = (${lowerCasedName}.parseResponse as ParseResponseWithOptions)({
        validatedResponse: mockResponse
      } as ParseResponseOptions);

      expect(actual.raw).to.deep.equal({});
    });
  });
});

`;

const zodSchemaFileContent = `
// @ts-strict

import { z } from 'zod';
import type { MetadataObject } from '../types/schema';

const aRequiredField = z.string({ message: 'aRequiredField is required' }).min(1, 'aRequiredField is required');

export const ${lowerCasedName}Base = z.object({
  someField: aRequiredField
});

const get${className}ValidationSchema = () => ${lowerCasedName}Base;

const ${lowerCasedName}SchemaMetadata: MetadataObject = {
  fields: {
    someField: {
      description: 'Some field',
      hideInForm: true
    }
  },
  andGroups: [],
  orGroups: [],
  withGroups: []
};

export default {
  step1: { getValidationSchema: get${className}ValidationSchema, schemaMetadata: ${lowerCasedName}SchemaMetadata }
};

`;

  await Deno.writeTextFile(integrationFilePath, integrationFileContent);
  await Deno.writeTextFile(typesFilePath, typesFileContent);
  await Deno.writeTextFile(requestsFilePath, requestsFileContent);
  await Deno.writeTextFile(sandboxFilePath, sandboxFileContent);
  await Deno.writeTextFile(readmeFilePath, readmeFileContent);
  await Deno.writeTextFile(testsFilePath, testFileContent);
  await Deno.writeTextFile(zodSchemaFilePath, zodSchemaFileContent);
  console.log(`✅ Created: ${integrationFilePath}, don't forget to add the zod schema in the import/export inside zod-schemas/index.ts and the integration import the integration in the Chimera/integrations/index.js file`);
}

if (import.meta.main) {
  const parsed = parseArgs(Deno.args, {
    alias: {
      create: 'c',
      name: 'n',
      path: 'p',
    }
  });
  const command = parsed.create;

  if (command === "help") {
    console.log(`ℹ️ Usage: chimera-cli create sync --name=<integration_name> --path=<optional relative/path>`);
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
    console.log(`Invalid command, please use "chimera-cli --help" for more information`);
    Deno.exit(1);
  }
}
