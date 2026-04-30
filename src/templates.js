// Pre-built schema templates for quick start
export const templates = [
  {
    id: 'blank',
    name: '空白页面',
    desc: '从零开始创建你的页面',
    icon: '📄',
    tags: ['基础'],
    schema: {
      type: 'page',
      title: '我的页面',
      body: [
        {
          type: 'tpl',
          tpl: '<div style="text-align:center;padding:60px;color:#999;"><h2>👋 开始编辑你的页面</h2><p>在左侧面板中拖拽组件到此处</p></div>'
        }
      ]
    }
  },
  {
    id: 'form-basic',
    name: '基础表单',
    desc: '包含常用表单组件的页面模板',
    icon: '📋',
    tags: ['表单', '常用'],
    schema: {
      type: 'page',
      title: '用户信息表单',
      body: [
        {
          type: 'form',
          title: '用户信息录入',
          mode: 'horizontal',
          body: [
            {
              type: 'input-text',
              name: 'username',
              label: '用户名',
              placeholder: '请输入用户名',
              required: true
            },
            {
              type: 'input-email',
              name: 'email',
              label: '邮箱',
              placeholder: '请输入邮箱地址',
              required: true
            },
            {
              type: 'input-password',
              name: 'password',
              label: '密码',
              placeholder: '请输入密码'
            },
            {
              type: 'select',
              name: 'role',
              label: '角色',
              options: [
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
                { label: '访客', value: 'guest' }
              ]
            },
            {
              type: 'switch',
              name: 'active',
              label: '是否启用',
              value: true
            },
            {
              type: 'textarea',
              name: 'remark',
              label: '备注',
              placeholder: '请输入备注信息'
            }
          ],
          actions: [
            {
              type: 'submit',
              label: '提交',
              level: 'primary'
            },
            {
              type: 'reset',
              label: '重置'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'crud-table',
    name: 'CRUD 数据表格',
    desc: '包含增删改查功能的数据表格',
    icon: '📊',
    tags: ['表格', 'CRUD', '常用'],
    schema: {
      type: 'page',
      title: '数据管理',
      body: [
        {
          type: 'crud',
          syncLocation: false,
          headerToolbar: [
            {
              type: 'button',
              label: '新增',
              level: 'primary',
              actionType: 'dialog',
              dialog: {
                title: '新增记录',
                body: {
                  type: 'form',
                  body: [
                    { type: 'input-text', name: 'name', label: '名称', required: true },
                    { type: 'input-text', name: 'description', label: '描述' },
                    { type: 'select', name: 'status', label: '状态', options: [
                      { label: '正常', value: 'active' },
                      { label: '禁用', value: 'disabled' }
                    ]}
                  ]
                }
              }
            },
            'bulkActions',
            'pagination'
          ],
          columns: [
            { name: 'id', label: 'ID', sortable: true },
            { name: 'name', label: '名称', searchable: true },
            { name: 'description', label: '描述' },
            {
              name: 'status', label: '状态',
              type: 'mapping',
              map: { active: "<span class='label label-success'>正常</span>", disabled: "<span class='label label-danger'>禁用</span>" }
            },
            { name: 'createdAt', label: '创建时间', sortable: true },
            {
              type: 'operation',
              label: '操作',
              buttons: [
                { type: 'button', label: '编辑', level: 'link', actionType: 'dialog', dialog: {
                  title: '编辑',
                  body: {
                    type: 'form',
                    body: [
                      { type: 'input-text', name: 'name', label: '名称' },
                      { type: 'input-text', name: 'description', label: '描述' }
                    ]
                  }
                }},
                { type: 'button', label: '删除', level: 'link', className: 'text-danger', actionType: 'ajax', confirmText: '确定要删除吗？' }
              ]
            }
          ],
          data: {
            items: [
              { id: 1, name: '示例项目 A', description: '这是第一个示例', status: 'active', createdAt: '2025-01-15' },
              { id: 2, name: '示例项目 B', description: '这是第二个示例', status: 'active', createdAt: '2025-02-20' },
              { id: 3, name: '示例项目 C', description: '这是第三个示例', status: 'disabled', createdAt: '2025-03-10' }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'dashboard',
    name: '数据看板',
    desc: '包含统计卡片和图表的看板页面',
    icon: '📈',
    tags: ['看板', '图表'],
    schema: {
      type: 'page',
      title: '数据概览',
      body: [
        {
          type: 'grid',
          columns: [
            {
              body: {
                type: 'card',
                header: { title: '总用户数', subTitle: '较昨日 +12%' },
                body: { type: 'tpl', tpl: '<div style="font-size:32px;font-weight:700;color:#6366f1;">12,580</div>' }
              }
            },
            {
              body: {
                type: 'card',
                header: { title: '活跃用户', subTitle: '较昨日 +5.3%' },
                body: { type: 'tpl', tpl: '<div style="font-size:32px;font-weight:700;color:#10b981;">8,234</div>' }
              }
            },
            {
              body: {
                type: 'card',
                header: { title: '订单总数', subTitle: '较昨日 +8.1%' },
                body: { type: 'tpl', tpl: '<div style="font-size:32px;font-weight:700;color:#f59e0b;">3,456</div>' }
              }
            },
            {
              body: {
                type: 'card',
                header: { title: '营收(万)', subTitle: '较昨日 +15.2%' },
                body: { type: 'tpl', tpl: '<div style="font-size:32px;font-weight:700;color:#06b6d4;">¥256.8</div>' }
              }
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'grid',
          columns: [
            {
              md: 8,
              body: {
                type: 'card',
                header: { title: '最近7天趋势' },
                body: {
                  type: 'chart',
                  config: {
                    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
                    yAxis: { type: 'value' },
                    series: [
                      { name: '访问量', type: 'line', data: [820, 932, 901, 1034, 1290, 1330, 1320], smooth: true, areaStyle: { opacity: 0.1 } },
                      { name: '订单量', type: 'line', data: [220, 282, 201, 334, 490, 530, 420], smooth: true, areaStyle: { opacity: 0.1 } }
                    ],
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['访问量', '订单量'] }
                  }
                }
              }
            },
            {
              md: 4,
              body: {
                type: 'card',
                header: { title: '用户分布' },
                body: {
                  type: 'chart',
                  config: {
                    series: [{
                      type: 'pie',
                      radius: ['40%', '70%'],
                      data: [
                        { value: 1048, name: '华东' },
                        { value: 735, name: '华南' },
                        { value: 580, name: '华北' },
                        { value: 484, name: '西南' },
                        { value: 300, name: '其他' }
                      ]
                    }],
                    tooltip: { trigger: 'item' }
                  }
                }
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'detail-page',
    name: '详情页面',
    desc: '多栏布局的详情展示页',
    icon: '📑',
    tags: ['详情', '展示'],
    schema: {
      type: 'page',
      title: '订单详情',
      toolbar: [
        { type: 'button', label: '返回列表', level: 'default', actionType: 'link' },
        { type: 'button', label: '编辑', level: 'primary' }
      ],
      body: [
        {
          type: 'property',
          title: '基本信息',
          column: 2,
          items: [
            { label: '订单号', content: 'ORD-2025-00123' },
            { label: '状态', content: { type: 'tag', label: '已完成', color: 'active' } },
            { label: '客户名称', content: '张三' },
            { label: '联系电话', content: '138****5678' },
            { label: '收货地址', content: '北京市海淀区中关村大街1号' },
            { label: '创建时间', content: '2025-03-15 14:30:00' }
          ]
        },
        { type: 'divider' },
        {
          type: 'table',
          title: '商品清单',
          columns: [
            { name: 'product', label: '商品名称' },
            { name: 'price', label: '单价' },
            { name: 'quantity', label: '数量' },
            { name: 'total', label: '小计' }
          ],
          data: {
            items: [
              { product: 'MacBook Pro 14"', price: '¥14,999', quantity: 1, total: '¥14,999' },
              { product: 'AirPods Pro', price: '¥1,999', quantity: 2, total: '¥3,998' }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'login-page',
    name: '登录页面',
    desc: '美观的登录/注册表单',
    icon: '🔐',
    tags: ['登录', '认证'],
    schema: {
      type: 'page',
      body: [
        {
          type: 'wrapper',
          className: 'bg-white p-10',
          style: { maxWidth: '420px', margin: '60px auto', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
          body: [
            {
              type: 'tpl',
              tpl: '<div style="text-align:center;margin-bottom:24px;"><h2 style="font-size:24px;font-weight:700;">欢迎回来</h2><p style="color:#999;margin-top:8px;">请登录您的账户继续</p></div>'
            },
            {
              type: 'form',
              wrapWithPanel: false,
              body: [
                {
                  type: 'input-text',
                  name: 'username',
                  placeholder: '请输入用户名或邮箱',
                  required: true,
                  size: 'full'
                },
                {
                  type: 'input-password',
                  name: 'password',
                  placeholder: '请输入密码',
                  required: true,
                  size: 'full'
                },
                {
                  type: 'checkbox',
                  name: 'remember',
                  label: '记住我'
                },
                {
                  type: 'submit',
                  label: '登 录',
                  level: 'primary',
                  block: true,
                  className: 'mt-4'
                }
              ]
            },
            {
              type: 'tpl',
              tpl: '<div style="text-align:center;margin-top:16px;"><a href="#" style="color:#6366f1;font-size:13px;">忘记密码？</a> | <a href="#" style="color:#6366f1;font-size:13px;">注册新账户</a></div>'
            }
          ]
        }
      ]
    }
  }
];

export default templates;
