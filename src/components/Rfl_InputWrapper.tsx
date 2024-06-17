import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { IFormSection, IMessageAlert, IWidgetProps, InputWrapperProps } from "../helpers/Rfl_Interfaces";
import { rfl_formContext } from "../pages";
import { Form, Input, InputNumber, Switch } from "antd";
import {Rfl_DatePicker, Rfl_AutoComplete, Rfl_RepeatableSection, Rfl_NestedSection, Rfl_FileUploader, Rfl_SectionLayout} from "../components";
import Rfl_ListDataInputs from "./Rfl_ListDataInputs";
import { Rfl_Utils } from "../helpers";



const Rfl_InputWrapper: React.FC<InputWrapperProps> = ({fieldObject, fieldname, parent, childIdx, onCustomCallback}) => {

    const { widgets, _onChange, _onBlur, _isDisabledField, oneOfSections, _checkAndUpdateOneOfFields, dataFormat, _setMessageAlerts } = useContext(rfl_formContext);
    const [ tempSection, setTempSection] = useState<IFormSection | null>(null);
    const [ fieldObj ] = useState<any>(fieldObject);
  
    const _onInputChange = (e: any) => {
      let data = null;
      if (e)
        switch (fieldObject.fieldType) {
            case 'DATE':
            case 'NUMBER':
            case 'DROPDOWN':
            case 'AUTOCOMPLETE':
            case 'CHECKBOX':
            case 'SEGMENT':
            case 'SWITCH':
            case 'FILE':
                data = e;
                break;
            default:
                data = e.target.value;
                break;
        }
      if (onCustomCallback) onCustomCallback(data);
      else _onChange(data, fieldname, fieldObject, parent, childIdx);
    }

    const _onInputBlur = (e: any) => {
      _onBlur(e.target.value, fieldname, fieldObj, parent);
    }

    const _verifyField = (e: SyntheticEvent) => {
      e.stopPropagation();
      let val = parent && dataFormat[parent][fieldname] ? dataFormat[parent][fieldname] : dataFormat[fieldname];
      if (val && val !== '')
        _onInputBlur({target:{value: val}});
      else {
        let notif : IMessageAlert = { message: `Please enter some value to verify!`, type: 'error'}
        _setMessageAlerts(notif);
      }
    }

    useEffect(() => {
      if (oneOfSections[fieldname]) {
        setTempSection(oneOfSections[fieldname]);
      }
    }, [oneOfSections, fieldname]);

    useEffect(() => {
      if (dataFormat)
      _checkAndUpdateOneOfFields(dataFormat, fieldObject, fieldname, parent);
    }, [dataFormat]);

    const _getFormItemName = () => {
      return parent ? [ parent , fieldname ] : fieldname;
    }





    const _renderSwitch = (ftype: string) => {
      switch(ftype) {
        case 'NESTED':
          return (
            <>
              { fieldObject.repeatable ? <Rfl_RepeatableSection obj={fieldObject} fieldname={fieldname}/> : <Rfl_NestedSection obj={fieldObject} fieldname={fieldname}/> }
            </>
          );
        case 'WIDGET':
          const WidgetComponent = widgets[fieldname];
          const _onWidgetInputChange = (e: any) => {
            _onChange(e, fieldname, fieldObj);
          }
          return (
            <>{
                WidgetComponent ? 
                  <WidgetComponent options={fieldObj.extra?.values} onChange={_onWidgetInputChange}/>
                : <div>No widget found!</div>
            }</>
          );
        default:
          return (
          <Form.Item 
              id={parent ? (parent + fieldname + childIdx) : fieldname}
              label={fieldObj.label ? fieldObj.label : fieldname}
              name={childIdx!=null ? [ childIdx ,fieldname ] : _getFormItemName()}
              key={parent ? (parent + fieldname + childIdx) : fieldname}
              rules={Rfl_Utils._getRule(fieldObject)}
              >
                {
                  fieldObject.fieldType ?
                  <>
                    { fieldObject.fieldType === 'PASSWORD' && <Input.Password disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/> }
                    { fieldObject.fieldType === 'TEXTAREA' && <Input.TextArea disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/> }
                    { fieldObject.fieldType === 'DATE' && <Rfl_DatePicker obj={fieldObject} onInputChange={_onInputChange}/> }
                    { fieldObject.fieldType === 'NUMBER' && <InputNumber style={{width: '100%'}} disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/>}
                    { fieldObject.fieldType === 'FILE' && <Rfl_FileUploader obj={fieldObject} fieldname={fieldname} onInputChange={_onInputChange}/>}
                    { fieldObject.fieldType === 'AUTOCOMPLETE' && <Rfl_AutoComplete obj={fieldObject} fieldname={fieldname} parent={parent} onInputChange={_onInputChange}/>}
                    { fieldObject.fieldType === 'SWITCH' && <Switch onChange={_onInputChange} />}

                    { (fieldObject.fieldType === 'DROPDOWN' || fieldObject.fieldType === 'CHECKBOX' || fieldObject.fieldType === 'RADIO' || fieldObject.fieldType === 'SEGMENT') &&
                      <Rfl_ListDataInputs obj={fieldObject} fieldname={fieldname} parent={parent} onInputChange={_onInputChange}/>
                    }
                    </>
                  : <Input onChange={_onInputChange} onBlur={_onInputBlur}/>
                }
            </Form.Item>
          );
      }
    }


  
    return (
        <>   
            { fieldObject && fieldname && _renderSwitch(fieldObject.fieldType)} 
            {/* {
              fieldObject && fieldObject.fieldType === 'NESTED' && 
              <>
                  { fieldObject.repeatable ? <Rfl_RepeatableSection obj={fieldObject} fieldname={fieldname}/> : <Rfl_NestedSection obj={fieldObject} fieldname={fieldname}/> }
              </>
            }
            {
              fieldObject && fieldObject.fieldType !== 'NESTED' && 
              <Form.Item 
                id={parent ? (parent + fieldname + childIdx) : fieldname}
                label={fieldObj.label ? fieldObj.label : fieldname}
                name={childIdx!=null ? [ childIdx ,fieldname ] : _getFormItemName()}
                key={parent ? (parent + fieldname + childIdx) : fieldname}
                rules={Rfl_Utils._getRule(fieldObject)}
                >
                  {
                    fieldObject.fieldType ?
                    <>
                      { fieldObject.fieldType === 'PASSWORD' && <Input.Password disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/> }
                      { fieldObject.fieldType === 'TEXTAREA' && <Input.TextArea disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/> }
                      { fieldObject.fieldType === 'DATE' && <Rfl_DatePicker obj={fieldObject} onInputChange={_onInputChange}/> }
                      { fieldObject.fieldType === 'NUMBER' && <InputNumber style={{width: '100%'}} disabled={_isDisabledField(fieldObject, parent)} onBlur={_onInputBlur} onChange={_onInputChange}/>}
                      { fieldObject.fieldType === 'FILE' && <Rfl_FileUploader obj={fieldObject} fieldname={fieldname} onInputChange={_onInputChange}/>}
                      { fieldObject.fieldType === 'AUTOCOMPLETE' && <Rfl_AutoComplete obj={fieldObject} fieldname={fieldname} parent={parent} onInputChange={_onInputChange}/>}
                      { fieldObject.fieldType === 'SWITCH' && <Switch onChange={_onInputChange} />}

                      { (fieldObject.fieldType === 'DROPDOWN' || fieldObject.fieldType === 'CHECKBOX' || fieldObject.fieldType === 'RADIO' || fieldObject.fieldType === 'SEGMENT') &&
                        <Rfl_ListDataInputs obj={fieldObject} fieldname={fieldname} parent={parent} onInputChange={_onInputChange}/>
                      }
                      </>
                    : <Input onChange={_onInputChange} onBlur={_onInputBlur}/>
                  }
              </Form.Item>
            } */}
            {
              tempSection &&
              <Rfl_SectionLayout section={tempSection}/>
            }
            {
              fieldObj && fieldObj.extra?.verificationNeeded &&
              <div className="rfl_verificationText" onClick={(e) => _verifyField(e)}>{fieldObj.extra?.verificationText ? fieldObj.extra?.verificationText : `Verify ${fieldname}`}</div>
            }
        </>
      
    );
}


export default Rfl_InputWrapper;