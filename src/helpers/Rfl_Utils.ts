import { BehaviorSubject } from "rxjs";
import { IDropdownField, IMessageAlert, LoadingParams } from "./Rfl_Interfaces";
import { Rfl_FallbackRules } from "./Rfl_FallbackFieldRules";


const ListDataFields = ['DROPDOWN', 'CHECKBOX', 'RADIO'];
export const loaderSubject = new BehaviorSubject<LoadingParams>({});

export class Rfl_Utils {
    public static convertMomentToEpochSeconds = (e: any): number => {
        return (new Date(e.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")).getTime())/1000;
    }
    public static _hasListData = (obj: any) => {
        return ListDataFields.includes(obj.fieldType);
    }
    public static checkType = (data: any): 'Number' | 'String' | 'Array' | 'Object' | 'Boolean'| 'Date' | 'null' => {
      return data ? data.constructor.name : null;
    }
    public static _hasAllDependencyDataCaptured = (obj: any, dataFormat: any, parent?: string | null) => {
        let isMet = true;
        if (obj.extra?.dependencies) {
          obj.extra.dependencies.forEach((dep: any) => {
            if (parent)
              if (!dataFormat[parent] || (dataFormat[parent] && !dataFormat[parent][dep])) isMet = false;
              else isMet = true;
            else if (!dataFormat[dep]) isMet = false;
          });
        }
        return isMet;
    }
    public static _getRule = (obj: any) => {
      let rules : any[] = [];
      if (obj.required)
        rules.push({ required: obj.required, message: `Please input valid ${obj.label}!` });
      if (obj.extra?.rules && Rfl_Utils.checkType(obj.extra.rules) === 'Array') {
        rules = [...rules, ...obj.extra.rules];
      }
      if (obj.fieldType === 'DATE' && obj.extra?.picker) {}
      else {
        let fallbackRules = Rfl_FallbackRules[obj.fieldType];
        if (fallbackRules) {
          rules = [...rules, ...fallbackRules];
        }
      }
      return rules;
    }
    public static _getFieldOptionsColumnCount = (columns?: number) => {
        let col = columns ? columns : 3;
        return (24/col);
    }
    public static _hasPreAPICallError = (obj: any, authToken: string | null): boolean | IMessageAlert => {
      if (obj.extra?.sourcetype === 'REMOTE') {
          if (!obj.extra.url) {
              let alert: IMessageAlert = { type: 'error', message: `Field "${obj.label}" should have "url" property for remote data!`};
              return alert;
          }
          if (obj.extra?.authorized && !authToken) {
              let alert: IMessageAlert = { type: 'error', message: `Field "${obj.label}" requires authorization! Auth token is missing!`};
              return alert;
          }
          return false;
      }
      return false;
    }

    
    

    public static _transformOptions = (data: any, valuefield: string, labelfield?: string, fieldLabel?: string) => {
      if (Rfl_Utils.checkType(data[0]) === 'String') return data.map((el: any) => ({ value: el, label: el }));
      if (Rfl_Utils.checkType(data[0]) === 'Object') {
        if (valuefield && labelfield)
          return Rfl_Utils._transformRemoteOptions(data, valuefield, labelfield);
        else {
          let postfix: string = fieldLabel ? fieldLabel : ' with "object" type data!';
          let alert: IMessageAlert = { type: 'error', message: `"valuefield" & "labelfield" properties are required for field ${postfix}`};
          return { error: alert };
        }
      }
    }
    public static _transformRemoteOptions = (data: any, valuefield: string, labelfield?: string) => {
      data?.forEach((obj: any) => {
        obj['value'] = obj[valuefield];
        if (labelfield) obj['label'] = obj[labelfield];
      });
      return data ? data : [];
    }

    public static _fetchDependencyParams = (obj: IDropdownField, dataFormat: any, parent?: string | null) => {
        let params: any = [];
        obj.extra?.dependencies?.forEach((dep: any) => {
          if (parent && dataFormat[parent][dep]) params.push(dataFormat[parent][dep]);
          else if (dataFormat[dep]) params.push(dataFormat[dep]);
        });
        if (params.length === 0 || params.length !== obj.extra?.dependencies?.length) return null;
        return params;
    }
}