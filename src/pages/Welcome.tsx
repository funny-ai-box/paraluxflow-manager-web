import { PageContainer } from '@ant-design/pro-components';

import { Card, theme } from 'antd';
import React from 'react';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */

const Welcome: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <PageContainer>
      <Card style={{ marginBottom: 16 }}>
        <h1 style={{ color: token.colorPrimary }}>欢迎来到 ParaluxFlow 管理平台</h1>
        <p>这是一个帮助您管理和监控系统的工具。</p>
      </Card>
      <Card>
        <h2>快速开始</h2>
        <ul>
          <li>查看系统状态</li>
          <li>管理用户和权限</li>
          <li>配置系统设置</li>
        </ul>
      </Card>
      <Card>
        <h2>关于我们</h2>
        <p>ParaluxFlow 是一个专注于提升企业效率的管理平台，致力于为用户提供高效、便捷的解决方案。</p>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
