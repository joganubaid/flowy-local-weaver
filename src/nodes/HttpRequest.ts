import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData, INodeParameters } from '@/types/n8n';

export class HttpRequest implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'HTTP Request',
    name: 'httpRequest',
    icon: 'file:httprequest.svg',
    group: ['input'],
    version: [1, 2, 3, 4, 4.1, 4.2],
    description: 'Makes an HTTP request and returns the response data',
    defaults: {
      name: 'HTTP Request',
      color: '#2196F3',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'DELETE', value: 'DELETE' },
          { name: 'GET', value: 'GET' },
          { name: 'HEAD', value: 'HEAD' },
          { name: 'OPTIONS', value: 'OPTIONS' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
        ],
        default: 'GET',
        description: 'The request method to use',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'https://httpbin.org/get',
        description: 'The URL to make the request to',
        required: true,
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Basic Auth', value: 'basicAuth' },
          { name: 'Header Auth', value: 'headerAuth' },
          { name: 'OAuth1', value: 'oAuth1Api' },
          { name: 'OAuth2', value: 'oAuth2Api' },
          { name: 'Query Auth', value: 'queryAuth' },
        ],
        default: 'none',
        description: 'The way to authenticate',
      },
      {
        displayName: 'Query Parameters',
        name: 'queryParameters',
        placeholder: 'Add Parameter',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        description: 'The query parameters to send',
        default: {},
        options: [
          {
            name: 'parameter',
            value: 'parameter',
            displayName: 'Parameter',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the parameter',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the parameter',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Headers',
        name: 'headerParameters',
        placeholder: 'Add Header',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        description: 'The headers to send',
        default: {},
        options: [
          {
            name: 'parameter',
            value: 'parameter',
            displayName: 'Header',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the header',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the header',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Send Body',
        name: 'sendBody',
        type: 'boolean',
        default: false,
        description: 'Whether to send a body with the request',
        displayOptions: {
          show: {
            method: ['PATCH', 'POST', 'PUT'],
          },
        },
      },
      {
        displayName: 'Body Content Type',
        name: 'contentType',
        type: 'options',
        displayOptions: {
          show: {
            sendBody: [true],
          },
        },
        options: [
          {
            name: 'JSON',
            value: 'json',
          },
          {
            name: 'Form-Data Multipart',
            value: 'multipart-form-data',
          },
          {
            name: 'Form Encoded',
            value: 'form-urlencoded',
          },
          {
            name: 'Raw/Custom',
            value: 'raw',
          },
        ],
        default: 'json',
        description: 'Content-Type to use to send body',
      },
      {
        displayName: 'Body Parameters',
        name: 'bodyParameters',
        placeholder: 'Add Parameter',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            sendBody: [true],
            contentType: ['form-urlencoded'],
          },
        },
        description: 'The body parameter to send',
        default: {},
        options: [
          {
            name: 'parameter',
            value: 'parameter',
            displayName: 'Parameter',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the parameter',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the parameter',
              },
            ],
          },
        ],
      },
      {
        displayName: 'JSON/RAW Body',
        name: 'body',
        type: 'string',
        displayOptions: {
          show: {
            sendBody: [true],
            contentType: ['json', 'raw'],
          },
        },
        default: '',
        placeholder: '{"field1": "value", "field2": "value"}',
        description: 'Body to send as JSON or RAW',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Batch Interval',
            name: 'batchInterval',
            value: 'batchInterval',
            description: 'Time (in milliseconds) between each batch of requests. 0 = disabled.',
          },
          {
            displayName: 'Batch Size',
            name: 'batchSize',
            value: 'batchSize',
            description: 'Input will be split in batches to throttle requests. -1 = disabled, 0 = all at once.',
          },
          {
            displayName: 'Full Response',
            name: 'fullResponse',
            value: 'fullResponse',
            description: 'Whether to return the full response or only the body',
          },
          {
            displayName: 'Follow Redirect',
            name: 'followRedirect',
            value: 'followRedirect',
            description: 'Whether to follow redirects',
          },
          {
            displayName: 'Ignore SSL Issues',
            name: 'ignoreSSL',
            value: 'ignoreSSL',
            description: 'Whether to connect even if SSL certificate validation is not possible',
          },
          {
            displayName: 'Proxy',
            name: 'proxy',
            value: 'proxy',
            description: 'HTTP proxy to use',
          },
          {
            displayName: 'Split Into Items',
            name: 'splitIntoItems',
            value: 'splitIntoItems',
            description: 'Whether to output each element of an array as own item',
          },
          {
            displayName: 'Timeout',
            name: 'timeout',
            value: 'timeout',
            description: 'Time in milliseconds to wait for a response before failing the request',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const method = this.getNodeParameter('method', itemIndex) as string;
        const url = this.getNodeParameter('url', itemIndex) as string;
        const sendBody = this.getNodeParameter('sendBody', itemIndex, false) as boolean;
        const contentType = this.getNodeParameter('contentType', itemIndex) as string;
        const options = this.getNodeParameter('options', itemIndex, {}) as any;

        // Build query parameters
        const queryParameters = this.getNodeParameter('queryParameters.parameter', itemIndex, []) as any[];
        const qs: { [key: string]: string } = {};
        for (const parameter of queryParameters) {
          qs[parameter.name] = parameter.value;
        }

        // Build headers
        const headerParameters = this.getNodeParameter('headerParameters.parameter', itemIndex, []) as any[];
        const headers: { [key: string]: string } = {};
        for (const parameter of headerParameters) {
          headers[parameter.name] = parameter.value;
        }

        // Build request options
        const requestOptions: any = {
          method,
          url,
          qs,
          headers,
          json: contentType === 'json',
          timeout: options.timeout || 10000,
          followRedirect: options.followRedirect !== false,
          ignoreSSL: options.ignoreSSL === true,
          returnFullResponse: options.fullResponse === true,
        };

        // Add body if needed
        if (sendBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
          if (contentType === 'json' || contentType === 'raw') {
            const body = this.getNodeParameter('body', itemIndex, '') as string;
            if (contentType === 'json') {
              try {
                requestOptions.body = JSON.parse(body);
              } catch (error) {
                throw new Error(`Invalid JSON in body: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            } else {
              requestOptions.body = body;
            }
          } else if (contentType === 'form-urlencoded') {
            const bodyParameters = this.getNodeParameter('bodyParameters.parameter', itemIndex, []) as any[];
            const form: { [key: string]: string } = {};
            for (const parameter of bodyParameters) {
              form[parameter.name] = parameter.value;
            }
            requestOptions.form = form;
          }
        }

        // Make the request
        const response = await this.helpers.httpRequest(requestOptions);

        let responseData;
        if (options.fullResponse) {
          responseData = response;
        } else {
          responseData = response.body || response;
        }

        // Handle split into items option
        if (options.splitIntoItems && Array.isArray(responseData)) {
          for (const item of responseData) {
            returnData.push({
              json: item,
              pairedItem: { item: itemIndex },
            });
          }
        } else {
          returnData.push({
            json: responseData,
            pairedItem: { item: itemIndex },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error instanceof Error ? error.message : 'Unknown error' },
            pairedItem: { item: itemIndex },
          });
          continue;
        }
        throw error;
      }
    }

    return this.prepareOutputData(returnData);
  }
}