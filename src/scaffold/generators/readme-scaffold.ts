export function generateReadmeFileContent(className: string, lowerCasedName: string): string {
  return `
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
}
