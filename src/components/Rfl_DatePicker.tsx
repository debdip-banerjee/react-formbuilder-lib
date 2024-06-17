import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { rfl_formContext } from "../pages";

const { RangePicker } = DatePicker;

const Rfl_DatePicker = (props: any) => {
    const { dataFormat } = useContext(rfl_formContext);
    const [pickerOptions, setPickerOptions] = useState<any>(null);
    
    const formats: any = {
      'date': 'DD-MM-YYYY', 'week': 'DD-MM', 'month': 'MM-YYYY', 'year': 'YYYY'
    }
    const onDateChange: DatePickerProps['onChange'] = (date, dateString: any) => {
      props.onInputChange(dateString)
    };

    const _getPicker = () => {
      return props.obj.extra?.picker ? formats[props.obj.extra?.picker] : formats['date'];
    }

    const _transformDate = () => {
      let d: any = { };
      let obj = props.obj;
      let format =  _getPicker();
      let min = obj.extra?.min ? dayjs(obj.extra.min, format) : null;
      let max = obj.extra?.max ? dayjs(obj.extra.max, format) : null;
      if (min) d['minDate'] = min;
      if (max) d['maxDate'] = max;
      d['format'] = format;
      if (obj.extra?.picker && obj.extra?.picker!='') {
        d['picker'] = obj.extra.picker;
      }
      if (props.value) {
        if (props.obj.extra.range) {
          d['defaultValue'] = props.value.map((d: any) => _getDefaultValue(d, format) )
        } else
          d['defaultValue'] = _getDefaultValue(props.value, format);
      }

      setPickerOptions(d);
    }
    const _getDefaultValue = (date: any, format: any) => {
      return dayjs(date, format);
    }

    useEffect(() => {
      _transformDate();
    }, [dataFormat, props.obj])

    return (
      <>
      {
        pickerOptions &&
        <>
          { 
            props.obj.extra?.range
              ? <RangePicker style={{width: '100%'}} {...pickerOptions} onChange={onDateChange}/>
              : <DatePicker  style={{width: '100%'}} {...pickerOptions} onChange={onDateChange}/>
          }
        </>
      }
      </>
    );
}


export default Rfl_DatePicker;