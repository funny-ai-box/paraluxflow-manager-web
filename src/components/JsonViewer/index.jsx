import React, { useState, useEffect } from 'react';
import { Tree, Typography, Switch, Space, Input, Card, Empty, Tooltip } from 'antd';
import { DownOutlined, CopyOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * 自定义的 JSON 数据查看器
 * 支持树形展示、搜索、复制等功能
 * 
 * @param {Object} props
 * @param {Object|Array} props.src - 要展示的 JSON 数据
 * @param {String} props.theme - 主题：'light' 或 'dark'
 * @param {Boolean} props.collapsed - 是否默认折叠
 * @param {Boolean} props.enableClipboard - 是否启用复制功能
 * @param {Boolean} props.displayDataTypes - 是否显示数据类型
 */
const JsonViewer = ({ 
  src, 
  theme = 'light', 
  collapsed = true,
  enableClipboard = true,
  displayDataTypes = true,
  emptyText = '暂无数据',
  title = 'JSON 数据查看器'
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [showDataTypes, setShowDataTypes] = useState(displayDataTypes);
  
  // 定义不同主题的颜色
  const colors = {
    light: {
      string: '#008000',
      number: '#1677ff',
      boolean: '#fa541c',
      null: '#787878',
      key: '#d46b08',
      background: '#ffffff',
      text: '#000000',
    },
    dark: {
      string: '#7ec699',
      number: '#89ddff',
      boolean: '#f78c6c',
      null: '#c792ea',
      key: '#f07178',
      background: '#292d3e',
      text: '#d4d4d4',
    }
  };
  
  const currentTheme = colors[theme] || colors.light;
  
  // 获取值的类型和颜色
  const getValueDetails = (value) => {
    if (value === null) {
      return { type: 'null', display: 'null', color: currentTheme.null };
    } else if (typeof value === 'string') {
      return { type: 'string', display: `"${value}"`, color: currentTheme.string };
    } else if (typeof value === 'number') {
      return { type: 'number', display: value.toString(), color: currentTheme.number };
    } else if (typeof value === 'boolean') {
      return { type: 'boolean', display: value.toString(), color: currentTheme.boolean };
    } else if (Array.isArray(value)) {
      return { type: 'array', display: `Array(${value.length})`, color: currentTheme.text };
    } else if (typeof value === 'object') {
      const keys = Object.keys(value);
      return { type: 'object', display: `Object{${keys.length}}`, color: currentTheme.text };
    }
    return { type: 'unknown', display: String(value), color: currentTheme.text };
  };
  
  // 转换 JSON 数据为树形结构
  const convertToTreeData = (data, path = '0', level = 0) => {
    if (data === null || data === undefined || typeof data !== 'object') {
      return [];
    }
    
    const result = [];
    
    const entries = Array.isArray(data) 
      ? data.map((item, index) => [index, item]) 
      : Object.entries(data);
    
    entries.forEach(([key, value], index) => {
      const currentPath = `${path}-${index}`;
      const isObject = value !== null && typeof value === 'object';
      const { type, display, color } = getValueDetails(value);
      
      const keyContent = (
        <Text style={{ color: currentTheme.key, fontWeight: '500' }}>
          {typeof key === 'number' ? `[${key}]` : key}
        </Text>
      );
      
      const valueContent = isObject ? (
        <Text style={{ color }}>
          {display}
        </Text>
      ) : (
        <Space>
          <Text style={{ color }}>
            {display}
          </Text>
          {showDataTypes && <Text style={{ color: '#888', fontSize: '12px' }}>{`(${type})`}</Text>}
        </Space>
      );
      
      const nodeTitle = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            {keyContent}
            <span style={{ margin: '0 4px' }}>:</span>
            {valueContent}
          </div>
          {enableClipboard && (
            <Tooltip title="复制">
              <CopyOutlined 
                style={{ marginLeft: 8, color: '#aaa', cursor: 'pointer', fontSize: '14px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const textToCopy = isObject ? JSON.stringify(value, null, 2) : String(value);
                  navigator.clipboard.writeText(textToCopy);
                }}
              />
            </Tooltip>
          )}
        </div>
      );
      
      const treeNode = {
        key: currentPath,
        title: nodeTitle,
        isLeaf: !isObject,
      };
      
      if (isObject) {
        treeNode.children = convertToTreeData(value, currentPath, level + 1);
      }
      
      result.push(treeNode);
    });
    
    return result;
  };
  
  const treeData = convertToTreeData(src);
  
  // 搜索功能
  const onSearch = (value) => {
    setSearchValue(value);
    
    if (!value) {
      setExpandedKeys([]);
      return;
    }
    
    const searchInTree = (nodes, parentKeys = []) => {
      let expandKeys = [];
      
      if (!nodes) return expandKeys;
      
      nodes.forEach(node => {
        // 检查标题中是否包含搜索值
        const nodeTitle = JSON.stringify(node.title);
        if (nodeTitle.toLowerCase().includes(value.toLowerCase())) {
          expandKeys = [...expandKeys, ...parentKeys, node.key];
        }
        
        // 递归搜索子节点
        if (node.children) {
          const childKeys = searchInTree(node.children, [...parentKeys, node.key]);
          expandKeys = [...expandKeys, ...childKeys];
        }
      });
      
      return expandKeys;
    };
    
    const keys = searchInTree(treeData);
    setExpandedKeys([...new Set(keys)]);
  };

  useEffect(() => {
    // 如果不是默认折叠，则展开所有节点
    if (!collapsed) {
      const getAllKeys = (nodes, keys = []) => {
        if (!nodes) return keys;
        
        nodes.forEach(node => {
          keys.push(node.key);
          if (node.children) {
            getAllKeys(node.children, keys);
          }
        });
        
        return keys;
      };
      
      setExpandedKeys(getAllKeys(treeData));
    }
  }, [collapsed, src]);
  
  // 如果没有数据，显示空状态
  if (!src || (Array.isArray(src) && src.length === 0) || (typeof src === 'object' && Object.keys(src).length === 0)) {
    return (
      <Card 
        title={title}
        bordered={true}
        style={{ background: currentTheme.background }}
      >
        <Empty description={emptyText} />
      </Card>
    );
  }
  
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Tooltip title="显示/隐藏数据类型">
              <Switch
                checked={showDataTypes}
                onChange={setShowDataTypes}
                checkedChildren="显示类型"
                unCheckedChildren="隐藏类型"
                size="small"
              />
            </Tooltip>
          </Space>
        </div>
      }
      bordered={true}
      style={{ background: currentTheme.background }}
      bodyStyle={{ 
        maxHeight: '600px', 
        overflow: 'auto',
        padding: '12px 24px'
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          {Array.isArray(src) ? `数组 (${src.length} 项)` : `对象 (${Object.keys(src).length} 个键值对)`}
        </Text>
      </div>
      <Tree
        showLine={{ showLeafIcon: false }}
        switcherIcon={<DownOutlined />}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        treeData={treeData}
        blockNode
      />
    </Card>
  );
};

export default JsonViewer;