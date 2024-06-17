import { useContext, useEffect, useState } from "react";
import { rfl_formContext } from "../pages";
import { Button, Card, Col, Collapse, Row, Select, Space, Tag, Upload, UploadProps } from "antd";
import { UploadOutlined, DeleteOutlined, PlusOutlined, PaperClipOutlined } from '@ant-design/icons';
import Rfl_InputWrapper from "./Rfl_InputWrapper";
import { ICategorisedFiles, IMessageAlert, IUncategorisedFiles } from "../helpers/Rfl_Interfaces";

const Rfl_FileUploader = ({obj, fieldname, onInputChange}: any) => {
    const { dataFormat, _setMessageAlerts, _setNotificationAlerts } = useContext(rfl_formContext);
    const [files, setFiles] = useState<IUncategorisedFiles | ICategorisedFiles>({});
    const [selectedTempCategory, setCategory] = useState<string | null>(null);
    const [selectedMetaCategory, setMetaCategory] = useState<any>(null);
    const [extraProps, setExtraProps] = useState<any>({});

    const _addCategorisedFile = (file: any) => {
      let tmpCat: string = selectedTempCategory as string;
      setFiles((prevCategoryFiles: any) => {
          let cat = prevCategoryFiles[tmpCat];
          let updatedCategoryFiles;

          if (cat) {
              cat.files.push(file);
              updatedCategoryFiles = { ...prevCategoryFiles, [tmpCat]: cat };
          } else {
              updatedCategoryFiles = { ...prevCategoryFiles, [tmpCat]: { files: [file] } };
          }
          onInputChange(updatedCategoryFiles);
          return updatedCategoryFiles;
      });
    }
    const _addUncategorisedFile = (file: any) => {
      setFiles((prevUncategorisedFileList: any) => {
          let uncat = { ...prevUncategorisedFileList };
          if (!uncat.files) {
              uncat.files = [];
          }
          uncat.files.push(file);
          onInputChange(uncat);
          return uncat;
      });
    };
  
    const _collectFiles = (file: any) => {
      if (obj.extra.categories) {
        if (selectedTempCategory)
          _addCategorisedFile(file);
        else {
          let alert: IMessageAlert = { type: 'error', message: 'Please select a category first..' };
          _setMessageAlerts(alert);
        }
      }
      else {
        _addUncategorisedFile(file);
      }
    }
  
    const uploadProps: UploadProps = {
      showUploadList: false,
      multiple: obj.extra.multi ? true : false,
      accept: obj.extra.allowedExtensions ? obj.extra.allowedExtensions.toString() : '',
      beforeUpload: (file) => {
        if (file) {
          _collectFiles(file);
        }
        return false;
      }
    };
  
    const _getFormattedOptions = (fieldObj: any) => {
      return fieldObj.categories.map((el: any) => ({label: el[fieldObj.labelfield], value: el[fieldObj.valuefield]}));
    }
  
    const _handleDocCategorySelect = (value: any) => {
      setCategory(value);
      let cat = obj?.extra?.categories.find((cat: any) => cat[obj.extra.valuefield] === value);
      if (cat) {
        setMetaCategory(cat);
        setExtraProps({...extraProps, accept: cat.allowedExtensions ? cat.allowedExtensions.toString() : '', multiple: cat.multi});
      }
    }
    const _onDocMetaSubmit = (data: {[key: string]: any}) => {
      if (data && Object.keys(data).length > 0) {
        if (obj.extra.categories) {
          let categoryFiles: any = {...files};
          if (selectedTempCategory && categoryFiles && categoryFiles[selectedTempCategory]) {
            let cat = categoryFiles[selectedTempCategory];
            cat.meta = data;
            let d = {...categoryFiles, [selectedTempCategory]: cat};
            setFiles(d);
            onInputChange(d);
          } else {
            let alert: IMessageAlert = { type: 'error', message: 'Please select a file first..' };
            _setMessageAlerts(alert);
          }
        } else {
          let uncat: any = { ...files}
          if (uncat?.files?.length > 0) {
            uncat.meta = data;
            setFiles(uncat);
            onInputChange(uncat);
          } else {
            let alert: IMessageAlert = { type: 'error', message: 'Please select a file first..' };
            _setMessageAlerts(alert);
          }
        }
      } else {
        let alert: IMessageAlert = { type: 'error', message: 'Please fill in the required fields..' };
        _setMessageAlerts(alert);
      }
    }
  
    const _onUploadedItemChange = (item: any, option: 'deleteCategory' | 'deleteFile', _files: any, parent?: any) => {
      let d: any = {..._files};
      if (obj.extra.categories) {
        // let d = {...dataFormat[fieldname]};
        switch (option) {
          case 'deleteCategory':
            delete d[item];
            break;
          case 'deleteFile':
            if (parent) {
              d[parent].files = d[parent].files.filter((f: any, idx: number) => idx !== item);
              if (d[parent].files.length === 0) delete d[parent];
              break;
            }
            d.files = d.files.filter((f: any, idx: number) => idx !== item);
            break;
        }
      } else {
        // let d = {...dataFormat[fieldname]};
        d.files = d.files.filter((f: any, idx: number) => idx !== item);
        if (d.files.length === 0 && d.meta) delete d.meta;
      }
      setFiles(d);
      onInputChange(d);
    }

    useEffect(() => {
      setFiles(dataFormat[fieldname]);
    }, [dataFormat])
  
    const _uploader = () => {
      return (
        <>
          {
            extraProps && <Upload {...uploadProps} {...extraProps}>
              <Button type="primary" icon={<UploadOutlined />}>Browse File(s)</Button>
            </Upload>
          }
        </>
      )
    }
  
    return (
      <Card size='small' className="rfl_cardBorder">
        <Space direction="vertical" style={{ display: 'flex' }}>
        {
          (obj?.extra?.categories && obj?.extra?.categories.length > 1)
          ? 
            <Space.Compact style={{width: '100%'}}>
              <Select style={{width: '50%'}} placeholder="Select Category.." onChange={_handleDocCategorySelect} options={_getFormattedOptions(obj.extra)} />
              { _uploader() }
            </Space.Compact>
          :
          <> 
              { _uploader() }
          </>
        }
        {
          obj?.extra?.meta?.fields &&
          <DocumentMetaFields obj={obj} onDocMetaSubmit={_onDocMetaSubmit}/>
        }
        { selectedMetaCategory?.meta?.fields &&
          <DocumentMetaFields obj={obj} category={selectedMetaCategory} onDocMetaSubmit={_onDocMetaSubmit}/>
        }
        {
          Object.keys(files).length > 0 && <UploadedItemCard obj={obj} categoryFiles={files} onItemChange={_onUploadedItemChange}/>
        }
        </Space>
      </Card>
    );
}


export default Rfl_FileUploader;
  



const DocumentMetaFields = ({obj, category, onDocMetaSubmit}: any) => {
    const [dataObject, setdataObject] = useState<any>({});
    const {fields} = category ? category.meta : obj.extra.meta; 
  
    const _onCustomCallback = (data: any, fieldname: string) => {
      let dobj = {...dataObject, [fieldname]: data};
      setdataObject(dobj);
    }
    const _onSubmit = () => {
      onDocMetaSubmit(dataObject);
    }
  
    return (
        <Card size='small' className='rfl_documentMetaCapture rfl_cardBorder'>
          {
            fields && 
            <Row>
              <Col span={20}>
                <Row gutter={8}>
                {
                  Object.keys(fields).map((name: any, i: number) => (
                    <Col key={name} span={8}>
                      <Rfl_InputWrapper fieldname={name} fieldObject={fields[name]} parent={category ? category[obj.extra.valuefield] : null} childIdx={i} onCustomCallback={(v: any) => _onCustomCallback(v, name)}/>
                    </Col>
                  ))
                }
                </Row>
              </Col>
              <Col span={4} style={{'textAlign': 'right'}}>
                <Button type="default" onClick={_onSubmit}> <PlusOutlined/> Add </Button>
              </Col>
            </Row>
          }
        </Card>
    )
  }
  
const UploadedItemCard = ({obj, categoryFiles, onItemChange}: any) => {
  
    const [collapsibleItems, setCollapsibleItems] = useState<any>([]);
    const { styles } = useContext(rfl_formContext);
  
    const _getCategoryLabel = (cat: any) => {
      return obj.extra.categories.find((c: any) => c[obj.extra.valuefield] === cat)[obj.extra.labelfield];
    }
    const _getCardTitle = (cat: any) => {
      if (categoryFiles[cat].files?.length > 0)
        return `${_getCategoryLabel(cat)} : ${categoryFiles[cat].files.length} file(s) attached`
      else
        return cat;
    }
    const _deleteCategory = (catname: string) => {
      return (<DeleteOutlined
        onClick={(event: any) => {
          onItemChange(catname, 'deleteCategory', categoryFiles);
          event.stopPropagation();
        }}
      />)
    }
    const _getFilesDOM = (files: any, cat?: string) => {
      return (
        <Card.Grid hoverable={false} style={{width: '100%', padding: '10px'}} className="rfl_cardBorder">
          {files.map((f: any, idx: number) => 
            <b key={idx} style={{display: 'flex', justifyContent:'space-between'}}><Space><PaperClipOutlined />{ f.name }</Space><DeleteOutlined onClick={() => onItemChange(idx, 'deleteFile', categoryFiles, cat)}/></b>
          )}
        </Card.Grid>
      )
    }
    const _getMetaDOM = (meta: any) => {
      return (
        meta && Object.keys(meta).map((m: any, i: number) => (
          <Tag style={{border: styles?.color ? `1px solid ${styles.color}` : '1px solid lightgrey'}} className="rfl_tags" key={i}>{m} : <b>{meta[m]}</b></Tag>
        ))
      )
    }
    const _getFilesAndMeta = (catObj: any, cat?: string) => {
      return (
        <Card size='small'>
          { _getFilesDOM(catObj.files, cat) }
          { catObj.meta && _getMetaDOM(catObj.meta) }
        </Card>
      )
    }
    const _getCategoryItems = () => {
      let items: any = [];
      Object.keys(categoryFiles).forEach((cat: string, idx: number) => {
        let obj = { key: idx, label: _getCardTitle(cat), children: _getFilesAndMeta(categoryFiles[cat], cat), extra: _deleteCategory(cat) }
        items.push(obj);
      })
      setCollapsibleItems(items);
    }
  
    useEffect(() => {
      if (obj.extra.categories?.length>0)
        _getCategoryItems();
    }, [categoryFiles])
    return (
      <Space direction="vertical" style={{ display: 'flex' }}>
        {
          obj.extra.categories?.length>0 && collapsibleItems?.length > 0 &&
            <Collapse
              defaultActiveKey={[0]}
              items={collapsibleItems}
            />
        }
        {
          obj.extra.meta && _getFilesAndMeta(categoryFiles)
        }
      </Space>
    )
  }