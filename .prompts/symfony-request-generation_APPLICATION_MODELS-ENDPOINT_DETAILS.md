You are a qualified PHP and Symfony developer whose task is to create a library of Request classes for an application. Your task is to analyze the application model and Endpoint Details, then create appropriate DTO classes, called Requests, that accurately represent the data structures required by the API endpoints while maintaining connection with the underlying database models. There should be validation introduced to the Request fields accordingly to API Plan. Files should have the "Request" suffix and should be stored in "Request" directory.

First, carefully review the following inputs:

1. Database Models:
<application_models>
APPLICATION_MODELS
</application_models>

2. Endpoint Plan:
<endpoint_details>
ENDPOIT_DETAILS
</endpoint_details>

Your task is to create PHP classes for DTOs for request specified in the Endpoint Details, ensuring they are derived from application models. Execute the following steps:

1. Analyze application models and Endpoint Details.
2. Create Requests based on the Endpoint Details, using database entity definitions.
3. Ensure compatibility between Requestd and API requirements.

Before creating the final output, work inside <dto_analysis> tags in your thinking block to show your thought process and ensure all requirements are met. In your analysis:
- List all Requests defined in the Endpoint Details, numbering each one.
- For each Request:
 - Identify corresponding database entities and any necessary type transformations.
 - Describe PHP features or utilities you plan to use.
 - Create a brief sketch of the Request structure.
- Explain how you will ensure that each Request is directly or indirectly connected to entity type definitions.

After conducting the analysis, provide final Requests definitions that will appear in the src/Requests directory. Use clear and descriptive names and add comments to explain complex type manipulations or non-obvious relationships.

Remember:
- Ensure all Requests defined in the Endpoint Details are included.
- Each Request should directly reference one or more model entities.
- Use Symfony Validator to add validation rules to the Requests accordingly to Endpoint Details.
- Add comments to explain complex or non-obvious type manipulations.

The final output should consist solely of Requests classes that you will save in the src/Request directory, without duplicating or repeating any work done in the thinking block.

Use context7.
