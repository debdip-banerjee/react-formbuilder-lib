import { Alert, AutoComplete } from "antd";
import { useContext, useEffect, useState } from "react";
import { Rfl_Utils } from "../helpers/Rfl_Utils";
import { Rfl_DataSource } from "../helpers/Rfl_DataSource";
import { IMessageAlert, IRflError } from "../helpers";
import { rfl_formContext } from "../pages";


const Rfl_AutoComplete = (props: any) => {
    const { _setMessageAlerts, authToken } = useContext(rfl_formContext);
    const [options, setOptions] = useState<any>([]);
    const [defaultOptions, setDefaultOptions] = useState<any>(null);
    const [dataLoading, _setLoading] = useState<boolean>(false);
    const [rfl_error, setRflError] = useState<IRflError | null>(null);

    const _handleRflError = (alert: IMessageAlert) => {
      _setMessageAlerts(alert);
      setRflError({isBlocking: true, type: alert.type, message: alert.message});
    }

    const _setDefaultAttrs = () => {
      let d: any = {};
      d['defaultValue'] = props.value;
      setDefaultOptions(d);
    }
    const _getLocalOptions = (text: string) => {
      let dataset = props.obj.extra.values ? props.obj.extra.values : options;
      let opt: any;
      let type = Rfl_Utils.checkType(dataset[0]);
      if (type === 'Object') {
        if (props.obj.extra.labelfield && props.obj.extra.valuefield) {
          opt = dataset.filter((el: any) => el[props.obj.extra.labelfield].toLowerCase().includes(text.toLowerCase()));
        } else {
            let alert: IMessageAlert = { type: 'error', message: `"valuefield" & "labelfield" properties are required for field ${props.obj.label}`};
            _handleRflError(alert);
            return;
        }
      }
      else if (type === 'String') opt = dataset.filter((el: any) => el.toLowerCase().includes(text.toLowerCase()));
      let transformRes = Rfl_Utils._transformOptions(opt, props.obj.extra?.valuefield, props.obj.extra?.labelfield, props.obj.label);
      if (transformRes.error) _handleRflError(transformRes.error);
      else setOptions(transformRes);
    }
    const _getRemoteOptions = (text: string) => {
      let err = Rfl_Utils._hasPreAPICallError(props.obj, authToken);
      if (err) {
          _handleRflError(err as IMessageAlert);
          return [];
      }
      _setLoading( true);
      Rfl_DataSource._fetchRemoteData(props.obj.extra.url, [text], props.obj.extra.authorized, authToken, true).then((data: any) => {
        let transformRes = Rfl_Utils._transformOptions(data, props.obj.extra.valuefield, props.obj.extra.labelfield, props.obj.label);
        if (transformRes?.error) _handleRflError(transformRes.error);
        else setOptions(transformRes ? transformRes : []);
        _setLoading(false);
      });
    }

    const getPanelValue = (text: string) => {
      if (text.length > 2) {
        props.obj.extra.sourcetype === 'LOCAL' ? _getLocalOptions(text) : _getRemoteOptions(text);
      } else {
        setOptions([]);
      }
    }

    const _onInputSelect = (a: any, b: any) => {
      let val = options.find((el: any) => el.value === b).label;
      props.onInputChange(val);
    }

    useEffect(() => {
      _setDefaultAttrs();
    }, [props.obj]);
    
    return (
      <>
        {
          rfl_error &&
          <Alert message={rfl_error.message} type="error" showIcon closable={rfl_error.isBlocking ? false : true}/>
        }
        {
          defaultOptions && !rfl_error &&
          <AutoComplete
            options={options}
            {...defaultOptions}
            // onChange={(e) => _onChange(e)}
            onSelect={(e) => _onInputSelect(props, e)}
            onSearch={(text) => getPanelValue(text)}
            placeholder="Type here.."
          />
        }
        {
          dataLoading && 
          <>
            <div style={{color: '#20de17'}}>{props.obj.label} data loading...</div>
          </>
          
        }
      </>
      
    );
}


export default Rfl_AutoComplete;