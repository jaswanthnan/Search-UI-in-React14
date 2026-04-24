import React from 'react';
import Candidates from './pages/Candidates';
import { ConfigProvider, App as AntdApp } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5', // Indigo for active states like "INTERVIEWING" and buttons
          fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
          colorBgContainer: '#ffffff',
          colorBorder: '#e2e8f0',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <Candidates />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
