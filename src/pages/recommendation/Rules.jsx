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

// 可排序表格行组件
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
        message.error('获取推荐规则失败');
      }
    } catch (error) {
      console.error('获取规则时出错:', error);
      message.error('加载规则时发生错误');
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
        message.success(`规则${editingRule ? '更新' : '创建'}成功`);
        closeDrawer();
        fetchRules();
      } else {
        message.error(response.message || `规则${editingRule ? '更新' : '创建'}失败`);
      }
    } catch (error) {
      console.error(`规则${editingRule ? '更新' : '创建'}时出错:`, error);
      message.error(`规则${editingRule ? '更新' : '创建'}时发生错误`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteRecommendationRule(id);
      if (response.code === 200) {
        message.success('规则删除成功');
        fetchRules();
      } else {
        message.error(response.message || '规则删除失败');
      }
    } catch (error) {
      console.error('删除规则时出错:', error);
      message.error('删除规则时发生错误');
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
      
      // 在服务器上更新优先级
      try {
        const newPriorities = newRules.map((rule, index) => ({
          id: rule.id,
          priority: (index + 1) * 10
        }));
        
        const response = await reorderRecommendationRules(newPriorities);
        if (response.code !== 200) {
          message.error('保存新规则顺序失败');
          fetchRules(); // 刷新以获取原始顺序
        }
      } catch (error) {
        console.error('重新排序规则时出错:', error);
        message.error('重新排序规则时发生错误');
        fetchRules(); // 刷新以获取原始顺序
      }
    }
  };

  const columns = [
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: (a, b) => a.priority - b.priority,
      render: (text) => (
        <Space>
          {sortMode && <SortAscendingOutlined style={{ cursor: 'grab', color: '#999' }} />}
          {text}
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {!record.is_active && <Tag color="red">禁用</Tag>}
        </Space>
      ),
    },
    {
      title: '因子',
      dataIndex: 'factor',
      key: 'factor',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (text) => text.toFixed(2),
    },
    {
      title: '条件',
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
      title: '操作',
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
            title="确定要删除此规则吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
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
        title="推荐规则"
        extra={
          <Space>
            <Button
              type={sortMode ? "primary" : "default"}
              icon={sortMode ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
              onClick={toggleSortMode}
            >
              {sortMode ? "保存顺序" : "重新排序"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showDrawer()}
              disabled={sortMode}
            >
              添加规则
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
        title={editingRule ? "编辑推荐规则" : "创建推荐规则"}
        width={600}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={closeDrawer}>
              取消
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingRule ? '更新' : '创建'}
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
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="输入规则名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="输入描述" />
          </Form.Item>

          <Form.Item
            name="factor"
            label="推荐因子"
            rules={[{ required: true, message: '请选择因子' }]}
          >
            <Select placeholder="选择因子">
              <Option value="recency">最近性</Option>
              <Option value="relevance">相关性</Option>
              <Option value="popularity">流行度</Option>
              <Option value="engagement">用户参与度</Option>
              <Option value="content_quality">内容质量</Option>
              <Option value="source_trustworthiness">来源可信度</Option>
              <Option value="personalization">个性化</Option>
            </Select>
          </Form.Item>

          <Divider>条件</Divider>

          <Form.Item
            name="condition_type"
            label="条件类型"
            tooltip="简单条件使用字段-操作符-值格式。表达式条件使用类似Python的语法。"
          >
            <Select 
              placeholder="选择条件类型" 
              onChange={(value) => setConditionType(value)}
            >
              <Option value="simple">简单条件</Option>
              <Option value="expression">表达式</Option>
            </Select>
          </Form.Item>

          {conditionType === 'simple' ? (
            <Form.Item 
              name="condition" 
              label="条件"
              tooltip="定义何时应用此规则"
            >
              <Input.Group compact>
                <Form.Item
                  name={['condition', 'field']}
                  noStyle
                  rules={[{ required: true, message: '字段是必填项' }]}
                >
                  <Select style={{ width: '33%' }} placeholder="字段">
                    <Option value="category">类别</Option>
                    <Option value="source">来源</Option>
                    <Option value="day_of_week">星期几</Option>
                    <Option value="hour_of_day">小时</Option>
                    <Option value="contains_image">包含图片</Option>
                    <Option value="word_count">字数</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['condition', 'operator']}
                  noStyle
                  rules={[{ required: true, message: '操作符是必填项' }]}
                >
                  <Select style={{ width: '33%' }} placeholder="操作符">
                    <Option value="=">等于</Option>
                    <Option value="!=">不等于</Option>
                    <Option value=">">大于</Option>
                    <Option value="<">小于</Option>
                    <Option value=">=">大于等于</Option>
                    <Option value="<=">小于等于</Option>
                    <Option value="in">包含</Option>
                    <Option value="not in">不包含</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['condition', 'value']}
                  noStyle
                  rules={[{ required: true, message: '值是必填项' }]}
                >
                  <Input style={{ width: '34%' }} placeholder="值" />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          ) : (
            <Form.Item
              name="condition_expression"
              label="表达式"
              tooltip="使用类似Python的表达式，变量包括：category, source, day_of_week, hour_of_day等。"
              rules={[
                { 
                  required: conditionType === 'expression', 
                  message: '请输入条件表达式' 
                }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="例如：category == 'technology' and day_of_week in [0, 1, 2, 3, 4]"
              />
            </Form.Item>
          )}

          <Divider>配置</Divider>

          <Form.Item
            name="priority"
            label="优先级"
            tooltip="规则按优先级顺序应用（数字越小优先级越高）"
            rules={[{ required: true, message: '请输入优先级' }]}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="weight"
            label={
              <span>
                权重
                <Tooltip title="当规则匹配时应用于分数的权重因子">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: '请输入权重' }]}
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
            label="是否启用"
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