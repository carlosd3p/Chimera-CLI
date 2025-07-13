export function generateRequestsFileContent(className: string, lowerCasedName: string): string {
  return `
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
      url: "\`\${baseUrl}/users/1\`",
      headers
    },
    sandboxResponse: getUserProfileSandboxResponse()
  } satisfies MakeRequestOptions<${className}AsyncOperationResponse>;
};`;
}
