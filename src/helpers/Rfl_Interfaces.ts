
export type InputWrapperProps = {
    fieldname: string;
    fieldObject: IField;
    parent?: string;
    childIdx?: number;
    onCustomCallback?: any;
    data?: any;
}
export type IField = ITextField | INumberField | IDateField | IDropdownField | ISegment | ISwitch | IEmailField | IPasswordField | IRadioField | IAutocompleteField | ITextarea | ICheckbox
    | IRepeatableSection | IFileUploader | ICustomWidget;
export type LoadingParams = { [key: string]: boolean; };
export type LastChangedObjectProps = { obj: any, fieldname: string,  parent?: string };

export type IUncategorisedFiles  = { files: any[], meta?: {[key: string]: any} };
export type ICategorisedFiles = { [key: string] : IUncategorisedFiles };
export type IFileExtensions = "image/*" | ".pdf"; 
export type IAlertTypes = 'success' | 'error' | 'warning' | 'info';
export type IMessageAlert = { type: IAlertTypes, message: string };
export type IRflError = {isBlocking?: boolean, type?: IAlertTypes, message: string};
export type IFieldDataEmitter = { field: IField, fieldname: string, parent: string | undefined, value: any};
export type IWidgetProps = { value?: any, onChange: (value?: any) => void, options?: any};

export interface IStepsProps {
    direction?: 'horizontal' | 'vertical';
    progressDot?: boolean;
    items: {title: string, description?: string}[];
}
export interface IListOptions {
    value: string | number;
    label: string;
}
export interface IValidationPattern {
    type: string;
    pattern: string;
}
export interface ILocalSelect extends ISelect {
    sourcetype: 'LOCAL',
    values: any[],
}
export interface IRemoteSelect extends ISelect {
    sourcetype: 'REMOTE',
    url: string
}
export interface ISelect {
    datatype: 'string' | 'object',
    valuefield: string,
    labelfield: string,
    dependencies?: string[],
    oneOf?: { [value: string]: IFormSection}
    multi?: boolean,
    authorized?: boolean,
    columns?: number,
    options?: IListOptions[]
}
export interface IFileCategory {
    code: string, 
    label: string,
    allowedExtensions?: IFileExtensions[],
    required?: boolean,
    meta?: IField[]
}
export interface ICategorisedFileExtra  {
    multi?: boolean,
    allowedExtensions?: IFileExtensions[],
    valuefield: string,
    labelfield: string,
    categories: IFileCategory[],
    dependencies?: []
}
export interface IUncategorisedFileExtra {
    multi?: boolean,
    allowedExtensions?: IFileExtensions[],
    meta?: IField[],
    dependencies?: []
}
export interface IStepsMeta {
    title?: string,
    description?: string,
    icon?: string
}
export interface IStyles {
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    elementHeight?: number;
    fontSize?: number;
    borderColor?: string;
}


export interface FormBuilderHandle {
    setRflStatus: (msg: IMessageAlert) => void;
}
export interface IFormBuilderSchema {
    formschema:IFormSchema
    data?: any;
    onFormSubmit: any;
    onFormChange: any;
    layout?: 'horizontal' | 'vertical';
    primaryButtonTitle?: string;
    extraButtons?: string[];
    styles?: IStyles;
    authToken?: string;
    widgets?: { [key: string] : React.FC<IWidgetProps> };
}
export interface IFormSchema {
    type: 'FORM',
    stepped?: boolean,
    extra?: { dotSteps?: boolean, direction?: 'vertical' | 'horizontal', activeSteps?: boolean},
    sections: IFormSection[],
}

export interface IFormSection {
    steps?: IStepsMeta;
    name?: string;
    subheader?: string;
    fieldLayout: 'ROW' | 'COLUMN';
    fields: { [key: string]: IField };
    columns?: number;
}
export interface IProductFields {
    label: string;
    name: string;
    defaultOperator?: 'CONTAINS' | 'IN' | 'EQ';
    required?: boolean;
    rowIndex?: number;
    repeatable?: boolean;
}






// field types interfaces *****************************************************************************************

export interface ITextField extends IProductFields {
    fieldType: 'TEXT',
    extra?: IExtraPropsCommon
}
export interface IEmailField extends IProductFields {
    fieldType: 'TEXT',
    extra: IExtraPropsEmail
}
export interface ITextarea extends IProductFields {
    fieldType: 'TEXTAREA'
    extra?: IExtraPropsCommon
}
export interface IPasswordField extends IProductFields {
    fieldType: 'PASSWORD',
    extra: IExtraPropsCommon
}
export interface INumberField extends IProductFields {
    fieldType: 'NUMBER',
    extra: { rules: { type: 'number'; min: number; max: number; }, dependencies?: []}
}
export interface IDateField extends IProductFields {
    fieldType: 'DATE',
    extra: { range?: boolean, min?: string, max?: string, picker?: 'year' | 'month' | 'week', dependencies?: [] }
}
export interface IDropdownField extends IProductFields {
    fieldType: 'DROPDOWN',
    extra: ILocalSelect | IRemoteSelect
}
export interface IRadioField extends IProductFields {
    fieldType: 'RADIO',
    extra: ILocalSelect | IRemoteSelect,
    optiontype?: 'button'
}
export interface IAutocompleteField extends IProductFields {
    fieldType: 'AUTOCOMPLETE',
    extra: ILocalSelect | IRemoteSelect,
}
export interface ICheckbox extends IProductFields {
    fieldType: 'CHECKBOX',
    extra: ILocalSelect | IRemoteSelect,
}
export interface ISwitch extends IProductFields {
    fieldType: 'SWITCH',
    extra?: { dependencies?: [], oneOf?: { [value: string]: IFormSection}}
}
export interface ISegment extends IProductFields {
    fieldType: 'SEGMENT',
    extra: ILocalSelect | IRemoteSelect,
}
export interface IRepeatableSection extends IProductFields {
    fieldType: 'NESTED',
    section: IFormSection,
    extra: IExtraPropsCommon
}
export interface IFileUploader extends IProductFields {
    fieldType: 'FILE',
    extra: ICategorisedFileExtra | IUncategorisedFileExtra
}
export interface ICustomWidget extends IProductFields {
    fieldType: 'WIDGET',
    extra: IExtraPropsCommon
}




// extra props interfaces *****************************************************************************************
export interface IExtraPropsCommon extends IRemoteVerifcationProps{
    dependencies?: string[];
    rules?: IValidationPattern;
}
export interface IExtraPropsEmail extends IRemoteVerifcationProps {
    rules: { type: 'email'};
    dependencies?: [];
} 




export interface IRemoteVerifcationProps {
    verificationNeeded?: boolean;
    // verificationUrl?: string;
    // verificationAuthorized?: boolean;
    // verificationQuestion?: string;
}
