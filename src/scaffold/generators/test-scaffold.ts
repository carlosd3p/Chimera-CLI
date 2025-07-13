export function generateTestFileContent(className: string, lowerCasedName: string): string {
  return `
import type { SinonStub } from 'sinon';
import type { Credentials, Step1BuildRequestOptions, Step1ExecuteOptions } from '../types';
import type ${className} from '../${lowerCasedName}';
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
});`;
}
