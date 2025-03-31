// src/components/JsonViewer/index.jsx
import React, { useState } from 'react';
import { Tree, Typography, Switch, Space, Input, Card } from 'antd';
import { DownOutlined, CopyOutlined, SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

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
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [showDataTypes, setShowDataTypes] = useState(displayDataTypes);
  
  // 定义不同主题的颜色
  const colors = {
    light: {
      string: '#008000',
      number: '#0000ff',
      boolean: '#b22222',
      null: '#808080',
      key: '#a52a2a',
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
        <Text style={{ color: currentTheme.key }}>
          {typeof key === 'number' ? `[${key}]` : key}
        </Text>
      );
      
      const valueContent = isObject ? (
        <Text style={{ color }}>
          {display}
        </Text>
      ) : (
        <Text style={{ color }}>
          {display}
          {showDataTypes && <Text style={{ color: '#888', marginLeft: 4 }}>{`(${type})`}</Text>}
        </Text>
      );
      
      const nodeTitle = (
        <span>
          {keyContent}
          {isObject ? ' : ' : ' : '}
          {valueContent}
          {enableClipboard && (
            <CopyOutlined 
              style={{ marginLeft: 8, color: '#888', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                const textToCopy = isObject ? JSON.stringify(value) : String(value);
                navigator.clipboard.writeText(textToCopy);
              }}
            />
          )}
        </span>
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
  
  return (
    <Card
      title="JSON Viewer"
      bordered={true}
      style={{ background: currentTheme.background }}
      bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
      extra={
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Switch
            checkedChildren="显示类型"
            unCheckedChildren="隐藏类型"
            checked={showDataTypes}
            onChange={setShowDataTypes}
          />
        </Space>
      }
    >
      <Tree
        showLine
        switcherIcon={<DownOutlined />}
        defaultExpandAll={!collapsed}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        treeData={treeData}
      />
    </Card>
  );
};

export default JsonViewer;