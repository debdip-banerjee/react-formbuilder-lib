import { debounce } from "lodash";
import { Rfl_Utils } from "./Rfl_Utils";
import { IMessageAlert } from "./Rfl_Interfaces";

let headers = new Headers();
// const config = { key: 'Authorization', token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfZW1haWwiOiJkZWJzLmRpcEBnbWFpbC5jb20ifSwiZXhwIjoxNzEzMzYzNjE5fQ.A6DWN_3NceEBVH3f_kF5C0d0yB0KpptR-tnhq5JoGvk"}

let requestOptions: any = {
 method: 'GET',
 headers: headers
};


export class Rfl_DataSource {

    private static _fetchApiData = async (url: string, isAuthorized?: boolean, authToken?: string | null) => {
        let d: any;
        let options = {...requestOptions};
        if (isAuthorized && authToken) {
            options = { ...requestOptions, headers: { ...requestOptions.headers, 'Authorization': `Bearer ${authToken}` } };
        }
        d = await fetch(url, options).then(response => response.json()).then((data: any) => {
            return data;
        });
        return d;
    }
    private static _extractLocalOptions = async (obj: any) => {
        if (obj.extra?.datatype === 'object') {
            return Rfl_Utils._transformOptions(obj.extra.values, obj.extra.valuefield, obj.extra.labelfield, obj.label);
        } else {
            if (obj.extra?.values && Rfl_Utils.checkType(obj.extra.values[0]) === 'String') 
                return obj.extra.values.map((el: any) => ({label: el, value: el}));
            else {
                let alert: IMessageAlert = { type: 'error', message: `Field "${obj.label}" should have "datatype" set to "object"!`};
                return { error: alert };
            }
        }
    }
    private static _getRemoteOptions = async (obj: any, params:any, authToken?: string | null, debounce?: boolean) => {
        let url = obj.extra.url;
        let authorized = obj.extra.authorized ? obj.extra.authorized : false;
        return await this._fetchRemoteData(url, params, authorized, authToken, debounce);
    }

    private static debouncedFetch: any = debounce((url: string, authorized:boolean, authToken: string, callback: any) => {
        this._fetchApiData(url, authorized, authToken)
        .then((data: any) => callback(null, data))
        .catch((error: any) => callback(error));
    }, 300);

    public static _fetchRemoteData = async (url: string, params?: string[] | null, authorized?: boolean, authToken?: string | null, setDebounce: boolean = false) => {
        params?.forEach((param: string, idx: number) => {
            let strToReplace = '${param'+(idx+1)+'}';
            url = url.replace(strToReplace, param);
        });
        if (setDebounce) {
            return new Promise<any>((resolve, reject) => {
                this.debouncedFetch(url, authorized, authToken, (err: any, result: any) => {
                    if (err) {
                        alert('Error fetching data');
                    } else {
                        resolve(result.payload);
                    }
                });
            });
        } else {
            return new Promise<any>((resolve, reject) => {
                this._fetchApiData(url, authorized, authToken).then((data: any) => {
                    resolve(data.payload);
                })
            });
        }
    }



    public static _fetchOptionsData = async (obj: any, dataFormat: any, parent?: string | null, authToken?: string | null) => {
        let params: any = null;
        if (obj.extra?.dependencies && obj.extra.dependencies.length > 0) {
            params = Rfl_Utils._fetchDependencyParams(obj, dataFormat, parent);
        }
        if (obj.extra?.sourcetype === 'REMOTE') {
            let res = await this._getRemoteOptions(obj, params, authToken);
            return Rfl_Utils._transformOptions(res, obj.extra.valuefield, obj.extra.labelfield, obj.label);
        } else {
            return await this._extractLocalOptions(obj);
        }
    }
}