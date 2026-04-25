import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, Card, Typography, Tag, Spin, Tabs, Checkbox, Table, Form, Input, InputNumber, Button, Space, Popconfirm, Modal, Row, Col, App } from 'antd';
import axios from 'axios';
import { 
  UserOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  ProfileOutlined,
  TableOutlined,
  UserAddOutlined,
  RocketOutlined,
  TagOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  SearchOutlined,
  LikeOutlined,
  LikeFilled
} from '@ant-design/icons';
import { SKILLS, STATUSES, ROLES, LOCATIONS } from '../constants';

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

const FacetSection = ({ title, icon, options, selected, onChange, allOptions }) => {
  const [expanded, setExpanded] = useState(true);
 
  const displayOptions = useMemo(() => {
    return allOptions.map(opt => {
      // Normalize comparison to handle case differences
      const found = options?.find(o => o._id?.toLowerCase() === opt.toLowerCase());
      return {
        _id: opt,
        count: found ? found.count : 0
      };
    }).sort((a, b) => b.count - a.count);
  }, [options, allOptions]);
 
  return (
    <div className="facet-section-container">
      <div className="facet-section-header" onClick={() => setExpanded(!expanded)}>
        <div className="facet-title-box">
          <span className="facet-icon">{icon}</span>
          <span className="facet-title-text">{title}</span>
        </div>
        <DownOutlined className={`facet-arrow ${expanded ? 'expanded' : ''}`} />
      </div>
 
      <div className={`facet-content-wrapper ${expanded ? 'show' : ''}`}>
        <div className="facet-options-list">
          {displayOptions.map((option) => {
            const isSelected = selected.includes(option._id);
            return (
              <div
                key={option._id}
                className={`facet-option-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  const newSelected = isSelected
                    ? selected.filter((s) => s !== option._id)
                    : [...selected, option._id];
                  onChange(newSelected);
                }}
              >
                <div className="facet-option-left">
                  <Checkbox checked={isSelected} className="facet-checkbox" />
                  <span className="facet-label">{option._id}</span>
                </div>
                {option.count > 0 && (
                  <span className={`facet-count-pill ${isSelected ? 'selected' : ''}`}>
                    {option.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Candidates() {
  const [data, setData] = useState([]);
  const [facets, setFacets] = useState({ skills: [], statuses: [], roles: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Filter States
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/data/facets', {
        params: { 
          q: debouncedSearch,
          skills: selectedSkills,
          status: selectedStatuses,
          role: selectedRoles,
          location: selectedLocations
        }
      });
      setData(response.data.results);
      setFacets({
        skills: response.data.skills || [],
        statuses: response.data.statuses || [],
        roles: response.data.roles || [],
        locations: response.data.locations || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedSkills, selectedStatuses, selectedRoles, selectedLocations]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchTrigger = () => {
    setDebouncedSearch(searchTerm);
  };

  const removeFilter = (type, value) => {
    switch (type) {
      case 'skill': setSelectedSkills(prev => prev.filter(v => v !== value)); break;
      case 'status': setSelectedStatuses(prev => prev.filter(v => v !== value)); break;
      case 'role': setSelectedRoles(prev => prev.filter(v => v !== value)); break;
      case 'location': setSelectedLocations(prev => prev.filter(v => v !== value)); break;
      case 'search': setSearchTerm(''); setDebouncedSearch(''); break;
      default: break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSkills([]);
    setSelectedStatuses([]);
    setSelectedRoles([]);
    setSelectedLocations([]);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/data/${id}`);
      message.success('Candidate deleted');
      fetchData();
    } catch (error) {
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
      await axios.put(`http://localhost:5000/api/data/${editingCandidate.id}`, updatedCandidate);
      message.success('Candidate updated');
      setIsEditModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.post('http://localhost:5000/api/data/bulk-delete', { ids: selectedRowKeys });
      message.success(`Deleted ${selectedRowKeys.length} candidates`);
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      message.error('Failed to delete candidates');
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/data/${id}/like`);
      // Optimistic update
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
      ));
    } catch (error) {
      message.error('Failed to like');
    }
  };

  const onFinishAddCandidate = async (values) => {
    setSubmitting(true);
    try {
      const skillsArray = values.skills ? values.skills.split(',').map(s => s.trim()) : [];
      const newCandidate = { ...values, skills: skillsArray };
      await axios.post('http://localhost:5000/api/data', newCandidate);
      message.success('Candidate added successfully!');
      form.resetFields();
      fetchData(); 
      setActiveTab('1'); 
    } catch (error) {
      message.error('Failed to add candidate.');
    } finally {
      setSubmitting(false);
    }
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
      render: (status) => <span className={`status-tag status-${(status || 'applied').toLowerCase()}`}>{status}</span>
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      render: (likes) => <Tag color="pink">{likes || 0}</Tag>
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

  const tabItems = [
    { key: '1', label: <span className="tab-label"><ProfileOutlined /> Results</span> },
    { key: '2', label: <span className="tab-label"><TableOutlined /> Data table</span> },
    { key: '3', label: <span className="tab-label"><UserAddOutlined /> Add Candidate</span> }
  ];

  const hasAnyFilter = debouncedSearch || selectedSkills.length > 0 || selectedStatuses.length > 0 || selectedRoles.length > 0 || selectedLocations.length > 0;

  return (
    <div className="app-shell">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-container">
          <div className="search-box">
            <Input 
              placeholder="Search by name, skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#6366f1' }} />}
              className="search-input"
            />
            <Button type="primary" onClick={handleSearchTrigger} className="search-button">
              Find Candidates
            </Button>
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="content-layout">
          {/* Sidebar Filters */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2 className="filters-title">Filters</h2>
              {hasAnyFilter && (
                <Text className="clear-all-link" onClick={clearAllFilters}>
                  Clear All
                </Text>
              )}
            </div>
            
            <div className="facet-filters-list">
              <FacetSection
                title="Skills"
                icon={<RocketOutlined />}
                options={facets.skills}
                selected={selectedSkills}
                onChange={setSelectedSkills}
                allOptions={SKILLS}
              />
              <div className="divider" />
              <FacetSection
                title="Status"
                icon={<TagOutlined />}
                options={facets.statuses}
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
                allOptions={STATUSES}
              />
              <div className="divider" />
              <FacetSection
                title="Roles"
                icon={<UserOutlined />}
                options={facets.roles}
                selected={selectedRoles}
                onChange={setSelectedRoles}
                allOptions={ROLES}
              />
              <div className="divider" />
              <FacetSection
                title="Locations"
                icon={<EnvironmentOutlined />}
                options={facets.locations}
                selected={selectedLocations}
                onChange={setSelectedLocations}
                allOptions={LOCATIONS}
              />
            </div>
          </aside>

          {/* Results Area */}
          <div className="results-area">
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="main-tabs" />
            
            {hasAnyFilter && (
              <div className="active-filters-section">
                <Text strong className="active-filters-label">ACTIVE FILTERS:</Text>
                <Space wrap>
                  {debouncedSearch && <Tag closable onClose={() => removeFilter('search')} className="active-filter-tag">{debouncedSearch}</Tag>}
                  {selectedSkills.map(s => <Tag key={s} closable onClose={() => removeFilter('skill', s)} className="active-filter-tag">{s}</Tag>)}
                  {selectedStatuses.map(s => <Tag key={s} closable onClose={() => removeFilter('status', s)} className="active-filter-tag">{s}</Tag>)}
                  {selectedRoles.map(s => <Tag key={s} closable onClose={() => removeFilter('role', s)} className="active-filter-tag">{s}</Tag>)}
                  {selectedLocations.map(s => <Tag key={s} closable onClose={() => removeFilter('location', s)} className="active-filter-tag">{s}</Tag>)}
                </Space>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <Spin size="large" tip="Finding candidates..." />
              </div>
            ) : (
              <div className="tab-content">
                {activeTab === '1' && (
                  <>
                    <div className="results-header">
                      <Text strong className="results-count">{data.length} candidates found</Text>
                      <div className="sort-box">
                        <Text strong style={{ color: '#64748b' }}>Sort By:</Text>
                        <Select
                          defaultValue="recent"
                          variant="borderless"
                          className="sort-select"
                          onChange={setSortOrder}
                          options={[
                            { value: 'recent', label: 'Recent' },
                            { value: 'name-asc', label: 'Name (A-Z)' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="candidate-list">
                      {data.map((item) => (
                        <Card key={item.id} className={`candidate-card card-${item.status}`} styles={{ body: { padding: '1.5rem' } }}>
                          <div className="card-flex">
                            <div className="avatar-section">
                              <div className="avatar-circle">
                                <UserOutlined />
                              </div>
                            </div>
                            <div className="info-section">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <Title level={4} className="name">
                                    <Highlighter text={item.name} highlight={debouncedSearch} />
                                  </Title>
                                  <Paragraph className="role">
                                    <Highlighter text={item.role} highlight={debouncedSearch} />
                                  </Paragraph>
                                </div>
                                <span className={`status-tag status-${(item.status || '').toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </div>
                              
                              <div className="meta">
                                <span className="meta-item"><MailOutlined /> {item.email}</span>
                                <span className="meta-item"><EnvironmentOutlined /> {item.location}</span>
                                <span className="meta-item"><ClockCircleOutlined /> {item.experience}</span>
                              </div>
                              
                              <div className="skills-tags">
                                {item.skills.map((skill, i) => (
                                  <Tag key={i} className="skill-tag">
                                    <Highlighter text={skill} highlight={debouncedSearch} />
                                  </Tag>
                                ))}
                              </div>
                            </div>
                            
                            <div className="like-section" onClick={() => handleLike(item.id)}>
                              <Button 
                                type="text" 
                                icon={item.likes > 0 ? <LikeFilled style={{ color: '#e11d48' }} /> : <LikeOutlined />} 
                                className={`like-button ${item.likes > 0 ? 'liked' : ''}`}
                              >
                                {item.likes || 0}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {data.length === 0 && (
                        <div className="empty-state">
                          <Title level={4}>No candidates found</Title>
                          <p>Try adjusting your search or filters.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === '2' && (
                  <div className="table-container">
                    <Table 
                      rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                      columns={tableColumns} 
                      dataSource={data} 
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                    {selectedRowKeys.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Button danger onClick={handleBulkDelete}>Delete Selected</Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === '3' && (
                  <div className="form-container">
                    <Title level={4} style={{ marginBottom: '1.5rem' }}>Add New Candidate</Title>
                    <Form form={form} layout="vertical" onFinish={onFinishAddCandidate} style={{ maxWidth: '600px' }}>
                      <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                      <Form.Item name="role" label="Role / Title" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="location" label="Location" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="experience" label="Experience" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}><Form.Item name="skills" label="Skills (comma separated)" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
                        <Col span={12}>
                          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                            <Select size="large" options={[{ value: 'APPLIED', label: 'Applied' }, { value: 'INTERVIEWING', label: 'Interviewing' }, { value: 'OFFERED', label: 'Offered' }, { value: 'REJECTED', label: 'Rejected' }, { value: 'HIRED', label: 'Hired' }]} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item><Button type="primary" htmlType="submit" size="large" loading={submitting} className="submit-button" style={{ width: '100%' }}>Add Candidate</Button></Form.Item>
                    </Form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal title="Edit Candidate" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: '1rem' }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <Form.Item name="role" label="Role / Title" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="location" label="Location" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
            <Col span={12}><Form.Item name="experience" label="Experience" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="skills" label="Skills" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select size="large" options={[{ value: 'APPLIED', label: 'Applied' }, { value: 'INTERVIEWING', label: 'Interviewing' }, { value: 'OFFERED', label: 'Offered' }, { value: 'REJECTED', label: 'Rejected' }, { value: 'HIRED', label: 'Hired' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginTop: '1rem' }}>
            <Space><Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button><Button type="primary" htmlType="submit">Save Changes</Button></Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
