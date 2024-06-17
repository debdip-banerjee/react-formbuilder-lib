import { useEffect, useState, createContext, useContext, useCallback, forwardRef, useImperativeHandle  } from 'react';
import { Button, Col, ConfigProvider, Flex, Form, Row, Space, Steps, message, notification } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Rfl_FormBuilder.scss';
import { IField, IFieldDataEmitter, FormBuilderHandle, IFormBuilderSchema, IFormSection, IMessageAlert, IStepsProps, LastChangedObjectProps } from '../helpers/Rfl_Interfaces';
import { Rfl_SectionLayout } from '../components';
import { Rfl_Utils } from '../helpers';



dayjs.extend(customParseFormat);
export const rfl_formContext = createContext<any>(null);


const Rfl_FormBuilder = forwardRef<FormBuilderHandle, IFormBuilderSchema> (( props, ref ) => {
  const {formschema, data, styles, onFormSubmit, onFormChange, layout, primaryButtonTitle, extraButtons, authToken, widgets} = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [customForm, setCustomForm] = useState<IFormSection[]>([]);
  const [columnLayout, setColumnLayout] = useState<any>({ labelCol: { span: 24 }, wrapperCol: { span: 24 } });
  const [dataFormat, setDataFormat] = useState<any>(null);
  const [lastChangedObject, setLastChangedObject] = useState<LastChangedObjectProps | null>(null);
  const [stepsMeta, setStepsMeta] = useState<IStepsProps | null>(null);
  const [currentStep, setCurrent] = useState<number>(0);
  const [hasActiveSteps, setHasActiveSteps] = useState<boolean>(false);
  const [oneOfSections, setOneOfSections] = useState<{[pilot: string]: IFormSection}>({});

  // validationCallback
  useImperativeHandle(ref, () => ({
    setRflStatus: (msg: IMessageAlert) => {
      _setMessageAlerts(msg);
    }
  }));

  const _setNotificationAlerts = (msg: IMessageAlert) => {
    notificationApi.open({
      message: msg.type,
      description: msg.message,
      showProgress: true,
      pauseOnHover: true,
    });
  };
  const _setMessageAlerts = (msg: IMessageAlert) => {
    messageApi.open({
      type: msg.type,
      content: msg.message,
      className: `rfl_alertMessageClass ` + (msg.type === 'success' ? 'rfl_success' : msg.type === 'warning' ? 'rfl_warning' : 'rfl_error')
    });
  };

  const _setColumnLayout = (layout: any) => {
    if (layout === 'horizontal') {
      setColumnLayout({ labelCol: { span: 4 }, wrapperCol: { span: 20 } })
    } else {
      setColumnLayout({ labelCol: { span: 24 }, wrapperCol: { span: 24 } });
    }
  }

  const _processCapturedData = useCallback((data: any) => {
    form.setFieldsValue(data);
    setDataFormat((prev: any) => { return {...prev, ...data}});
  }, [form]);

  useEffect(() => {
      if (formschema.sections?.length > 0) {
          setCustomForm(formschema.sections);
      }
  }, [formschema]);

  useEffect(() => {
    _setColumnLayout(layout);
  },[layout])

  useEffect(() => {
    _processCapturedData(data);
  }, [data, _processCapturedData]);



  const _isDisabledField = (fieldObject: IField, parent?: string) => {
    return !Rfl_Utils._hasAllDependencyDataCaptured(fieldObject, dataFormat, parent);
  }

  const _deleteCapturedFields = (values: any, name: string, parent?: string) => {
    if (parent && values[parent] && values[parent][name]) {
      delete values[parent][name];
    }
    if (values[name]) {
      delete values[name];
    }
    _processCapturedData(values);
  }

  const _checkIfChangeAffectsDependentFields = (values: any,fieldname: string, parent?: string) => {
    customForm.forEach((section: any) => {
      let relevantSection = parent ? section.fields[parent]?.section : section;
      if (relevantSection)
        Object.keys(relevantSection?.fields).forEach(async (name: string) => {
          let fieldObject = relevantSection?.fields[name];
          if (fieldObject.extra?.dependencies?.includes(fieldname)) {
            _deleteCapturedFields(values, name, parent);
          }
        });
    });
  }
  const _setOneOfSections = (pilot: string, section: IFormSection) => {
    let obj = { [pilot]: section}
    setOneOfSections((prev: any) => { return { ...prev, ...obj } });
  }
  const _checkAndUpdateOneOfFields = (values: any, fieldObject: IField, fieldname: string, parent?: string) => {
    if (fieldObject) {
      let fieldObj: any = fieldObject;
      if (fieldObj.extra?.oneOf && Object.keys(fieldObj.extra.oneOf).length > 0 && values) {
        let fieldvalue = parent ? values[parent][fieldname] : values[fieldname];
        if (fieldvalue) _setOneOfSections( fieldname, fieldObj.extra.oneOf[fieldvalue]);
        else _setOneOfSections(fieldname, fieldObj.extra.oneOf[Object.keys(fieldObj.extra.oneOf)[0]]);
      }
    }
  }


  const _onRepeatableRemove = (name: string, childIdx: any) => {
    let values: any = {...dataFormat};
    if (values[name]) {
      values[name].splice(childIdx, 1);
      _processCapturedData(values);
    }
  }
  const _onChange = (data: any, fieldname: string, obj: IField, parent?: string, childIdx?: number) => {
    _onBlur(data, fieldname, obj, parent);
    let values: any = {...dataFormat};
    if (parent) {
      let parentObj: any = customForm.find((section: IFormSection) => section.fields[parent])?.fields[parent as string];
      if (parentObj && !parentObj.repeatable){
          values[parent] = { ...values[parent], [fieldname]: data };
      } else {
          let idx = childIdx as number;
          if (!values[parent]) values[parent] = [];
          if (values[parent][idx]) {
              values[parent][idx] = { ...values[parent][idx], [fieldname]: data };
          } else {
              values[parent][idx] = { [fieldname]: data };
          }
      }
    } else {
        values = { ...dataFormat, [fieldname as string]: data };
    }
    _processCapturedData(values);
    setLastChangedObject({obj, fieldname, parent});
    _checkIfChangeAffectsDependentFields(values, fieldname, parent);
  }
  const _onBlur = (data: any, fieldname: string, obj: IField, parent?: string) => {
    let emittedField: IFieldDataEmitter = { field: obj, fieldname: fieldname, parent: parent, value: data};
    onFormChange(emittedField);
  }


  const _onStepChange = (idx: number) => {
    idx > currentStep ? _onNext(idx) : _onPrevious(idx);
  }
  const _onNext = async (toIdx?: number) => {
    try {
      await form.validateFields();
      if ((toIdx || toIdx === 0) && stepsMeta && toIdx < stepsMeta?.items.length) setCurrent(toIdx);
      else if (stepsMeta && currentStep < stepsMeta?.items.length - 1) setCurrent(currentStep + 1);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  }
  const _onPrevious = (toIdx?: number) => {
    if ((toIdx || toIdx === 0) && stepsMeta && toIdx >= 0) setCurrent(toIdx);
    else if (currentStep > 0) setCurrent(currentStep - 1);
  }
  const _onFinish = async (values: any) => {
      onFormSubmit('submit', dataFormat);
  }
  const _onReset = () => {
    form.resetFields();
  };
  const _extraBtnClick = (btn: string) => {
    onFormSubmit(btn);
  }




  const _getSteps = () => {
    return formschema.sections.map((section: IFormSection, index: number) => {
      return {
        title: section.steps?.title ? section.steps.title : `Step ${index + 1}`,
        description: section.steps?.description,
      }
    });
  }
  const getStepOptions = () => {
    return {
      direction: formschema.extra?.direction ? formschema.extra.direction : 'horizontal',
      progressDot: formschema.extra?.dotSteps ? true : false,
      items: _getSteps()
    }
  }
  useEffect(() => {
    if (currentStep) setCurrent(currentStep);
    else setCurrent(0);
  }, [stepsMeta, currentStep])

  useEffect(() => {
    if (formschema.stepped) {
      let steps: IStepsProps = getStepOptions();
      let actSteps = formschema.extra?.activeSteps ? true : false;
      setHasActiveSteps(actSteps);
      setStepsMeta(steps);
    } else {
      setStepsMeta(null);
    }
  }, [customForm])


  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: styles?.color ? styles.color : '#00b96b',
          borderRadius: styles?.borderRadius || styles?.borderRadius===0 ? styles.borderRadius : 3,
          colorBgContainer: styles?.backgroundColor ? styles.backgroundColor : '#f6ffed',
          controlHeight: styles?.elementHeight ? styles.elementHeight : 40,
          fontSize: styles?.fontSize ? styles.fontSize : 14,
          colorBorder: styles?.borderColor ? styles.borderColor : '#d9d9d9',
        },
      }}
    > 
      {contextHolder}
      {notificationContextHolder}
      <Form
        form={form}
        labelCol={columnLayout.labelCol}
        wrapperCol={columnLayout.wrapperCol}
        layout={layout ? layout : "vertical"}
        onFinish={_onFinish}
        scrollToFirstError={true}
        autoComplete="off"
        initialValues={{ qualifications: [{}] }}
        >
          <rfl_formContext.Provider value={{formschema, customForm, styles, widgets, dataFormat, currentStep, lastChangedObject, hasActiveSteps, oneOfSections, authToken,
              _checkAndUpdateOneOfFields, _setMessageAlerts, _setNotificationAlerts, _isDisabledField, _onStepChange, _onChange, _onBlur, _deleteCapturedFields, _onRepeatableRemove }}>
            {
                (formschema && formschema.stepped)
                ? <SteppedSections  currentStep={currentStep} stepsMeta={stepsMeta}/>
                : customForm && customForm.map((section: IFormSection, index: number) => (
                    <Rfl_SectionLayout key={index} section={section} />
                  ))
            }
            <br/>
            <br/>
            <div className='rfl_buttonWrapper'>
              <Flex justify={'center'} align={'center'}>
                <Space >
                  { currentStep > 0 && <Button type="default" onClick={() => _onPrevious()}>Previous</Button> }
                  { stepsMeta && (currentStep < stepsMeta?.items.length - 1) && <Button type="primary" onClick={() => _onNext()}>Next</Button> }
                  { stepsMeta && currentStep === stepsMeta?.items.length - 1 && <Button type="primary" htmlType="submit">{primaryButtonTitle ? primaryButtonTitle : 'Submit'}</Button> }
                  { stepsMeta && currentStep === stepsMeta?.items.length - 1 && <Button type="default" onClick={_onReset}>Reset</Button>}
                  {
                    stepsMeta && currentStep === stepsMeta?.items.length - 1 && extraButtons && extraButtons.map((btn: any, i: number) => (
                      <Button key={"button-" + i} type="default" onClick={() => _extraBtnClick(btn)}>{btn}</Button>
                    ))
                  }
                </Space>
                
              </Flex>
            </div>
          </rfl_formContext.Provider>
      </Form>
    </ConfigProvider>
  );
})

export default Rfl_FormBuilder;


const SteppedSections = ({stepsMeta, currentStep}: any ) => {

  const { formschema, customForm, hasActiveSteps, _onStepChange } = useContext(rfl_formContext);

  return (
    <>
    { stepsMeta && 
      <>
        {
          formschema && formschema.extra?.direction === 'vertical'
          ?
            <Row gutter={16}>
              <Col span={6}>
                { (currentStep || currentStep === 0) && <Steps current={currentStep} {...stepsMeta} onChange={hasActiveSteps ? _onStepChange : null}/> }
              </Col>
              <Col span={18}>
                { customForm?.length > 0 && <Rfl_SectionLayout section={customForm[currentStep]} /> }
              </Col>
            </Row>
          :
              <>
                { (currentStep || currentStep === 0) && 
                  <Steps current={currentStep} {...stepsMeta} onChange={hasActiveSteps ? _onStepChange : null} style={{marginBottom: '20px'}}/>
                }
                {/* { customForm?.length > 0 && <Card><Rfl_SectionLayout section={customForm[currentStep]} /></Card> } */}
                { customForm?.length > 0 && <Rfl_SectionLayout section={customForm[currentStep]} /> }
              </>
        }
      </>
    }
    </>

  )
}

