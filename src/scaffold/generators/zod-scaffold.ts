export function generateZodSchemaFileContent(className: string, lowerCasedName: string): string {
  return `
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
}
