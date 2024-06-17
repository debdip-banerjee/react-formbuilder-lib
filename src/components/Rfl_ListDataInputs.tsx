import { useContext, useEffect, useState } from "react";
import { IField, IListOptions, IMessageAlert, IRflError, LoadingParams } from "../helpers/Rfl_Interfaces";
import { rfl_formContext } from "../pages";
import { Alert, Checkbox, Col, Radio, Row, Segmented, Select, Skeleton } from "antd";
import { Rfl_Utils } from "../helpers/Rfl_Utils";
import { Rfl_DataSource } from "../helpers/Rfl_DataSource";


const Rfl_ListDataInputs = ({ fieldname, obj, onInputChange, parent}: any) => {
    const { fieldType, extra } = obj;
    const [options, setOptions] = useState<IListOptions[]>([]);
    const { dataFormat, lastChangedObject, _isDisabledField, _setMessageAlerts, authToken } = useContext(rfl_formContext);
    const [defaultOptions, setDefaultOptions] = useState<any>(null);
    const [dependencyLoading, setDependencyLoading] = useState<LoadingParams>({});
    const [rfl_error, setRflError] = useState<IRflError | null>(null);

    const _handleRflError = (alert: IMessageAlert) => {
      _setMessageAlerts(alert);
      setRflError({isBlocking: true, type: alert.type, message: alert.message});
    }

    const setLoading = (field:string, f: boolean, parent?: string | null) => {
        if (parent) field = `${parent}.${field}`;
        let loadingObj = {[field]: f};
        setDependencyLoading(prevState => ({ ...prevState, ...loadingObj }));
    }

    const _setDefaultAttrs = () => {
      let d: any = {};
      d['defaultValue'] = parent ?  (dataFormat[parent] ? dataFormat[parent][fieldname] : null) : dataFormat[fieldname];
      if (extra.optiontype) d['optionType'] = extra.optiontype;
      setDefaultOptions(d);
    }

    const _getPlacholder = () => {
      return `select ${obj.label}`;
    }

    const _loadOptions = async () => {
        setLoading(fieldname, true, parent);
        let values = await _getOptionsData(obj, parent);
        setOptions(() => values);
        setLoading(fieldname, false, parent);
    }

    

    const _getOptionsData = async (fieldObject: IField, parent?: string | null) => {
        let d;
        if (fieldObject.extra?.dependencies && fieldObject.extra.dependencies.length > 0 && !Rfl_Utils._hasAllDependencyDataCaptured(fieldObject, dataFormat, parent)) {
          return [];
        }
        let err = Rfl_Utils._hasPreAPICallError(fieldObject, authToken);
        if (err) {
            _handleRflError(err as IMessageAlert);
            return [];
        }
        else d = await Rfl_DataSource._fetchOptionsData(fieldObject, dataFormat, parent, authToken);

        if (!d) return _handleRflError({type: 'success', message: 'No data found !'});
        if (d.error) {
            _handleRflError(d.error);
            return [];
        }
        setRflError(null);
        return d;
    }
    const _isDependencyLoading = () => {
        let dependencyLoadingParam = parent ? `${parent}.${fieldname}` : fieldname;
        return dependencyLoading ? dependencyLoading[dependencyLoadingParam] : false;
    }

    const _isCurrentDependencyLastChanged = () => {
        // check if last changed object field or parent matches the current dependency array
        if (!lastChangedObject) return false;
        if (lastChangedObject.parent !== parent) return false; // check if parent of last changed object is the same as the current parent

        let dep = lastChangedObject.fieldname;
        return extra.dependencies?.includes(dep);
    }

    useEffect(() => {
        let flag = _isCurrentDependencyLastChanged();
        if (lastChangedObject && extra.dependencies?.length > 0 && flag)
            _loadOptions();
    }, [dataFormat, lastChangedObject])

    useEffect(() => {
        _setDefaultAttrs();
        if (extra) {
            _loadOptions();
        }
    }, [extra, obj])


    return (
        <>  
            {
                rfl_error &&
                <Alert message={rfl_error.message} type={rfl_error.type ? rfl_error.type : "error"} showIcon closable={rfl_error.isBlocking ? false : true}/>
            }
            {
              obj && _isDependencyLoading() && 
              <>
                {/* <div style={{color: '#20de17'}}>{obj.label} data loading...</div> */}
                <Skeleton.Input active={true} block={true}/>
              </>
            }
            {
                options && defaultOptions && !_isDependencyLoading() && !rfl_error &&
                <>
                    {
                        fieldType === 'DROPDOWN' &&
                        <Select 
                            mode={extra?.multi ? "multiple" : undefined}
                            disabled={_isDisabledField(obj, parent)} 
                            allowClear
                            options={options} 
                            {...defaultOptions}
                            placeholder={_getPlacholder()}
                            optionLabelProp={extra?.labelfield}
                            onChange={(e) => onInputChange(e)} />
                    }
                    {
                        fieldType === 'SEGMENT' &&
                        (
                            <Segmented
                                options={options} 
                                disabled={_isDisabledField(obj, parent)} 
                                {...defaultOptions} 
                                onChange={onInputChange}/>
                        )
                    }
                    {
                        fieldType === 'RADIO' &&
                        (
                            extra.optiontype === 'button' ?
                            <Radio.Group 
                                options={options} 
                                disabled={_isDisabledField(obj, parent)} 
                                {...defaultOptions} 
                                onChange={onInputChange} 
                                buttonStyle="solid"/>
                            :
                            <Radio.Group 
                                {...defaultOptions} 
                                style={{ width: '100%' }} 
                                disabled={_isDisabledField(obj, parent)} 
                                onChange={onInputChange}>
                                <Row>
                                    {
                                        options.map((option: any, idx: number) => {
                                            return (
                                                <Col span={Rfl_Utils._getFieldOptionsColumnCount(extra?.columns)} key={idx}>
                                                    <Radio value={option.value}>{option.label}</Radio>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            </Radio.Group>
                        )
                    }
                    {
                        fieldType === 'CHECKBOX' && 
                        <Checkbox.Group {...defaultOptions} style={{ width: '100%' }} onChange={onInputChange}>
                            <Row>
                                {
                                    options.map((option: any, idx: number) => {
                                        return (
                                            <Col span={Rfl_Utils._getFieldOptionsColumnCount(extra?.columns)} key={option.value+idx}>
                                                <Checkbox value={option.value}>{option.label}</Checkbox>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        </Checkbox.Group>
                    }
                </>
            }
        </>
    );
}

export default Rfl_ListDataInputs;