# react-formbuilder-lib
A formbuilder built on react, typescript, sass and uses ant-design to generate a customisable forms from a JSON schema

## Install
```bash
npm i --save react-formbuilder-lib
```

## Usage

```tsx
import { useEffect, useRef, useState } from 'react';
import { FormBuilderHandle, IFieldDataEmitter, IMessageAlert, IWidgetProps } from './helpers';
import { Rfl_FormBuilder } from './pages';

const formdata = { } // data here as key-value pairs to prefill

function App() {

  const [customForm, setCustomForm] = useState<any>(null);
  const formBuilderRef = useRef<FormBuilderHandle>(null);

  useEffect(() => {
    fetch('/jsons/schema.json').then(response => response.json()).then(data => {
        setCustomForm(data);
    });
  }, []);

  const _onSubmit = (e: string, data?: any) => {
    switch(e) {
      case 'submit':
        console.log(JSON.stringify(data));
        break;
      case 'Cancel':
        console.log('Cancelled');
        break;
    }
  }
  const _onFormChange = (e: IFieldDataEmitter) => {
    // each field change is captured here on focus out
    console.log(e);
    if (e.fieldname === 'email' && e.value.length > 5){
      formBuilderRef.current?.setRflStatus({type: 'success', message: `Email id has ${e.value.length} characters!`} as IMessageAlert);
    }
  }

  return (
    <div className="formWrapper">
      { customForm && 
        <Rfl_FormBuilder 
            formschema={customForm} 
            data={formdata}
            layout='vertical'
            primaryButtonTitle='Save'
            extraButtons={['Cancel']}
            styles={{color: '#6c5bba', backgroundColor: '#f9f9f9', borderRadius: 0, elementHeight: 40}}
            authToken='....' // auth token
            onFormSubmit={_onSubmit} 
            onFormChange={_onFormChange}
            widgets={{custom_password_widget: PasswordWidget, Custom_dropdown_widget: DropdownWidget}}  // pass custom widgets here
            ref={formBuilderRef} />
      }
    </div>
  );
}

export default App;


const PasswordWidget: React.FC<IWidgetProps> = ({ value, onChange }) => {
  return (
    <div>
      <label>Password:</label>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

const DropdownWidget: React.FC<IWidgetProps> = ({ value, onChange, options }) => {
  return (
    <div>
      <label>Dropdown:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option: any) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};
```


## sample json schema
```json
{
    "type": "FORM",
    "stepped": false,
    "extra": { "dotSteps": true, "direction": "horizontal", "activeSteps": true },
    "sections": [
        {
            "name": "Personal Details (with field layout COLUMN at field level using Row Index)",
            "subheader": "Useful when combination of column layouts are used, i.e., some row has 2 columns, some 3, etc.. AND also, fields are sorted based on preference",
            "fieldLayout": "COLUMN",
            "steps": {"title": "Personal", "description": "Nested Fields"},
            "fields":{
                "name": { "label":"Contact Name", "required": true, "rowIndex": 0 },
                "email": { "label":"Email", "rowIndex": 1, "extra": { "rules": [{ "type":"email" }], "verificationNeeded": true } },
                "password" : { "label":"Password", "fieldType": "PASSWORD" , "rowIndex": 1, "extra": { "rules": [{ "minLength": 8, "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9]{8,}$", "message":"Password should have min 8 characters, atleast 1 caps, 1 small and 1 number, No special chars" }] } },
                "age": { "label": "Age", "rowIndex":2, "fieldType": "NUMBER", "extra": { "rules": [{ "type":"number", "min": 0, "max": 99 }] } },
                "dateofbirth": { "label": "Date of Birth", "fieldType": "DATE", "rowIndex":2, "extra": { "range": false, "min": "02-04-2024", "max": "09-04-2024" }, "required": true },
                "singleselect": { "label": "Single Selection with String menu", "fieldType": "DROPDOWN","rowIndex":2, "extra": { "sourcetype": "LOCAL", "datatype": "string", "values": ["MENU-1", "MENU-2"], "multi": false } },
                "address": { "label": "Address Details", "fieldType": "NESTED", "rowIndex":3, "section": {
                    "fieldLayout": "COLUMN", 
                    "fields": {
                        "street": { "label": "Street",  "rowIndex": 0, "required":true },
                        "country": { "label": "Country", "fieldType":"DROPDOWN",  "rowIndex": 1,
                                "extra": {
                                    "sourcetype": "LOCAL",
                                    "datatype": "object",
                                    "valuefield": "code",
                                    "labelfield": "label",
                                    "values": [
                                        {
                                            "code": "IN",
                                            "label": "India"
                                        },
                                        {
                                            "code": "US",
                                            "label": "United States"
                                        }
                                    ],
                                    "multi": false
                                } },
                        "state": { "label": "State",  "rowIndex": 1, "fieldType": "DROPDOWN",
                                "extra": {
                                    "sourcetype": "REMOTE",
                                    "datatype": "object",
                                    "valuefield": "id",
                                    "labelfield": "name",
                                    "dependencies": ["country"],
                                    "url": "https://...?q=${param1}", // params are optional
                                    "authorized": true,
                                    "multi": false
                                } },
                        "zip": { "label": "Zip",   "rowIndex": 1, "fieldType": "NUMBER",
                                "extra": {
                                    "rules": [{
                                        "type": "number",
                                        "min": 100000,
                                        "max": 999999
                                    }],
                                    "dependencies": ["state"]
                                } }
                    }
                } }
            }  
        },
        {
            "name": "Professional Details (with field layout COLUMN at field level, but columns SET TO A NUMBER at section level)",
            "subheader": "Useful when each row has fixed number of columns  (columns-count takes preference over rowIndex), AND, fields are ordered serially",
            "fieldLayout": "COLUMN",
            "steps": {"description": "Date Range Picker"},
            "columns": 3,
            "fields":{
                "company_name": { "label":"Company Name" },
                "company_email": { "label":"Company Email", "extra": { "rules": [{ "type":"email" }] } },
                "company_registration": { "label":"Company Registration Number", "fieldType":"NUMBER", "extra": { "rules": [{ "type":"number" }] } },
                "category": { "label": "Company Work Field", "fieldType": "DROPDOWN",
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "string",
                        "values": ["IT", "Archeology", "Medical", "Engineering", "Finance", "Others"],
                        "multi": false
                    } },
                "period_of_employment": { "label": "Period of Employment", "fieldType": "DATE",
                    "extra": {
                        "range": true,
                        "picker": "month"
                    }, "required": true }
            }
        },
        {
            "name": "Cascading Fields",
            "subheader": "Useful when fields are dependent on each other",
            "fieldLayout": "ROW",
            "steps": {"title": "Cascading"},
            "fields":{
                "country": {
                    "label": "Country",
                    "fieldType": "DROPDOWN",
                    "defaultOperator": "IN",
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "object",
                        "valuefield": "code",
                        "labelfield": "label",
                        "values": [
                            {
                                "code": "IN",
                                "label": "India"
                            },
                            {
                                "code": "US",
                                "label": "United States"
                            }
                        ],
                        "multi": false
                    }
                },
                "state" : {
                    "label": "State",
                    "fieldType": "DROPDOWN",
                    "defaultOperator": "IN",
                    "extra": {
                        "sourcetype": "REMOTE",
                        "datatype": "object",
                        "valuefield": "id",
                        "labelfield": "name",
                        "dependencies": ["country"],
                        "url": "https://...?q=${param1}", // params are optional
                        "authorized": true,
                        "multi": false
                    }
                },
                "city": {
                    "label": "City",
                    "fieldType": "DROPDOWN",
                    "defaultOperator": "IN",
                    "extra": {
                        "sourcetype": "REMOTE",
                        "datatype": "object",
                        "valuefield": "code",
                        "labelfield": "name",
                        "dependencies": ["state"],
                        "url": "https://...?q=${param1}", // params are optional
                        "authorized": true,
                        "multi": false
                    }
                }
            }
        },
        {
            "name":"Academic Details (with field layout ROW at field level)",
            "subheader": "Useful when all rows have exactly one field each, i.e., linear layout.",
            "fieldLayout": "ROW",
            "steps": {"title": "Auto-Complete", "description": "Typeahead"},
            "fields":{
                "autocomplete_local": { "label":"Autocomplete Typeahead (Local)", "fieldType": "AUTOCOMPLETE", 
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "string",
                        "values": ["SOME RANDOM TEXT","ALTERNATE TEXT","SIMPLE TEXT"]
                    } },
                "autocomplete_remote": { "label":"Autocomplete Typeahead (Remote)" , "fieldType": "AUTOCOMPLETE",
                    "extra": {
                        "sourcetype": "REMOTE",
                        "datatype": "object",
                        "valuefield": "icao",
                        "labelfield": "name",
                        "url": "https://...?q=${param1}", // params are optional
                        "authorized": false
                    } },
                "description": { "label": "Description", "fieldType": "TEXTAREA" },
                "multiselect": { "label": "Multi Selection with Object menu", "fieldType": "DROPDOWN",
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "object",
                        "valuefield": "code",
                        "labelfield": "label",
                        "values": [
                            {
                                "code": 1,
                                "label": "MENU-1"
                            },
                            {
                                "code": 2,
                                "label": "MENU-2"
                            }
                        ],
                        "multi": true
                    } },
                "radioGroup": { "label": "Radio Selection", "fieldType": "RADIO",
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "object",
                        "valuefield": "code",
                        "labelfield": "label",
                        "values": [
                            {
                                "code": 1,
                                "label": "RADIO-1"
                            },
                            {
                                "code": 2,
                                "label": "RADIO-2"
                            }
                        ]
                    } },
                "radioButton": { "label": "Radio Button Selection", "fieldType": "RADIO",
                    "extra": {
                        "optiontype": "button",
                        "sourcetype": "LOCAL",
                        "datatype": "string",
                        "values": ["RADIO-1", "RADIO-2", "RADIO-3", "RADIO-4"]
                    }
                }
            }
        },
        {
            "name": "Education (Repeatable Section)",
            "subheader": "Useful when a section needs to be repeated multiple times",
            "fieldLayout": "ROW",
            "steps": {"title": "Repeatable"},
            "fields": {
                "qualifications":{
                    "label": "Educational Qualifications",
                    "fieldType": "NESTED",
                    "repeatable": true,
                    "section": {
                        "fieldLayout": "COLUMN",
                        "columns": 3,
                        "fields": {
                            "qualification_name":{
                                "label": "Qualification Name",
                                "defaultOperator": "CONTAINS",
                                "extra": null,
                                "required": true
                            },
                            "institution_name":{
                                "label": "Institution Name",
                                "defaultOperator": "CONTAINS",
                                "extra": null,
                                "required": true
                            },
                            "passing_year":{
                                "label": "Year of Passing",
                                "fieldType": "DATE",
                                "defaultOperator": "EQ",
                                "extra": {
                                    "range": false,
                                    "picker": "year"
                                },
                                "required": true
                            }
                        }
                    }
                }
            }
        },
        {
            "name": "Toggle Fields",
            "subheader": "Fields change based on conditional selections",
            "fieldLayout": "ROW",
            "steps": {"title": "One-Of", "description": "Toggles set of fields"},
            "fields": {
                "segment": { "label": "Segment Selection with One-Of", "fieldType": "SEGMENT",
                    "extra": {
                        "sourcetype": "LOCAL",
                        "datatype": "string",
                        "values": ["Value-1", "Value-2", "Value-3"],
                        "oneOf": {
                            "Value-1": {
                                "fieldLayout": "COLUMN", 
                                "fields": {
                                    "field_1": { "label": "Field 1" }
                                }
                            },
                            "Value-2": {
                                "fieldLayout": "COLUMN", 
                                "fields": {
                                    "field_2_1": { "label": "Field 2.1" },
                                    "field_2_2": { "label": "Field 2.2" }
                                }
                            },
                            "Value-3": {
                                "fieldLayout": "COLUMN", 
                                "columns": 3,
                                "fields": {
                                    "field_3_1": { "label": "Field 3.1" },
                                    "field_3_2": { "label": "Field 3.2" },
                                    "field_3_3": { "label": "Field 3.3" }
                                }
                            }
                        }
                    }
                },
                "toggle": { "label": "Toggle switch with One-Of", "fieldType": "SWITCH",
                    "extra": {
                        "oneOf": {
                            "false": {
                                "fieldLayout": "COLUMN", 
                                "fields": {
                                    "field_3": { "label": "False Field" }
                                }
                            },
                            "true": {
                                "fieldLayout": "COLUMN", 
                                "fields": {
                                    "field_4": { "label": "True Field" }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "name": "Custom Widgets",
            "fieldLayout": "COLUMN",
            "steps": {"title": "Custom Widgets"},
            "fields": {
                "custom_password_widget": { "fieldType": "WIDGET", "label": "Password Widget"},
                "Custom_dropdown_widget": { "fieldType": "WIDGET", "label": "Dropdown Widget", "extra": {"values": ["Apple", "Orange", "Mango"]}}
            }
        },
        {
            "name": "File Upload",
            "fieldLayout": "ROW",
            "steps": {"title": "Uploader"},
            "fields":{
                "categorized_documents": {
                    "label": "Upload Multi-category Document(s)",
                    "fieldType": "FILE",
                    "defaultOperator": "IN",
                    "extra": {
                        "multi": true,
                        "allowedExtensions": [".pdf"],
                        "valuefield": "code",
                        "labelfield": "label",
                        "categories":  [
                            { "code": "pan", "label": "PAN", "allowedExtensions": ["image/*", ".pdf"] },
                            { "code": "aadhar", "label": "Aadhar", "allowedExtensions": ["image/*", ".pdf"] },
                            { "code": "MCA_certificate", "label": "MCA Certificate", "required": true, "allowedExtensions": [".pdf"],
                                "meta":{
                                    "fields":{
                                        "university" : {
                                            "name": "",
                                            "label": "University Name"
                                        },
                                        "year": {
                                            "label": "Year of Passing",
                                            "fieldType": "DATE",
                                            "extra": {
                                                "picker": "year"
                                            }
                                        }
                                    }
                                }
                            },
                            { "code": "other", "label": "Other Documents","multi": true,  "required": false, "allowedExtensions": ["image/*"] }
                        ]
                    }
                },
                "documents": {
                    "label": "Upload Document(s)",
                    "fieldType": "FILE",
                    "defaultOperator": "IN",
                    "extra": {
                        "multi": true,
                        "allowedExtensions": [".pdf"],
                        "meta":{
                            "fields":{
                                "university":{
                                    "label": "University Name"
                                },
                                "year":{
                                    "label": "Year of Passing",
                                    "fieldType": "DATE",
                                    "extra": {
                                        "picker": "year"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ]
}
                
```


## MIT License

Copyright (c) 2024 debdip-banerjee


###### Developed by:  [Debdip Banerjee](https://www.linkedin.com/in/debdip-banerjee-1a3b2ba2/)