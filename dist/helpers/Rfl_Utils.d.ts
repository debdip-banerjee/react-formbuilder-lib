import { BehaviorSubject } from "rxjs";
import { IDropdownField, IMessageAlert, LoadingParams } from "./Rfl_Interfaces";
export declare const loaderSubject: BehaviorSubject<LoadingParams>;
export declare class Rfl_Utils {
    static convertMomentToEpochSeconds: (e: any) => number;
    static _hasListData: (obj: any) => boolean;
    static checkType: (data: any) => 'Number' | 'String' | 'Array' | 'Object' | 'Boolean' | 'Date' | 'null';
    static _hasAllDependencyDataCaptured: (obj: any, dataFormat: any, parent?: string | null) => boolean;
    static _getRule: (obj: any) => any[];
    static _getFieldOptionsColumnCount: (columns?: number) => number;
    static _hasPreAPICallError: (obj: any, authToken: string | null) => boolean | IMessageAlert;
    static _transformOptions: (data: any, valuefield: string, labelfield?: string, fieldLabel?: string) => any;
    static _transformRemoteOptions: (data: any, valuefield: string, labelfield?: string) => any;
    static _fetchDependencyParams: (obj: IDropdownField, dataFormat: any, parent?: string | null) => any;
}
