// src/pages/recommendation/Rules.jsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  message, 
  Tag, 
  Tooltip, 
  Popconfirm,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  QuestionCircleOutlined, 
  ThunderboltOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { 
  fetchRecommendationRules, 
  createRecommendationRule, 
  updateRecommendationRule, 
  deleteRecommendationRule,
  reorderRecommendationRules
} from '@/services/recommendation';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Option } = Select;
const { TextArea } = Input;

// Sortable table row component
const SortableTableRow = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 9999, cursor: 'grabbing', background: '#fafafa' } : {}),
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  );
};

const RecommendationRules = () => {
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [conditionType, setConditionType] = useState('simple');
  const [sortMode, setSortMode] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetchRecommendationRules();
      if (response.code === 200) {
        setRules(response.data);
      } else {
        message.error('Failed to fetch recommendation rules');
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      message.error('An error occurred while loading rules');
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = (rule = null) => {
    setEditingRule(rule);
    if (rule) {
      form.setFieldsValue({
        name: rule.name,
        description: rule.description,
        factor: rule.factor,
        condition_type: rule.condition_type || 'simple',
        condition: rule.condition,
        condition_expression: rule.condition_expression,
        priority: rule.priority,
        weight: rule.weight,
        is_active: rule.is_active === 1,
      });
      setConditionType(rule.condition_type || 'simple');
    } else {
      form.resetFields();
      form.setFieldsValue({
        condition_type: 'simple',
        priority: 100,
        weight: 1.0,
        is_active: true,
      });
      setConditionType('simple');
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      let response;
      if (editingRule) {
        response = await updateRecommendationRule(editingRule.id, formattedValues);
      } else {
        response = await createRecommendationRule(formattedValues);
      }

      if (response.code === 200) {
        message.success(`Rule ${editingRule ? 'updated' : 'created'} successfully`);
        closeDrawer();
        fetchRules();
      } else {
        message.error(response.message || `Failed to ${editingRule ? 'update' : 'create'} rule`);
      }
    } catch (error) {
      console.error(`Error ${editingRule ? 'updating' : 'creating'} rule:`, error);
      message.error(`An error occurred while ${editingRule ? 'updating' : 'creating'} the rule`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecommendationRule(id);
      if (response.code === 200) {
        message.success('Rule deleted successfully');
        fetchRules();
      } else {
        message.error(response.message || 'Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      message.error('An error occurred while deleting the rule');
    }
  };

  const toggleSortMode = () => {
    setSortMode(!sortMode);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = rules.findIndex(item => item.id.toString() === active.id);
      const newIndex = rules.findIndex(item => item.id.toString() === over.id);
      
      const newRules = [...rules];
      const [removed] = newRules.splice(oldIndex, 1);
      newRules.splice(newIndex, 0, removed);
      
      setRules(newRules);
      
      // Update priorities on the server
      try {
        const newPriorities = newRules.map((rule, index) => ({
          id: rule.id,
          priority: (index + 1) * 10
        }));
        
        const response = await reorderRecommendationRules(newPriorities);
        if (response.code !== 200) {
          message.error('Failed to save new rule order');
          fetchRules(); // Refresh to get original order
        }
      } catch (error) {
        console.error('Error reordering rules:', error);
        message.error('An error occurred while reordering rules');
        fetchRules(); // Refresh to get original order
      }
    }
  };

  const columns = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: (a, b) => a.priority - b.priority,
      render: (text, record) => (
        <Space>
          {sortMode && <SortAscendingOutlined style={{ cursor: 'grab', color: '#999' }} />}
          {text}
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {!record.is_active && <Tag color="red">Disabled</Tag>}
        </Space>
      ),
    },
    {
      title: 'Factor',
      dataIndex: 'factor',
      key: 'factor',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Condition',
      dataIndex: 'condition_type',
      key: 'condition_type',
      width: 300,
      render: (type, record) => {
        if (type === 'expression') {
          return (
            <Tooltip title={record.condition_expression}>
              <code style={{ 
                maxWidth: '300px', 
                display: 'inline-block', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {record.condition_expression}
              </code>
            </Tooltip>
          );
        } else {
          return record.condition ? (
            <Tooltip title={`${record.condition.field} ${record.condition.operator} ${record.condition.value}`}>
              <span>
                {record.condition.field} {record.condition.operator} {record.condition.value}
              </span>
            </Tooltip>
          ) : '-';
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showDrawer(record)}
            disabled={sortMode}
          />
          <Popconfirm
            title="Are you sure you want to delete this rule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={sortMode}
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              disabled={sortMode}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Recommendation Rules"
        extra={
          <Space>
            <Button
              type={sortMode ? "primary" : "default"}
              icon={sortMode ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={toggleSortMode}
            >
              {sortMode ? "Save Order" : "Reorder Rules"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showDrawer()}
              disabled={sortMode}
            >
              Add Rule
            </Button>
          </Space>
        }
      >
        {sortMode ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rules.map(item => item.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <Table
                dataSource={rules}
                columns={columns}
                rowKey={record => record.id.toString()}
                pagination={false}
                components={{
                  body: {
                    row: SortableTableRow,
                  },
                }}
              />
            </SortableContext>
          </DndContext>
        ) : (
          <Table
            dataSource={rules}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        )}
      </Card>

      <Drawer
        title={editingRule ? "Edit Recommendation Rule" : "Create Recommendation Rule"}
        width={600}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Rule Name"
            rules={[{ required: true, message: 'Please enter a rule name' }]}
          >
            <Input placeholder="Enter rule name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="factor"
            label="Recommendation Factor"
            rules={[{ required: true, message: 'Please select a factor' }]}
          >
            <Select placeholder="Select factor">
              <Option value="recency">Recency</Option>
              <Option value="relevance">Relevance</Option>
              <Option value="popularity">Popularity</Option>
              <Option value="engagement">User Engagement</Option>
              <Option value="content_quality">Content Quality</Option>
              <Option value="source_trustworthiness">Source Trustworthiness</Option>
              <Option value="personalization">Personalization</Option>
            </Select>
          </Form.Item>

          <Divider>Condition</Divider>

          <Form.Item
            name="condition_type"
            label="Condition Type"
            tooltip="Simple conditions use field-operator-value format. Expression conditions use Python-like syntax."
          >
            <Select 
              placeholder="Select condition type" 
              onChange={(value) => setConditionType(value)}
            >
              <Option value="simple">Simple Condition</Option>
              <Option value="expression">Expression</Option>
            </Select>
          </Form.Item>

          {conditionType === 'simple' ? (
            <Form.Item 
              name="condition" 
              label="Condition"
              tooltip="Defines when this rule should be applied"
            >
              <Input.Group compact>
                <Form.Item
                  name={['condition', 'field']}
                  noStyle
                  rules={[{ required: true, message: 'Field is required' }]}
                >
                  <Select style={{ width: '33%' }} placeholder="Field">
                    <Option value="category">Category</Option>
                    <Option value="source">Source</Option>
                    <Option value="day_of_week">Day of Week</Option>
                    <Option value="hour_of_day">Hour of Day</Option>
                    <Option value="contains_image">Contains Image</Option>
                    <Option value="word_count">Word Count</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['condition', 'operator']}
                  noStyle
                  rules={[{ required: true, message: 'Operator is required' }]}
                >
                  <Select style={{ width: '33%' }} placeholder="Operator">
                    <Option value="=">equals</Option>
                    <Option value="!=">not equals</Option>
                    <Option value=">">greater than</Option>
                    <Option value="<">less than</Option>
                    <Option value=">=">greater than or equal</Option>
                    <Option value="<=">less than or equal</Option>
                    <Option value="in">in</Option>
                    <Option value="not in">not in</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['condition', 'value']}
                  noStyle
                  rules={[{ required: true, message: 'Value is required' }]}
                >
                  <Input style={{ width: '34%' }} placeholder="Value" />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          ) : (
            <Form.Item
              name="condition_expression"
              label="Expression"
              tooltip="Use Python-like expressions with variables: category, source, day_of_week, hour_of_day, etc."
              rules={[
                { 
                  required: conditionType === 'expression', 
                  message: 'Please enter a condition expression' 
                }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="e.g. category == 'technology' and day_of_week in [0, 1, 2, 3, 4]"
              />
            </Form.Item>
          )}

          <Divider>Configuration</Divider>

          <Form.Item
            name="priority"
            label="Priority"
            tooltip="Rules are applied in priority order (lower numbers are applied first)"
            rules={[{ required: true, message: 'Please enter a priority' }]}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="weight"
            label={
              <span>
                Weight
                <Tooltip title="The weight factor to apply to the score when this rule matches">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: 'Please enter a weight' }]}
          >
            <InputNumber 
              min={0.1} 
              max={10} 
              step={0.1} 
              style={{ width: '100%' }} 
              formatter={value => `${value}x`}
              parser={value => value.replace('x', '')}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default RecommendationRules;