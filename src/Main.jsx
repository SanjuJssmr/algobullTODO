import React, { useState, useEffect } from 'react'
import { Popconfirm, Button, Space, Form, Input, ConfigProvider, Tag, Badge } from 'antd'
import { isEmpty } from 'lodash'
import { HeartOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dtjson from './data.json'
import { ProTable } from '@ant-design/pro-components'
import enUSIntl from 'antd/lib/locale/en_US';

const Main = () => {

  const [gridData, setGridData] = useState([])
  const [loading, setLoading] = useState(false)
  const [editRowKey, setEditRowKey] = useState("")
  const [sortInfo, setSortInfo] = useState("")
  const [form] = Form.useForm();
  const [search, setSearch] = useState("")
  const [filteredInfo, setFilteredInfo] = useState({})
  let [filteredData] = useState()

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setGridData(dtjson);
    setLoading(false)
  }

  const age = gridData.map((item) => ({
    ...item,
    age: Math.floor(Math.random() * 6) + 20
  }))


  const modify = age.map(({ body, ...item }) => ({
    ...item,
    key: item.id,
    message: isEmpty(body) ? item.message : body,
  }))


  const handleDelete = (value) => {
    const dataSource = [...modify];
    const filteredData = dataSource.filter((item) => item.id !== value.id)
    setGridData(filteredData)
  }


  const isEditing = (record) => {
    return record.key === editRowKey
  }


  const cancel = () => {
    setEditRowKey(" ")
  }


  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...modify]
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row })
        setGridData(newData);
        setEditRowKey(" ");

      }
    } catch (error) {
      console.log("error", error);
    }
  }


  const edit = (record) => {
    form.setFieldValue({
      title: "",
      des: "",
      due: "",

      ...record
    })
    setEditRowKey(record.key)
  }


  const handleChange = (_, filters, sorter) => {
    const { order, field } = sorter;
    setFilteredInfo(filters);

    setSortInfo({ columnKey: field, order })
  }


  const col = [
    {
      title: "ID",
      dataIndex: "id"
    },

    {
      title: "Time-Stamp",
      dataIndex: "timestamp",
      align: "center",
      sorter: (a, b) => a.timestamp.length - b.timestamp.length,
      sortOrder: sortInfo.columnKey === "timestamp" && sortInfo.order,
    },

    {
      title: "Title",
      dataIndex: "title",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortInfo.columnKey === "title" && sortInfo.order,
    },

    {
      title: "Description",
      dataIndex: "des",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.des.length - b.des.length,
      sortOrder: sortInfo.columnKey === "des" && sortInfo.order,
    },

    {
      title: "Due Date",
      dataIndex: "due",
      align: "center",
      editTable: true,
      sorter: (a, b) => a.due.length - b.due.length,
      sortOrder: sortInfo.columnKey === "due" && sortInfo.order,
    },

    {
      title: "Tag",
      dataIndex: "tag",
      align: "center",
      render: tags => (
        <span>
          {tags.map(tag => {
            let color = tag.length > 9 ? '#9fa9b2' : '#c9867e';
            if (tag === 'mandatory') {
              color = '#e9415a';
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </span>
      ),
      filters: [
        { text: "mandatory", value: "mandatory" },
        { text: "personal", value: "personal" },
        { text: "professional", value: "professional" },
        { text: "home", value: "home" },

      ],
      filteredValue: filteredInfo.tag || null,
      onFilter: (value, record) => String(record.tag).includes(value),
    },

    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      filters: [
        { text: "open", value: "open", type: "danger" },
        { text: "working", value: "working" },
        { text: "done", value: "done" },
        { text: "overdue", value: "overdue" },

      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => String(record.status).includes(value),
      render: status => {

        if (status === 'open') {
          return <Badge status="warning" text="OPEN" />
        }
        if (status === 'working') {
          return <Badge status="processing" text="WORKING" />
        }
        if (status === 'done') {
          return <Badge status="success" text="DONE" />
        }
        if (status === 'overdue') {
          return <Badge status="error" text="OVER DUE" />
        }
      },
    },

    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const editTable = isEditing(record)
        return modify.length >= 1 ? (
          <Space>
            <Popconfirm title="Are you sure" onConfirm={() => handleDelete(record)}>
              <Button danger disabled={editTable} type='default' >Delete</Button>
            </Popconfirm>
            {editTable ? (
              <span>
                <Space size='middle'>
                  <Button onClick={() => save(record.key)} style={{ marginRight: 8, background: "#e9415a", color: "#fff", border: "none" }}>Save</Button>
                  <Popconfirm title='are you sure to cancel?' onConfirm={cancel}>
                    <Button >Cancel</Button>

                  </Popconfirm>
                </Space>
              </span>
            ) : (
              <Button style={{ marginRight: 8, background: "#e9415a", color: "#fff", border: "none" }} onClick={() => edit(record)}>Edit</Button>
            )}
          </Space>
        ) : null;
      }
    }
  ]


  const mergcol = col.map((col) => {
    if (!col.editTable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })


  const editCell = ({ editing, dataIndex, title, record, children, ...restProps }) => {
    const input = <Input />
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item name={dataIndex} style={{
            margin: 0
          }} rules={[{ required: true, message: `Please input ${title}` },]}>{input}</Form.Item>
        ) : (children)}
      </td>
    )
  }


  const reset = () => {
    setSortInfo({});
    setFilteredInfo({})
    setSearch("")
    loadData();
  }


  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      loadData();
    }
  }

  const globalSearch = () => {
    filteredData = modify.filter((value) => {
      return (
        value.title.toString().toLowerCase().includes(search, toString().toLowerCase()) ||
        value.des.toString().toLowerCase().includes(search, toString().toLowerCase()) ||
        value.due.toString().toLowerCase().includes(search, toString().toLowerCase()) ||
        value.timestamp.toString().toLowerCase().includes(search, toString().toLowerCase()) ||
        value.tag.toString().toLowerCase().includes(search, toString().toLowerCase()) ||
        value.status.toString().toLowerCase().includes(search, toString().toLowerCase())
      )
    })
    setGridData(filteredData)
  }


  const onAdd = () => {

    const randomNumber = parseInt(Math.random() * 1000);
    const title = Math.random().toString(36).slice(2, 7);
    const tag = ['mandatory', 'personal', 'professional', 'home']
    const status = ['open', 'done', 'overdue', 'working']
    const des = Array(15).fill(null).map(() => Math.random().toString(36).substr(2)).join('')

    var someDate = new Date();
    someDate.setDate(someDate.getDate() + 15);
    var dateFormated = someDate.toISOString().substr(0, 10);

    const newStudent = {
      id: randomNumber,
      timestamp: Date(),
      title: "to-do " + title + " ASAP ",
      des: "description " + des,
      due: dateFormated,
      tag: [tag[(Math.floor(Math.random() * tag.length))]],
      status: status[(Math.floor(Math.random() * status.length))]
    };

    setGridData((pre) => {
      return [...pre, newStudent];
    });
  };


  return (
    <div style={{
      backgroundColor: "#fed0d0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100vh",
      width: "100%"
    }}>
      <div style={{
        margin: 20,
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: " center",
        justifyContent: "center",
        alignContent: "center"
      }}>
        <h6 style={{
          fontFamily: "monospace",
          marginBottom: 40,
          fontSize: "1.5rem",
          fontWeight: 600,
          letterSpacing: "1px",
          border: "none",
          marginRight: 20,
          marginLeft: 20,
          color: "#e9415a"
        }}>
          Ravi's To-Do-App{<HeartOutlined style={{ marginLeft: 7 }} />}
        </h6>

        <Space >
          <Input
            placeholder='enter search value'
            onChange={handleSearch}
            type='text'
            allowClear
            value={search} />
          <Button
            onClick={globalSearch}
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
              background: "#e9415a",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: "1px",
              border: "none"
            }}>
            {<SearchOutlined />}
          </Button>
        </Space>
        <Space
          style={{ marginTop: 20 }}>
          <Button
            onClick={reset}
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
              background: "#e99f",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: "1px",
              border: "none"
            }}>
            {<ReloadOutlined />}Refresh
          </Button>
          <Button
            onClick={onAdd}
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
              background: "#9fa9b2",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: "1px",
              border: "none"
            }}>
            {<PlusOutlined />} Add todo's
          </Button>
        </Space>
      </div>

      <Form form={form} component={false}>
        <ConfigProvider locale={enUSIntl}>

          <ProTable
            search={false}
            columns={mergcol}
            components={{
              body: {
                cell: editCell
              },
            }}
            dataSource={filteredData && filteredData.length ? filteredData : modify}
            bordered
            loading={loading}
            onChange={handleChange}
            scroll={{
              x: 'calc(1000px + 10%)',
              y: 200,
            }}
            style={{
              backgroundColor: "transparent",
              marginLeft: 40,
              marginRight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 60
            }}
            pagination={{ pageSize: 3 }}


          />
        </ConfigProvider>
      </Form>
    </div>
  )
}


export default Main