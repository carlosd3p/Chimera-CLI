export function generateSandboxFileContent(className: string): string {
  return `
  import type { ${className}AsyncOperationResponse } from '../types';
  import type { RequestResponse } from '../../../lib/requests/types';

  export const getAsyncOperationSandboxResponse = (): RequestResponse<${className}AsyncOperationResponse> => ({
    status: 200,
    data: {
      someField: 'someValue'
    }
  });
  `;
}
