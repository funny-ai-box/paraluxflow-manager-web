import {
  fetchRssFeedCrawlerScripts,
  publishRssFeedScript,
  updateRssFeedCrawlerScript,
} from '@/services/rss';
import Editor from '@monaco-editor/react';
import { Button, Col, Divider, Drawer, List, Modal, Row, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const initialCode = `
import re
from bs4 import BeautifulSoup

def process_data(raw_html):
    html_content = ""
    text_content = ""
    # 在此处添加你的代码
    return html_content, text_content
`;

export default function CodeEditorDrawer({ isVisible, onClose, feedId }) {
  const [scripts, setScripts] = useState([]);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [isScriptChanged, setIsScriptChanged] = useState(false);
  const [isScriptPublished, setIsScriptPublished] = useState(false);

  const fetchScripts = async () => {
    setLoading(true);
    const result = await fetchRssFeedCrawlerScripts(feedId);
    setLoading(false);
    if (result['code'] === 200) {
      let fetchedScripts = result['data'];
      if (fetchedScripts.length === 0) {
        fetchedScripts = [{ feed_id: feedId, script: initialCode.trim(), isNew: true }];
        setSelectedScriptIndex(0);
        setEditable(true);
        setIsScriptPublished(false);
      } else {
        setSelectedScriptIndex(0);
        setEditable(true);
        setIsScriptPublished(fetchedScripts[0].is_published);
      }
      setScripts(fetchedScripts);
    } else {
      message.error('Failed to fetch scripts or no scripts found');
      setScripts([]);
      setSelectedScriptIndex(-1);
      setEditable(false);
      setIsScriptPublished(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchScripts();
    }
  }, [isVisible]);

  const handleScriptChange = (index) => {
    setSelectedScriptIndex(index);
    setEditable(index === 0);
    setIsScriptChanged(false);
  };
  const handleEditorChange = (value) => {
    if (editable) {
      const updatedScripts = [...scripts];
      updatedScripts[selectedScriptIndex].script = value;
      setScripts(updatedScripts);
      setIsScriptChanged(true);
    }
  };

  const saveScript = async (script) => {
    console.log('Saving script:', script);
    const saveResult = await updateRssFeedCrawlerScript(script);
    return saveResult;
  };

  const handleSave = async () => {
    if (editable && isScriptChanged) {
      const currentScript = scripts[selectedScriptIndex];
      console.log('保存', scripts, selectedScriptIndex);
      const saveResult = await saveScript(currentScript);
      if (saveResult['code'] === 200) {
        message.success('Script saved successfully');
        setIsScriptChanged(false);
        setIsScriptPublished(false); // Assume script is unpublished when modified
        await fetchScripts();
      } else {
        message.error('Failed to save script');
      }
    }
  };

  const handlePublish = async () => {
    if (!isScriptChanged) {
      Modal.confirm({
        zIndex: 9999,

        title: 'Are you sure you want to publish this script?',
        content: 'Once published, the script will be available for use.',
        onOk: async () => {
          console.log('Publishing script:', scripts[selectedScriptIndex]);
          // Placeholder for actual publish API call
          const publishResult = await publishRssFeedScript({ feed_id: feedId });
          if (publishResult['code'] === 200) {
            message.success('Script published successfully');
            setIsScriptPublished(true);
          } else {
            message.error(publishResult['message']);
          }
        },
      });
    } else {
      message.warning('Current script has been modified. Please save before publishing.');
    }
  };
  return (
    <Drawer
      title="Edit Code"
      placement="right"
      closable={true}
      onClose={onClose}
      visible={isVisible}
      zIndex={1000}
      width={1024}
      extra={
        selectedScriptIndex === 0 && (
          <>
            <Button
              style={{ marginRight: 10 }}
              type="primary"
              onClick={handlePublish}
              disabled={isScriptChanged || isScriptPublished}
              danger
            >
              Publish Code
            </Button>
            <Button type="primary" onClick={handleSave} disabled={!isScriptChanged}>
              Save Code
            </Button>
          </>
        )
      }
    >
      <Row gutter={16}>
        <Col span={6}>
          <Spin spinning={loading}>
            <List
              itemLayout="vertical"
              dataSource={scripts}
              renderItem={(script, index) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: index === selectedScriptIndex ? '#f0f0f0' : 'white',
                    paddingLeft: 10,
                  }}
                  onClick={() => handleScriptChange(index)}
                >
                  {script.isNew
                    ? 'New Script'
                    : dayjs(script.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </List.Item>
              )}
            />
          </Spin>
        </Col>
        <Col span={1}>
          <Divider type="vertical" style={{ height: '100%', margin: 0 }} />
        </Col>
        <Col span={17}>
          <Editor
            height="80vh"
            defaultLanguage="python"
            value={scripts.length > 0 ? scripts[selectedScriptIndex]?.script : initialCode}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{ readOnly: !editable }}
          />
        </Col>
      </Row>
    </Drawer>
  );
}
