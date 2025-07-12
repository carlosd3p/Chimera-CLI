export function generateTypesFileContent(className: string, lowerCasedName: string): string {
    return `
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
}
