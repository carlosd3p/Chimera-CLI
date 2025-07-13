export function generateIntegrationFileContent(className: string): string {
  return `
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
}`;
}
