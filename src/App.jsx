import React, { useState, useCallback, useRef, useEffect } from 'react';
import { render as amisRender } from 'amis';
import axios from 'axios';
import { Editor, ShortcutKey } from 'amis-editor';
import copy from 'copy-to-clipboard';
import { templates } from './templates';

// ====== Amis Env Config ======
// Create axios instance with response adaptor
const request = axios.create();

// 拦截响应：将 { code, data, page } 转换为 amis 期望的 { status, data } 格式
request.interceptors.response.use((response) => {
  const payload = response.data;
  if (payload && typeof payload === 'object' && payload.code !== undefined) {
    // code === 1 表示成功 → amis 的 status 0 表示成功
    const status = payload.code === 1 ? 0 : payload.code;
      console.log('payload.data: ', payload.data);

    if (payload.page && Array.isArray(payload.data)) {
      // 分页列表数据
      response.data = {
        status,
        msg: payload.msg || '',
        data: payload.data,
      };
    } else {
      // 非分页数据
      response.data = {
        status,
        msg: payload.msg || '',
        data: payload.data,
      };
    }
  }
  return response;
});

const amisEnv = {
  theme: 'cxd',
  locale: 'zh-CN',
  fetcher({ url, method, data, config, headers }) {
    config = config || {};
    config.headers = headers || {};
    if (method === 'get') {
      return request.get(url, config);
    } else if (method === 'post') {
      return request.post(url, data, config);
    } else if (method === 'put') {
      return request.put(url, data, config);
    } else if (method === 'patch') {
      return request.patch(url, data, config);
    } else if (method === 'delete') {
      return request.delete(url, config);
    }
    return request(config);
  },
  isCancel(value) {
    return axios.isCancel(value);
  },
  notify(type, msg) {
    if (type === 'error') {
      console.error('[amis]', msg);
    } else {
      console.log('[amis]', msg);
    }
  },
  alert(content) {
    window.alert(content);
  },
  confirm(content) {
    return window.confirm(content);
  },
  copy(content) {
    copy(content);
  },
};

// ====== Toast System ======
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => onRemove(t.id)}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ====== Local Storage Helper ======
const STORAGE_KEY = 'amis-lowcode-pages';

function loadPages() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePages(pages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

// ====== Main App ======
export default function App() {
  // Current mode: 'designer' | 'json' | 'preview' | 'templates'
  const [mode, setMode] = useState('templates');

  // amis-editor preview toggle (within the editor itself)
  const [editorPreview, setEditorPreview] = useState(false);
  
  // Current schema
  const [schema, setSchema] = useState({
    type: 'page',
    title: '我的页面',
    body: [
      {
        type: 'tpl',
        tpl: '<div style="text-align:center;padding:60px;color:#999;"><h2>👋 开始编辑你的页面</h2><p>选择一个模板或开始编辑 JSON</p></div>'
      }
    ]
  });

  // JSON editor text
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  // Page management
  const [pages, setPages] = useState(loadPages);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePageName, setSavePageName] = useState('');
  
  // Preview device
  const [previewDevice, setPreviewDevice] = useState('desktop');
  
  // Toasts
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Show/hide page list
  const [showPageList, setShowPageList] = useState(true);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync JSON text when switching to JSON mode
  useEffect(() => {
    if (mode === 'json') {
      setJsonText(JSON.stringify(schema, null, 2));
      setJsonError('');
    }
  }, [mode]);

  // Handle amis-editor onChange
  const handleEditorChange = useCallback((value) => {
    setSchema(value);
  }, []);

  // Handle JSON text change
  const handleJsonChange = useCallback((e) => {
    const text = e.target.value;
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setSchema(parsed);
      setJsonError('');
    } catch (err) {
      setJsonError(err.message);
    }
  }, []);

  // Apply JSON
  const applyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setSchema(parsed);
      setJsonError('');
      addToast('JSON 配置已应用', 'success');
    } catch (err) {
      setJsonError(err.message);
      addToast('JSON 格式错误', 'error');
    }
  }, [jsonText, addToast]);

  // Format JSON
  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError('');
      addToast('JSON 已格式化', 'success');
    } catch (err) {
      setJsonError(err.message);
    }
  }, [jsonText, addToast]);

  // Copy JSON
  const copyJson = useCallback(() => {
    copy(JSON.stringify(schema, null, 2));
    addToast('JSON 已复制到剪贴板', 'success');
  }, [schema, addToast]);

  // Use template
  const useTemplate = useCallback((template) => {
    setSchema(JSON.parse(JSON.stringify(template.schema)));
    setCurrentPageId(null);
    setMode('json');
    addToast(`已加载模板: ${template.name}`, 'success');
  }, [addToast]);

  // Save page
  const handleSavePage = useCallback(() => {
    if (!savePageName.trim()) return;
    
    const newPage = {
      id: currentPageId || Date.now().toString(),
      name: savePageName.trim(),
      schema: JSON.parse(JSON.stringify(schema)),
      updatedAt: new Date().toLocaleString('zh-CN')
    };

    setPages(prev => {
      const existing = prev.findIndex(p => p.id === newPage.id);
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newPage;
      } else {
        updated = [newPage, ...prev];
      }
      savePages(updated);
      return updated;
    });

    setCurrentPageId(newPage.id);
    setShowSaveModal(false);
    setSavePageName('');
    addToast(`页面 "${newPage.name}" 已保存`, 'success');
  }, [savePageName, currentPageId, schema, addToast]);

  // Load page
  const loadPage = useCallback((page) => {
    setSchema(JSON.parse(JSON.stringify(page.schema)));
    setCurrentPageId(page.id);
    if (mode === 'templates') setMode('json');
    addToast(`已加载: ${page.name}`, 'info');
  }, [mode, addToast]);

  // Delete page
  const deletePage = useCallback((id, e) => {
    e.stopPropagation();
    setPages(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePages(updated);
      return updated;
    });
    if (currentPageId === id) setCurrentPageId(null);
    addToast('页面已删除', 'info');
  }, [currentPageId, addToast]);

  // Export as HTML
  const exportAsHtml = useCallback(() => {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${schema.title || 'Amis Page'}</title>
  <link rel="stylesheet" href="https://unpkg.com/amis@6.3.0/lib/themes/cxd.css"/>
  <link rel="stylesheet" href="https://unpkg.com/amis@6.3.0/lib/helper.css"/>
  <link rel="stylesheet" href="https://unpkg.com/amis@6.3.0/sdk/iconfont.css"/>
  <script src="https://unpkg.com/amis@6.3.0/sdk/sdk.js"><\/script>
  <style>body{margin:0;padding:0;}</style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function(){
      var amis = amisRequire('amis/embed');
      amis.embed('#root', ${JSON.stringify(schema, null, 2)});
    })();
  <\/script>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.title || 'amis-page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('HTML 文件已导出', 'success');
    setShowExportMenu(false);
  }, [schema, addToast]);

  // Export as JSON
  const exportAsJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.title || 'amis-schema'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON 文件已导出', 'success');
    setShowExportMenu(false);
  }, [schema, addToast]);

  // Import JSON
  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          setSchema(parsed);
          setMode('json');
          addToast(`已导入: ${file.name}`, 'success');
        } catch {
          addToast('文件格式错误', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowExportMenu(false);
    if (showExportMenu) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [showExportMenu]);

  // Render amis preview
  const renderAmisPreview = useCallback(() => {
    try {
      return amisRender(schema, {}, amisEnv);
    } catch (err) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>渲染错误</h3>
          <p>{err.message}</p>
        </div>
      );
    }
  }, [schema]);

  const currentPage = pages.find(p => p.id === currentPageId);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">Amis Builder</span>
            <span className="logo-badge">Low-Code</span>
          </div>
          <div className="divider" />
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPageList(!showPageList)}
            title="切换页面列表"
          >
            📁 {showPageList ? '隐藏' : '显示'}页面列表
          </button>
        </div>

        <div className="header-center">
          <div className="mode-tabs">
            <button 
              className={`btn btn-tab ${mode === 'templates' ? 'active' : ''}`}
              onClick={() => setMode('templates')}
            >
              🎨 模板
            </button>
            <button 
              className={`btn btn-tab ${mode === 'designer' ? 'active' : ''}`}
              onClick={() => setMode('designer')}
            >
              🖱️ 设计
            </button>
            <button 
              className={`btn btn-tab ${mode === 'json' ? 'active' : ''}`}
              onClick={() => setMode('json')}
            >
              ⚙️ 配置
            </button>
            <button 
              className={`btn btn-tab ${mode === 'preview' ? 'active' : ''}`}
              onClick={() => setMode('preview')}
            >
              👁️ 预览
            </button>
          </div>
        </div>

        <div className="header-right">
          <button className="btn btn-secondary btn-sm" onClick={importJson}>
            📥 导入
          </button>
          <div className="dropdown-wrapper">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
            >
              📤 导出 ▾
            </button>
            {showExportMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={exportAsJson}>
                  📄 导出为 JSON
                </button>
                <button className="dropdown-item" onClick={exportAsHtml}>
                  🌐 导出为 HTML
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={copyJson}>
                  📋 复制 JSON
                </button>
              </div>
            )}
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSavePageName(currentPage?.name || schema.title || '');
              setShowSaveModal(true);
            }}
          >
            💾 保存
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Page List Sidebar */}
        {showPageList && (
          <div className="page-list-panel">
            <div className="page-list-header">
              <span className="page-list-title">
                <span className="panel-title-dot purple" />
                我的页面 ({pages.length})
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                setSchema({
                  type: 'page',
                  title: '新页面',
                  body: [{ type: 'tpl', tpl: '<p>开始编辑...</p>' }]
                });
                setCurrentPageId(null);
                setMode('json');
              }}>
                ➕ 新建
              </button>
            </div>
            <div className="page-list-items">
              {pages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                  <p style={{ fontSize: '13px' }}>暂无保存的页面</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>从模板开始或新建页面</p>
                </div>
              ) : (
                pages.map(page => (
                  <div 
                    key={page.id} 
                    className={`page-item ${currentPageId === page.id ? 'active' : ''}`}
                    onClick={() => loadPage(page)}
                  >
                    <div>
                      <div className="page-item-name">📄 {page.name}</div>
                      <div className="page-item-date">{page.updatedAt}</div>
                    </div>
                    <div className="page-item-actions">
                      <button 
                        className="page-item-btn delete"
                        onClick={(e) => deletePage(page.id, e)}
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Templates Mode */}
          {mode === 'templates' && (
            <div className="template-gallery fade-enter">
              <div className="template-gallery-header">
                <h2>🎨 选择一个模板开始</h2>
                <p>点击模板卡片快速创建页面，或点击「设计」拖拽构建页面</p>
              </div>
              <div className="template-grid">
                {templates.map(tmpl => (
                  <div key={tmpl.id} className="template-card" onClick={() => useTemplate(tmpl)}>
                    <div className="template-card-preview">
                      {tmpl.icon}
                    </div>
                    <div className="template-card-body">
                      <div className="template-card-title">{tmpl.name}</div>
                      <div className="template-card-desc">{tmpl.desc}</div>
                      <div className="template-card-tags">
                        {tmpl.tags.map(tag => (
                          <span key={tag} className="template-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Drag-and-Drop Designer Mode */}
          {mode === 'designer' && (
            <div className="designer-wrapper fade-enter">
              <div className="designer-toolbar">
                <div className="designer-toolbar-left">
                  <span className="panel-title">
                    <span className="panel-title-dot green" />
                    可视化设计器
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    拖拽左侧组件到画布中构建页面
                  </span>
                </div>
                <div className="designer-toolbar-right">
                  <button
                    className={`btn btn-sm ${editorPreview ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setEditorPreview(!editorPreview)}
                  >
                    {editorPreview ? '🎨 编辑模式' : '👁️ 预览模式'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMode('json')}
                  >
                    ⚙️ 查看 JSON
                  </button>
                </div>
              </div>
              <div className="designer-editor-area">
                <ShortcutKey />
                <Editor
                  value={schema}
                  onChange={handleEditorChange}
                  preview={editorPreview}
                  theme="cxd"
                  locale="zh-CN"
                  className="amis-editor-instance"
                  isMobile={false}
                  autoFocus={false}
                />
              </div>
            </div>
          )}

          {/* JSON Config Mode */}
          {mode === 'json' && (
            <div className="json-editor-panel fade-enter">
              <div className="json-editor-left">
                <div className="panel-header">
                  <span className="panel-title">
                    <span className="panel-title-dot green" />
                    JSON Schema 配置
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={formatJson}>
                      ✨ 格式化
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={copyJson}>
                      📋 复制
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={applyJson}>
                      ▶ 应用
                    </button>
                  </div>
                </div>
                <div className="json-textarea-wrapper">
                  <textarea
                    className={`json-textarea ${jsonError ? 'error' : ''}`}
                    value={jsonText}
                    onChange={handleJsonChange}
                    spellCheck={false}
                    placeholder='{ "type": "page", "body": "Hello World" }'
                  />
                </div>
                {jsonError && (
                  <div className="json-error-msg">
                    ❌ {jsonError}
                  </div>
                )}
              </div>
              <div className="json-editor-right">
                <div className="panel-header">
                  <span className="panel-title">
                    <span className="panel-title-dot blue" />
                    实时预览
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    自动同步
                  </span>
                </div>
                <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
                  <div className="amis-preview-area">
                    {renderAmisPreview()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {mode === 'preview' && (
            <div className="preview-panel fade-enter">
              <div className="preview-toolbar">
                <div className="preview-device-btns">
                  <button 
                    className={`btn btn-tab btn-sm ${previewDevice === 'desktop' ? 'active' : ''}`}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    🖥️ 桌面端
                  </button>
                  <button 
                    className={`btn btn-tab btn-sm ${previewDevice === 'tablet' ? 'active' : ''}`}
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    📱 平板
                  </button>
                  <button 
                    className={`btn btn-tab btn-sm ${previewDevice === 'mobile' ? 'active' : ''}`}
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    📲 手机
                  </button>
                  <span className="device-size-label">
                    {previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px'}
                  </span>
                </div>
                <div className="preview-url-bar">
                  <span className="lock-icon">🔒</span>
                  <span>localhost:5173/preview</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setMode('json')}>
                    ⚙️ 编辑配置
                  </button>
                  <button className="btn btn-success btn-sm" onClick={exportAsHtml}>
                    🚀 导出 HTML
                  </button>
                </div>
              </div>
              <div className="preview-frame-wrapper">
                <div className={`preview-frame ${previewDevice}`}>
                  <div className="preview-frame-inner">
                    <div className="amis-preview-area">
                      {renderAmisPreview()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className="status-indicator">
            <span className="status-dot" />
            <span>就绪</span>
          </div>
          <span>模式: {
            mode === 'templates' ? '模板选择' : 
            mode === 'designer' ? '可视化设计' :
            mode === 'json' ? 'JSON 配置' : 
            '预览'
          }</span>
          {currentPage && <span>当前页面: {currentPage.name}</span>}
        </div>
        <div className="status-right">
          <span>Schema 大小: {(JSON.stringify(schema).length / 1024).toFixed(1)} KB</span>
          <span>Amis Low-Code Builder v1.0</span>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">💾 保存页面</div>
            <input
              className="modal-input"
              value={savePageName}
              onChange={e => setSavePageName(e.target.value)}
              placeholder="请输入页面名称"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSavePage()}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSavePage}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
