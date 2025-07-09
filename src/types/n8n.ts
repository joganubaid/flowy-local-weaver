export interface INodeExecutionData {
  json: any;
  binary?: IBinaryKeyData;
  pairedItem?: INodeExecutionDataPairedItem | INodeExecutionDataPairedItem[];
  error?: Error;
}

export interface IBinaryKeyData {
  [key: string]: IBinaryData;
}

export interface IBinaryData {
  data: string;
  mimeType: string;
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: number;
}

export interface INodeExecutionDataPairedItem {
  item: number;
  input?: number;
}

export interface IWorkflowExecuteAdditionalData {
  credentialsHelper: any;
  encryptionKey: string;
  executeWorkflow: Function;
  restApiUrl: string;
  instanceBaseUrl: string;
  formWaitingBaseUrl: string;
  webhookBaseUrl: string;
  webhookWaitingBaseUrl: string;
  webhookTestBaseUrl: string;
  currentNodeParameters?: any;
  executionTimeoutTimestamp?: number;
  userId?: string;
  variables: Record<string, any>;
}

export interface INodeParameters {
  [key: string]: any;
}

export interface INodeType {
  description: INodeTypeDescription;
  execute?(this: IExecuteFunctions, parameters: INodeParameters): Promise<INodeExecutionData[][]>;
  poll?(this: IPollFunctions, parameters: INodeParameters): Promise<INodeExecutionData[][]>;
  trigger?(this: ITriggerFunctions, parameters: INodeParameters): Promise<ITriggerResponse>;
  webhook?(this: IWebhookFunctions, parameters: INodeParameters): Promise<IWebhookResponseData>;
}

export interface INodeTypeDescription {
  displayName: string;
  name: string;
  icon?: string;
  group: string[];
  version: number | number[];
  description: string;
  subtitle?: string;
  defaults: {
    name: string;
    color?: string;
  };
  inputs: string[] | INodeInputConfiguration[];
  outputs: string[] | INodeOutputConfiguration[];
  outputNames?: string[];
  properties: INodeProperties[];
  credentials?: INodeCredentialsDescription[];
  requestDefaults?: any;
  polling?: boolean;
  triggerPanel?: any;
  webhooks?: IWebhookDescription[];
  translation?: any;
  maxNodes?: number;
  usableAsTool?: boolean;
}

export interface INodeProperties {
  displayName: string;
  name: string;
  type: NodePropertyTypes;
  required?: boolean;
  description?: string;
  default?: any;
  hint?: string;
  placeholder?: string;
  options?: INodePropertyOptions[];
  routing?: INodePropertyRouting;
  displayOptions?: IDisplayOptions;
  extractValue?: INodePropertyValueExtractor;
  validateType?: string;
  ignoreSSL?: boolean;
  typeOptions?: INodePropertyTypeOptions;
}

export type NodePropertyTypes = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'collection'
  | 'fixedCollection'
  | 'multiOptions'
  | 'options'
  | 'dateTime'
  | 'color'
  | 'hidden'
  | 'notice'
  | 'resourceLocator'
  | 'curlImport'
  | 'filter'
  | 'assignmentCollection'
  | 'code'
  | 'json'
  | 'credentialsSelect'
  | 'resourceMapper';

export interface INodePropertyOptions {
  name: string;
  value: string | number | boolean;
  description?: string;
  action?: string;
  routing?: INodePropertyRouting;
  displayName?: string;
  values?: INodeProperties[];
}

export interface IDisplayOptions {
  show?: { [key: string]: Array<string | number | boolean> };
  hide?: { [key: string]: Array<string | number | boolean> };
}

export interface INodePropertyRouting {
  operations?: INodePropertyRoutingOperations;
  output?: INodePropertyRoutingOutput;
  request?: INodePropertyRoutingRequest;
  send?: INodePropertyRoutingSend;
}

export interface INodePropertyRoutingOperations {
  [key: string]: INodePropertyRoutingOperation[];
}

export interface INodePropertyRoutingOperation {
  operation: string;
  resource?: string;
}

export interface INodePropertyRoutingOutput {
  maxResults?: number | string;
  propertyName?: string;
}

export interface INodePropertyRoutingRequest {
  method?: string;
  url?: string;
  headers?: { [key: string]: string };
  qs?: { [key: string]: string };
  body?: any;
  encoding?: string;
  returnFullResponse?: boolean;
  ignoreHttpStatusErrors?: boolean;
}

export interface INodePropertyRoutingSend {
  type?: string;
  property?: string;
  value?: string;
  propertyInDotNotation?: boolean;
}

export interface INodePropertyValueExtractor {
  type: string;
  property: string;
}

export interface INodePropertyTypeOptions {
  alwaysOpenEditWindow?: boolean;
  codeAutocomplete?: string;
  editor?: string;
  loadOptionsMethod?: string;
  loadOptionsDependsOn?: string[];
  maxValue?: number;
  minValue?: number;
  numberPrecision?: number;
  password?: boolean;
  rows?: number;
  showAlpha?: boolean;
  sortable?: boolean;
  expirable?: boolean;
  resourceMapper?: any;
  filter?: any;
  multipleValues?: boolean;
}

export interface INodeInputConfiguration {
  type: string;
  displayName?: string;
  required?: boolean;
  maxConnections?: number;
}

export interface INodeOutputConfiguration {
  type: string;
  displayName?: string;
}

export interface INodeCredentialsDescription {
  name: string;
  required?: boolean;
  displayOptions?: IDisplayOptions;
  testedBy?: string | ICredentialTestRequest;
}

export interface ICredentialTestRequest {
  request: IHttpRequestOptions;
  rules?: ICredentialTestRequestRule[];
}

export interface ICredentialTestRequestRule {
  type: 'responseSuccessBody' | 'responseErrorBody' | 'responseCode';
  properties: {
    key?: string;
    value?: any;
    message?: string;
  };
}

export interface IHttpRequestOptions {
  url?: string;
  method?: string;
  body?: any;
  headers?: { [key: string]: string };
  qs?: { [key: string]: string };
  useQuerystring?: boolean;
  encoding?: string;
  json?: boolean;
  timeout?: number;
  followRedirect?: boolean;
  followAllRedirects?: boolean;
  ignoreSSL?: boolean;
  proxy?: string;
  returnFullResponse?: boolean;
  resolveWithFullResponse?: boolean;
  simple?: boolean;
}

export interface IWebhookDescription {
  name: string;
  httpMethod: string | string[];
  responseMode?: WebhookResponseMode | string;
  path?: string;
  responseBinaryPropertyName?: string;
  responseContentType?: string;
  responsePropertyName?: string;
  restartWebhook?: boolean;
  isForm?: boolean;
  isFullPath?: boolean;
  hasMultipleOutputs?: boolean;
}

export type WebhookResponseMode = 'onReceived' | 'lastNode' | 'responseNode';

export interface IExecuteFunctions {
  getInputData(inputIndex?: number, inputName?: string): INodeExecutionData[];
  getNodeParameter(parameterName: string, itemIndex?: number, fallbackValue?: any, options?: IGetNodeParameterOptions): any;
  getCredentials(type: string, itemIndex?: number): Promise<any>;
  getExecuteData(): IExecuteData;
  continueOnFail(): boolean;
  evaluateExpression(expression: string, itemIndex: number): any;
  getContext(type: string): IContextObject;
  getInputSourceData(inputIndex?: number, inputName?: string): ISourceData;
  getMode(): WorkflowExecuteMode;
  getNode(): INode;
  getRestApiUrl(): string;
  getTimezone(): string;
  getExecutionId(): string;
  getWorkflow(): IWorkflowMetadata;
  getWorkflowDataProxy(itemIndex: number): IWorkflowDataProxyData;
  getWorkflowStaticData(type: string): any;
  prepareOutputData(outputData: INodeExecutionData[], outputIndex?: number): Promise<INodeExecutionData[][]>;
  putExecutionToWait(waitTill: Date): Promise<void>;
  sendMessageToUI(source: string | undefined, message: any): void;
  sendResponse(response: IExecuteResponsePromiseData): void;
  helpers: {
    httpRequest(requestOptions: IHttpRequestOptions): Promise<any>;
    httpRequestWithAuthentication(this: IAllExecuteFunctions, credentialsType: string, requestOptions: IHttpRequestOptions, additionalCredentialOptions?: IAdditionalCredentialOptions): Promise<any>;
    prepareBinaryData(binaryData: Buffer, fileName?: string, mimeType?: string): Promise<IBinaryData>;
    getBinaryDataBuffer(itemIndex: number, propertyName: string): Promise<Buffer>;
    returnJsonArray(jsonData: IDataObject | IDataObject[]): INodeExecutionData[];
    normalizeItems(items: INodeExecutionData | INodeExecutionData[]): INodeExecutionData[];
    constructExecutionMetaData(inputData: INodeExecutionData[], options: { itemData?: IPairedItemData | IPairedItemData[] }): NodeExecutionWithMetadata[];
  };
}

export interface IPollFunctions extends IExecuteFunctions {
  getExecuteTriggerFunctions(): ITriggerFunctions;
}

export interface ITriggerFunctions {
  emit(data: INodeExecutionData[][], responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
  emitError(error: Error, responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
  getCredentials(type: string): Promise<any>;
  getNode(): INode;
  getMode(): WorkflowExecuteMode;
  getNodeParameter(parameterName: string, fallbackValue?: any): any;
  getRestApiUrl(): string;
  getTimezone(): string;
  getWorkflow(): IWorkflowMetadata;
  getWorkflowStaticData(type: string): any;
  helpers: IExecuteFunctions['helpers'];
}

export interface IWebhookFunctions {
  getBodyData(): IDataObject;
  getHeaderData(): object;
  getInputData(): INodeExecutionData[];
  getNodeParameter(parameterName: string, fallbackValue?: any): any;
  getParamsData(): object;
  getQueryData(): object;
  getRequestObject(): any;
  getResponseObject(): any;
  getWebhookName(): string;
  prepareOutputData(outputData: INodeExecutionData[]): Promise<INodeExecutionData[][]>;
  nodeHelpers: IExecuteFunctions['helpers'];
}

export interface ITriggerResponse {
  closeFunction?: () => Promise<void>;
  manualTriggerFunction?: () => Promise<void>;
  manualTriggerResponse?: () => Promise<INodeExecutionData[][]>;
}

export interface IWebhookResponseData {
  workflowData?: INodeExecutionData[][];
  webhookResponse?: any;
  noWebhookResponse?: boolean;
}

export interface IGetNodeParameterOptions {
  extractValue?: boolean;
  rawExpressions?: boolean;
}

export interface IExecuteData {
  data: ITaskData;
  node: INode;
  source: ISourceData | null;
}

export interface ITaskData {
  startTime: number;
  executionTime: number;
  data?: ITaskDataConnections;
  error?: ExecutionError;
  source: Array<ISourceData | null>;
  executionStatus?: ExecutionStatus;
  metadata?: ITaskMetadata;
}

export interface ITaskDataConnections {
  [outputIndex: string]: INodeExecutionData[][];
}

export interface ISourceData {
  previousNode: string;
  previousNodeOutput: number;
  previousNodeRun: number;
}

export interface IContextObject {
  [key: string]: any;
}

export type WorkflowExecuteMode = 'cli' | 'error' | 'integrated' | 'internal' | 'manual' | 'retry' | 'trigger' | 'webhook';

export interface INode {
  id: string;
  name: string;
  typeVersion: number;
  type: string;
  position: [number, number];
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  continueOnFail?: boolean;
  parameters: INodeParameters;
  credentials?: INodeCredentials;
  webhookId?: string;
  color?: string;
}

export interface INodeCredentials {
  [credentialType: string]: {
    id: string;
    name?: string;
  };
}

export interface IWorkflowMetadata {
  id?: string;
  name?: string;
  active?: boolean;
}

export interface IWorkflowDataProxyData {
  [key: string]: any;
  $binary: any;
  $data: any;
  $env: any;
  $evaluateExpression: Function;
  $item: Function;
  $items: Function;
  $json: any;
  $node: any;
  $parameter: any;
  $position: any;
  $workflow: any;
  $vars: any;
}

export interface IExecuteResponsePromiseData {
  data?: INodeExecutionData[][];
  error?: ExecutionError;
}

export interface IDeferredPromise<T> {
  promise(): Promise<T>;
  resolve(data: T): void;
  reject(error: Error): void;
}

export interface IDataObject {
  [key: string]: any;
}

export interface IPairedItemData {
  item: number;
  input?: number;
  sourceOverwrite?: ISourceData;
}

export interface NodeExecutionWithMetadata {
  json: IDataObject;
  binary?: IBinaryKeyData;
  pairedItem: IPairedItemData | IPairedItemData[];
  error?: ExecutionError;
}

export interface IAdditionalCredentialOptions {
  oauth2TokenType?: 'Bearer' | 'Basic';
}

export interface IAllExecuteFunctions {
  // Common methods from all interfaces
  getNode(): INode;
  getMode(): WorkflowExecuteMode;
  getRestApiUrl(): string;
  getTimezone(): string;
  getWorkflow(): IWorkflowMetadata;
  getWorkflowStaticData(type: string): any;
  helpers: IExecuteFunctions['helpers'];
  
  // Execute specific
  getInputData?(inputIndex?: number, inputName?: string): INodeExecutionData[];
  getNodeParameter?(parameterName: string, itemIndex?: number, fallbackValue?: any, options?: IGetNodeParameterOptions): any;
  getCredentials?(type: string, itemIndex?: number): Promise<any>;
  continueOnFail?(): boolean;
  evaluateExpression?(expression: string, itemIndex: number): any;
  
  // Webhook specific  
  getBodyData?(): IDataObject;
  getHeaderData?(): object;
  getParamsData?(): object;
  getQueryData?(): object;
  getRequestObject?(): any;
  getResponseObject?(): any;
  getWebhookName?(): string;
  
  // Trigger specific
  emit?(data: INodeExecutionData[][], responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
  emitError?(error: Error, responsePromise?: IDeferredPromise<IExecuteResponsePromiseData>): void;
}

export type ExecutionError = {
  name?: string;
  message: string;
  description?: string;
  context?: any;
  cause?: Error | ExecutionError;
  node?: INode;
  functionality?: 'configuration-node' | 'regular-node' | 'credential';
  itemIndex?: number;
  lineNumber?: number;
  runIndex?: number;
  stack?: string;
  timestamp?: number;
  extra?: {
    [key: string]: any;
  };
};

export type ExecutionStatus = 'canceled' | 'crashed' | 'error' | 'new' | 'running' | 'success' | 'unknown' | 'waiting';

export interface ITaskMetadata {
  subRun?: Array<{
    node: string;
    runIndex: number;
  }>;
}