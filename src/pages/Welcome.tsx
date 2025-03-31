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
     <Card>
      hai
      </Card>
    </PageContainer>
  );
};

export default Welcome;
