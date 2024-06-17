import { Button, Col, Flex, Form, Row } from "antd";
import { useContext } from "react";
import { rfl_formContext } from "../pages";
import {  PlusOutlined } from '@ant-design/icons';
import Rfl_SectionLayout from "./Rfl_SectionLayout";


const Rfl_RepeatableSection = ({obj, fieldname}: any) => {
    const { _onRepeatableRemove } = useContext(rfl_formContext);
  
    return (
      <div className='rfl_repeatableSection'>
            <Form.List name={fieldname}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <Row key={key} className='rfl_repeatableRow'>
                      <Col span={20}>
                        <Rfl_SectionLayout section={obj.section} parent={fieldname} childIdx={name}/>
                      </Col>
      
                      <Col span={4} style={{'textAlign': 'right'}}>
                        <Button type="default" onClick={() => {remove(name); _onRepeatableRemove(fieldname, name) }} style={{ marginBottom: 8 }}> Remove </Button>
                      </Col>
                    </Row>
                  ))}
      
                  <div className='rfl_buttonWrapper'>
                    <Flex justify={'center'} align={'center'}>
                        <Button type="dashed" onClick={() => add()}>
                          <b><PlusOutlined className='icon'/>{obj.label}</b>
                        </Button>
                    </Flex>
                  </div>
                </>
              )}
            </Form.List>
      </div>
    )
}


export default Rfl_RepeatableSection;