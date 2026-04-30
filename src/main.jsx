import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import amis styles
import 'amis/lib/themes/cxd.css'
import 'amis/lib/helper.css'
import 'amis/sdk/iconfont.css'

// Import amis-editor styles
import 'amis-editor-core/lib/style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
