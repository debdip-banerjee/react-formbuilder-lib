
import Rfl_SectionLayout from "./Rfl_SectionLayout";
import { Col, Row } from "antd";


const Rfl_NestedSection = ({obj, fieldname}: any) => {

    return (
        <div className="rfl_nestedSection">
            <div className="rfl_repeatableHeader"><span className="title">{fieldname}</span></div>
            <Row className='rfl_repeatableRow'>
                <Col span={24}>
                    <Rfl_SectionLayout section={obj.section} parent={fieldname}/>
                </Col>
            </Row>
        </div>
    )
}

export default Rfl_NestedSection;