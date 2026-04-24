import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Card, Typography, Tag, Spin, Tabs, Collapse, Checkbox, Table, Form, Input, InputNumber, Button, message, Space, Popconfirm, Modal } from 'antd';
import axios from 'axios';
import { 
  UserOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  ProfileOutlined,
  TableOutlined,
  UserAddOutlined,
  TagOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons';
const { Title, Text, Paragraph } = Typography;

const Highlighter = ({ text = '', highlight = '' }) => {
  if (!highlight || !highlight.trim() || typeof text !== 'string') {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} className="highlight">{part}</span> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function Candidates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  // Table selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Filter States
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Applied states for "one-time" update
  const [appliedSkills, setAppliedSkills] = useState([]);
  const [appliedStatuses, setAppliedStatuses] = useState([]);
  const [appliedRoles, setAppliedRoles] = useState([]);
  const [appliedLocations, setAppliedLocations] = useState([]);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/data', {
        params: { name: search }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch]);

  const onInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTrigger = (value) => {
    setDebouncedSearch(value || searchTerm);
    // Apply checkbox filters at the same time
    setAppliedSkills(selectedSkills);
    setAppliedStatuses(selectedStatuses);
    setAppliedRoles(selectedRoles);
    setAppliedLocations(selectedLocations);
  };

  // Compute Facets with counts
  const facets = useMemo(() => {
    const skills = {};
    const statuses = {};
    const roles = {};
    const locations = {};

    data.forEach(item => {
      if (item.skills) {
        item.skills.forEach(s => {
          skills[s] = (skills[s] || 0) + 1;
        });
      }
      if (item.status) statuses[item.status] = (statuses[item.status] || 0) + 1;
      if (item.role) roles[item.role] = (roles[item.role] || 0) + 1;
      if (item.location) locations[item.location] = (locations[item.location] || 0) + 1;
    });

    const sortEntries = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

    return {
      skills: sortEntries(skills),
      statuses: sortEntries(statuses),
      roles: sortEntries(roles),
      locations: sortEntries(locations)
    };
  }, [data]);

  // Filter Data locally for facets (Search is handled by API)
  const filteredData = useMemo(() => {
    let result = data;

    // Apply Checkbox Filters (using applied state)
    if (appliedSkills.length > 0) {
      result = result.filter(item => item.skills && item.skills.some(s => appliedSkills.includes(s)));
    }
    if (appliedStatuses.length > 0) {
      result = result.filter(item => appliedStatuses.includes(item.status));
    }
    if (appliedRoles.length > 0) {
      result = result.filter(item => appliedRoles.includes(item.role));
    }
    if (appliedLocations.length > 0) {
      result = result.filter(item => appliedLocations.includes(item.location));
    }

    // Apply Sort
    result = [...result].sort((a, b) => {
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // recent (default from DB order)
    });

    // Apply Local Search (since server returns all data)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(item => 
        item.name?.toLowerCase().includes(lowerSearch) || 
        item.role?.toLowerCase().includes(lowerSearch) ||
        (item.skills && item.skills.some(skill => skill.toLowerCase().includes(lowerSearch))) ||
        item.status?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [data, sortOrder, appliedSkills, appliedStatuses, appliedRoles, appliedLocations, debouncedSearch]);

  const removeFilter = (type, value) => {
    switch (type) {
      case 'skill': 
        setSelectedSkills(prev => prev.filter(v => v !== value));
        setAppliedSkills(prev => prev.filter(v => v !== value)); 
        break;
      case 'status': 
        setSelectedStatuses(prev => prev.filter(v => v !== value));
        setAppliedStatuses(prev => prev.filter(v => v !== value)); 
        break;
      case 'role': 
        setSelectedRoles(prev => prev.filter(v => v !== value));
        setAppliedRoles(prev => prev.filter(v => v !== value)); 
        break;
      case 'location': 
        setSelectedLocations(prev => prev.filter(v => v !== value));
        setAppliedLocations(prev => prev.filter(v => v !== value)); 
        break;
      case 'search': setSearchTerm(''); setDebouncedSearch(''); break;
      default: break;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'INTERVIEWING': return 'status-interviewing';
      case 'APPLIED': return 'status-applied';
      case 'REJECTED': return 'status-rejected';
      case 'OFFERED': return 'status-offered';
      default: return 'status-applied';
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/data/${id}`);
      if (response.status === 200) {
        message.success('Candidate deleted');
        fetchData(debouncedSearch);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to delete');
    }
  };

  const showEditModal = (record) => {
    setEditingCandidate(record);
    editForm.setFieldsValue({
      name: record.name,
      role: record.role,
      location: record.location,
      experience: parseInt(record.experience),
      skills: record.skills ? record.skills.join(', ') : '',
      status: record.status || 'APPLIED'
    });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const skillsArray = values.skills ? values.skills.split(',').map(s => s.trim()) : [];
      const updatedCandidate = { ...values, skills: skillsArray };

      const response = await axios.put(`http://localhost:5000/api/data/${editingCandidate.id}`, updatedCandidate);
      
      if (response.status === 200) {
        message.success('Candidate updated');
        setIsEditModalVisible(false);
        fetchData(debouncedSearch);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to update');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/data/bulk-delete', { ids: selectedRowKeys });
      if (response.status === 200) {
        message.success(`Deleted ${selectedRowKeys.length} candidates`);
        setSelectedRowKeys([]);
        fetchData(debouncedSearch);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to delete candidates');
    }
  };

  const exportCSV = () => {
    const selectedData = filteredData.filter(item => selectedRowKeys.includes(item.id));
    
    const headers = ['Name', 'Role', 'Email', 'Location', 'Experience', 'Status', 'Skills'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(item => 
        `"${item.name || ''}","${item.role || ''}","${item.email || ''}","${item.location || ''}","${item.experience || ''}","${item.status || ''}","${item.skills ? item.skills.join('; ') : ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "candidates_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tableColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Experience', dataIndex: 'experience', key: 'experience' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => <span className={`status-tag ${getStatusClass(status)}`}>{status}</span>
    },
    { 
      title: 'Skills', 
      dataIndex: 'skills', 
      key: 'skills',
      render: (skills) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {skills && skills.map(skill => <Tag key={skill} color="blue">{skill}</Tag>)}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this candidate?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const onFinishAddCandidate = async (values) => {
    setSubmitting(true);
    try {
      const skillsArray = values.skills ? values.skills.split(',').map(s => s.trim()) : [];
      const newCandidate = { ...values, skills: skillsArray };

      const response = await axios.post('http://localhost:5000/api/data', newCandidate);
      
      if (response.status === 201) {
        message.success('Candidate added successfully!');
        form.resetFields();
        fetchData(debouncedSearch); 
        setActiveTab('1'); 
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to add candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ProfileOutlined /> Results
        </span>
      ),
    },
    {
      key: '2',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TableOutlined /> Data Table
        </span>
      ),
    },
    {
      key: '3',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserAddOutlined /> Add Candidate
        </span>
      ),
    }
  ];

  const customPanelStyle = {
    background: 'transparent',
    borderBottom: '1px solid #f1f5f9',
    padding: '0.5rem 0'
  };

  const collapseItems = [
    {
      key: '1',
      label: <span style={{ fontWeight: 500, color: '#0f172a' }}><TagOutlined className="sidebar-icon" /> Skills</span>,
      style: customPanelStyle,
      children: (
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px' }}
          value={selectedSkills}
          onChange={setSelectedSkills}
        >
          {facets.skills.map(([skill, count]) => (
            <Checkbox key={skill} value={skill}>
              <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{skill}</span>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>({count})</Text>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      )
    },
    {
      key: '2',
      label: <span style={{ fontWeight: 500, color: '#0f172a' }}><CheckCircleOutlined className="sidebar-icon" /> Status</span>,
      style: customPanelStyle,
      children: (
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px' }}
          value={selectedStatuses}
          onChange={setSelectedStatuses}
        >
          {facets.statuses.map(([status, count]) => (
            <Checkbox key={status} value={status}>
              <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{status}</span>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>({count})</Text>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      )
    },
    {
      key: '3',
      label: <span style={{ fontWeight: 500, color: '#0f172a' }}><IdcardOutlined className="sidebar-icon" /> Roles</span>,
      style: customPanelStyle,
      children: (
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px' }}
          value={selectedRoles}
          onChange={setSelectedRoles}
        >
          {facets.roles.map(([role, count]) => (
            <Checkbox key={role} value={role}>
              <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{role}</span>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>({count})</Text>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      )
    },
    {
      key: '4',
      label: <span style={{ fontWeight: 500, color: '#0f172a' }}><EnvironmentOutlined className="sidebar-icon" /> Locations</span>,
      style: { ...customPanelStyle, borderBottom: 'none' },
      children: (
        <Checkbox.Group 
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px' }}
          value={selectedLocations}
          onChange={setSelectedLocations}
        >
          {facets.locations.map(([location, count]) => (
            <Checkbox key={location} value={location}>
              <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{location}</span>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>({count})</Text>
              </span>
            </Checkbox>
          ))}
        </Checkbox.Group>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <Input.Search 
            placeholder="Search candidates by name, skills, or roles..." 
            value={searchTerm}
            onChange={onInputChange}
            onSearch={handleSearchTrigger}
            enterButton
            allowClear
            size="large"
            style={{ borderRadius: '12px' }}
          />
        </div>
      </div>

      <main className="layout-container" style={{ marginTop: '2rem' }}>
        <aside className="facet-sidebar">
          <Title level={3} style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Filters</Title>
          <Collapse 
            ghost 
            expandIconPlacement="end" 
            items={collapseItems} 
            defaultActiveKey={['1']} 
          />
        </aside>

        <section className="results-area">
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Spin size="large" tip="Loading candidates..." />
            </div>
          ) : (
            <>
              {activeTab === '1' && (
                <>
                  {/* Active Filter Tags */}
                  <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {debouncedSearch && (
                      <Tag closable onClose={() => removeFilter('search')} color="indigo">
                        Search: {debouncedSearch}
                      </Tag>
                    )}
                    {appliedSkills.map(skill => (
                      <Tag key={skill} closable onClose={() => removeFilter('skill', skill)} color="blue">
                        Skill: {skill}
                      </Tag>
                    ))}
                    {appliedStatuses.map(status => (
                      <Tag key={status} closable onClose={() => removeFilter('status', status)} color="cyan">
                        Status: {status}
                      </Tag>
                    ))}
                    {appliedRoles.map(role => (
                      <Tag key={role} closable onClose={() => removeFilter('role', role)} color="geekblue">
                        Role: {role}
                      </Tag>
                    ))}
                    {appliedLocations.map(loc => (
                      <Tag key={loc} closable onClose={() => removeFilter('location', loc)} color="purple">
                        Location: {loc}
                      </Tag>
                    ))}
                    {(debouncedSearch || appliedSkills.length > 0 || appliedStatuses.length > 0 || appliedRoles.length > 0 || appliedLocations.length > 0) && (
                      <Button type="link" size="small" onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearch('');
                        setSelectedSkills([]);
                        setSelectedStatuses([]);
                        setSelectedRoles([]);
                        setSelectedLocations([]);
                        setAppliedSkills([]);
                        setAppliedStatuses([]);
                        setAppliedRoles([]);
                        setAppliedLocations([]);
                      }}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Text style={{ color: '#475569', fontWeight: 500 }}>
                      Showing {filteredData.length} candidates
                    </Text>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Text strong style={{ color: '#0f172a' }}>Sort By:</Text>
                      <Select
                        defaultValue="recent"
                        variant="borderless"
                        style={{ width: 130, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}
                        onChange={(value) => setSortOrder(value)}
                        options={[
                          { value: 'recent', label: 'Recently Added' },
                          { value: 'name-asc', label: 'Name (A-Z)' },
                        ]}
                      />
                    </div>
                  </div>

                  {filteredData.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {filteredData.map((item, index) => (
                        <Card 
                          key={item.id} 
                          className="candidate-card"
                          styles={{ body: { padding: '1.5rem' } }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
                              <div className="avatar-circle">
                                <UserOutlined />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Title level={4} className="candidate-name">
                                  <Highlighter text={item.name} highlight={debouncedSearch} />
                                </Title>
                                <Paragraph className="candidate-role">
                                  <Highlighter text={item.role} highlight={debouncedSearch} />
                                </Paragraph>
                                <div className="candidate-meta">
                                  <div className="meta-item">
                                    <MailOutlined />
                                    <span>{item.email}</span>
                                  </div>
                                  <div className="meta-item">
                                    <EnvironmentOutlined />
                                    <span>{item.location}</span>
                                  </div>
                                  <div className="meta-item">
                                    <ClockCircleOutlined />
                                    <span>{item.experience}</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                                  {item.skills && item.skills.map((skill, i) => (
                                    <Tag key={i} className="skill-tag">
                                      <Highlighter text={skill} highlight={debouncedSearch} />
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className={`status-tag ${getStatusClass(item.status)}`}>
                                <Highlighter text={item.status} highlight={debouncedSearch} />
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                      <Title level={4} style={{ color: '#475569' }}>No candidates found</Title>
                      <p>Try adjusting your search filters.</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === '2' && (
                <div style={{ marginTop: '1rem', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <Title level={4} style={{ margin: 0 }}>All Candidates Data</Title>
                    <Space size="large">
                      {selectedRowKeys.length > 0 && (
                        <>
                          <Popconfirm title={`Delete ${selectedRowKeys.length} selected candidates?`} onConfirm={handleBulkDelete}>
                            <Button danger icon={<DeleteOutlined />}>Delete Selected ({selectedRowKeys.length})</Button>
                          </Popconfirm>
                          <Button type="primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} icon={<DownloadOutlined />} onClick={exportCSV}>
                            Export CSV ({selectedRowKeys.length})
                          </Button>
                        </>
                      )}
                    </Space>
                  </div>
                  <Table 
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys)
                    }}
                    columns={tableColumns} 
                    dataSource={filteredData} 
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )}

              {activeTab === '3' && (
                <div style={{ marginTop: '1rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Title level={4} style={{ marginBottom: '1.5rem' }}>Add New Candidate</Title>
                  <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinishAddCandidate}
                    style={{ maxWidth: '600px' }}
                  >
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter candidate name' }]}>
                      <Input placeholder="e.g. Jane Doe" size="large" />
                    </Form.Item>
                    
                    <Form.Item name="role" label="Role / Title" rules={[{ required: true, message: 'Please enter role' }]}>
                      <Input placeholder="e.g. Senior Frontend Engineer" size="large" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Form.Item name="location" label="Location" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Input placeholder="e.g. Bengaluru, Chittoor" size="large" />
                      </Form.Item>
                      
                      <Form.Item name="experience" label="Years of Experience" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} max={50} size="large" placeholder="e.g. 5" />
                      </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Form.Item name="skills" label="Skills (comma separated)" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Input placeholder="e.g. Software Developer, Python, Java, React, MongoDB" size="large" />
                      </Form.Item>

                      <Form.Item name="status" label="Status" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Select 
                          size="large" 
                          placeholder="Select Status"
                          options={[
                            { value: 'APPLIED', label: 'Applied' },
                            { value: 'INTERVIEWING', label: 'Interviewing' },
                            { value: 'OFFERED', label: 'Offered' },
                            { value: 'REJECTED', label: 'Rejected' }
                          ]}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" loading={submitting} style={{ backgroundColor: '#4f46e5' }}>
                        Add Candidate
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Modal 
        title="Edit Candidate" 
        open={isEditModalVisible} 
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form 
          form={editForm} 
          layout="vertical" 
          onFinish={handleEditSubmit}
          style={{ marginTop: '1rem' }}
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          
          <Form.Item name="role" label="Role / Title" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Form.Item name="location" label="Location" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            
            <Form.Item name="experience" label="Experience" style={{ flex: 1 }} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} max={50} size="large" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Form.Item name="skills" label="Skills (comma separated)" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item name="status" label="Status" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select 
                size="large"
                options={[
                  { value: 'APPLIED', label: 'Applied' },
                  { value: 'INTERVIEWING', label: 'Interviewing' },
                  { value: 'OFFERED', label: 'Offered' },
                  { value: 'REJECTED', label: 'Rejected' }
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#4f46e5' }}>
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
