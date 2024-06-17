import { Col, Divider, Row } from "antd";
import { IField, IFormSection } from "../helpers/Rfl_Interfaces";
import Rfl_InputWrapper from "./Rfl_InputWrapper";
import { useContext, useEffect, useState } from "react";
import { rfl_formContext } from "../pages";


const Rfl_SectionLayout: React.FC<{ section: IFormSection, parent?: string, childIdx?: number }> = ({section, parent, childIdx}) => {

    const { styles } = useContext(rfl_formContext);

    const _hasRowIndicesAtFieldLevel = () => {
      return Object.values(section.fields).filter((f: any) => f.rowIndex).length > 0;
    }
    const _getColumnsCount = (section: IFormSection) => {
      if (section.fieldLayout === 'COLUMN' && section.columns) {
        return section.columns;
      } else if (section.fieldLayout === 'COLUMN' && !section.columns && !_hasRowIndicesAtFieldLevel()) {
        return 2;
      } else {
        return 1;
      }
    }

    return (
      <div className='rfl_sectionWrapper'>
        {
          !parent && section.name && <div className='rfl_sectionHeader'>
            <div className='rfl_sectionName' style={ styles.color && {color: styles.color}}>{section.name}</div>
            { section.subheader && <span className='rfl_sectionSubheader'>{section.subheader}</span> }
            <Divider style={{margin: '1em 0 2em 0', borderBlockStart: styles.color ? `2px solid ${styles.color}` : '1px solid grey'}}/>
          </div>
        }
        {
          section.fields && Object.keys(section.fields).length > 0 && 
          <>
            {
              section.fieldLayout === 'COLUMN' && !section.columns && _hasRowIndicesAtFieldLevel() ? 
                <VariableColumnLayout fields={section.fields} parent={parent} childIdx={childIdx}/>
                : <RowLayout fields={section.fields} parent={parent} childIdx={childIdx} columns={_getColumnsCount(section)}/>
            }
          </>
        }
        
      </div>
      
    )
}


export default Rfl_SectionLayout;


const RowLayout: React.FC<{ fields: { [key: string]: any }, parent?: string, childIdx?: number, columns: number }> = ({fields, parent, childIdx, columns}) => {
  return (
    <Row gutter={16}>
      <FieldsIterator fields={fields} parent={parent} childIdx={childIdx} columns={columns}/>
    </Row>
  )
}
  
  
const VariableColumnLayout: React.FC<{ fields: { [key: string]: IField },  parent?: string, childIdx?: number }> = ({fields, parent, childIdx}) => {
    const [fieldsSegment, setFieldsSegment] = useState<{[key: number]: { [key: string]: IField}}>({});
  
    const _convertToOrderedStructure = (fields: { [key: string]: IField }) => {
      const orderedStructure: {[key: number]: { [key: string]: IField } } = {};
      for (const fieldName in fields) {
        const field = fields[fieldName];
        const rowIndex: any = field.rowIndex;
        if (!orderedStructure[rowIndex]) {
          orderedStructure[rowIndex] = {};
        }
        orderedStructure[rowIndex][fieldName] = field;
      }
      setFieldsSegment(orderedStructure);
    }
  
    useEffect(() => {
      _convertToOrderedStructure(fields);
    }, [fields]);

    return (
      <>
      {
        Object.keys(fieldsSegment).length > 0 && Object.keys(fieldsSegment).map((segKey: any) => (
          <Row key={segKey} gutter={16}>
            <FieldsIterator fields={fieldsSegment[segKey]} parent={parent} childIdx={childIdx} columns={Object.keys(fieldsSegment[segKey]).length}/>
          </Row>
        ))
      }
      </>
    )
}

const FieldsIterator: React.FC<{ fields: { [key: string] : IField}, parent?: string, childIdx?: number, columns: number }> = ({fields, parent, childIdx, columns}) => {

  return (
    <>
      {
        Object.keys(fields).map((fieldname: string, i: number) => (
          <Col key={i} span={24/columns}>
            <Rfl_InputWrapper fieldname={fieldname} fieldObject={fields[fieldname]} parent={parent} childIdx={childIdx}/>
          </Col>
        ))
      }
    </>
  )
}
