import { message, notification } from 'antd';

// 已配置好的消息函数
export const showMessage = {
  success: (content, duration) => message.success(content, duration),
  error: (content, duration) => message.error(content, duration),
  warning: (content, duration) => message.warning(content, duration),
  info: (content, duration) => message.info(content, duration)
};

// 已配置好的通知函数
export const showNotification = {
  success: (message, description, options) => 
    notification.success({ message, description, ...options }),
  error: (message, description, options) => 
    notification.error({ message, description, ...options }),
  warning: (message, description, options) => 
    notification.warning({ message, description, ...options }),
  info: (message, description, options) => 
    notification.info({ message, description, ...options })
};