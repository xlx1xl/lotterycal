# LotteryCal - 足球彩票凯利计算器

一个基于 **凯利公式（Kelly Criterion）** 的足球彩票投注分析工具，帮助用户做出更理性的投注决策。

## 功能特性

### 核心功能
- **赔率文件解析**：自动解析 `odd.txt` 格式的赔率数据文件
- **凯利公式计算**：基于概率和赔率计算最优投注比例
- **期望价值分析**：识别正EV（期望价值）投注机会
- **单关推荐**：为每场比赛生成单关投注建议
- **串关组合**：自动生成2串1、3串1等串关组合推荐
- **投注单导出**：支持导出CSV格式投注单，方便记录和分析

### 支持的投注类型
| 类型 | 说明 |
|------|------|
| 胜平负 | 主胜、平局、客胜三种结果 |
| 比分 | Top 3 最可能比分 |
| 总进球 | 2球、3球、4球等进球数预测 |

### 凯利模式
| 模式 | 倍数 | 说明 |
|------|------|------|
| 全凯利 | 1x | 理论最优，风险较高 |
| 半凯利 | 0.5x | 平衡收益与风险（推荐） |
| 四分之一凯利 | 0.25x | 保守策略，降低波动 |

## 输入数据格式

项目使用 `odd.txt` 文件作为赔率数据输入，格式如下：

```json
{
  "match_info": {
    "league": "芬兰超级联赛",
    "home_team": "塞伊奈约基",
    "away_team": "古比斯",
    "match_time": "2026-07-18 22:00"
  },
  "probabilities": {
    "win": 0.30,
    "odds": 2.98,
    "draw": 0.29,
    "odds": 3.64,
    "loss": 0.41,
    "odds": 2.15
  },
  "top_three_scores": [
    {
      "score": "1-1",
      "probability": 0.12,
      "odds": 6.50
    },
    {
      "score": "1-2",
      "probability": 0.10,
      "odds": 9.00
    },
    {
      "score": "2-1",
      "probability": 0.08,
      "odds": 11.00
    }
  ],
  "top_total_goals": [
    {
      "goals": 2,
      "probability": 0.26,
      "odds": 3.40
    },
    {
      "goals": 3,
      "probability": 0.24,
      "odds": 3.90
    },
    {
      "goals": 4,
      "probability": 0.14,
      "odds": 5.50
    }
  ]
}
```

### 字段说明

#### match_info - 比赛信息
| 字段 | 类型 | 说明 |
|------|------|------|
| league | string | 联赛名称 |
| home_team | string | 主队名称 |
| away_team | string | 客队名称 |
| match_time | string | 比赛时间 |

#### probabilities - 胜平负概率与赔率
| 字段 | 类型 | 说明 |
|------|------|------|
| win | number | 主胜概率（0-1） |
| draw | number | 平局概率（0-1） |
| loss | number | 客胜概率（0-1） |
| odds | number | 对应赔率 |

#### top_three_scores - 最可能比分
| 字段 | 类型 | 说明 |
|------|------|------|
| score | string | 比分（如 "1-1"） |
| probability | number | 该比分概率 |
| odds | number | 该比分赔率 |

#### top_total_goals - 总进球数
| 字段 | 类型 | 说明 |
|------|------|------|
| goals | number | 进球数 |
| probability | number | 该进球数概率 |
| odds | number | 该进球数赔率 |

### 多场比赛支持

文件中可以包含多个JSON对象，每个对象代表一场比赛：

```json
{ "match_info": {...}, "probabilities": {...}, ... }
{ "match_info": {...}, "probabilities": {...}, ... }
{ "match_info": {...}, "probabilities": {...}, ... }
```

## 凯利公式说明

### 公式
```
f* = (p × o - 1) / (o - 1)
```

其中：
- `f*` = 最优投注比例
- `p` = 获胜概率
- `o` = 赔率（十进制）

### 期望价值（EV）
```
EV = p × o - 1
```

- EV > 0：正期望，值得投注
- EV < 0：负期望，不建议投注
- EV = 0：公平赔率

### 建议金额计算
```
建议金额 = max(0, kelly × 倍数 × 总资金) 向下取整为2的倍数
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3 | UI框架 |
| TypeScript | 5.8 | 类型安全 |
| Vite | 6.3 | 构建工具 |
| Tailwind CSS | 3.4 | 样式系统 |
| Zustand | 5.0 | 状态管理 |
| React Router | 7.3 | 路由管理 |
| Lucide React | 0.511 | 图标库 |

## 项目结构

```
lotterycal/
├── public/
│   └── favicon.svg          # 网站图标
├── src/
│   ├── components/          # UI组件
│   │   ├── ControlBar.tsx   # 控制栏（上传、设置）
│   │   ├── Empty.tsx        # 空状态组件
│   │   ├── MatchCard.tsx    # 比赛卡片
│   │   ├── ParlayList.tsx   # 串关列表
│   │   ├── SelectionSummary.tsx  # 选中汇总
│   │   └── SingleBetTable.tsx   # 单关表格
│   ├── hooks/
│   │   └── useTheme.ts      # 主题钩子
│   ├── lib/
│   │   ├── export.ts        # CSV导出功能
│   │   ├── kelly.ts         # 凯利公式计算
│   │   ├── parser.ts        # 赔率文件解析
│   │   ├── sampleData.ts    # 示例数据
│   │   ├── types.ts         # TypeScript类型定义
│   │   └── utils.ts         # 工具函数
│   ├── pages/
│   │   └── Home.tsx         # 主页
│   ├── store/
│   │   └── useBettingStore.ts  # 全局状态管理
│   ├── App.tsx              # 根组件
│   ├── index.css            # 全局样式
│   ├── main.tsx             # 入口文件
│   └── vite-env.d.ts        # Vite类型声明
├── odd.txt                  # 赔率数据文件
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── tailwind.config.js       # Tailwind配置
└── vite.config.ts           # Vite配置
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 类型检查
```bash
npm run check
```

### 代码检查
```bash
npm run lint
```

## 使用说明

1. **准备数据文件**：按照上述格式准备 `odd.txt` 文件
2. **上传文件**：点击右上角「上传 odd.txt」按钮
3. **查看分析**：
   - 比赛数据卡片：显示各场比赛的概率和赔率
   - 单关推荐：按凯利值排序的投注建议
   - 串关推荐：自动生成的串关组合
4. **选择投注**：点击添加到投注单
5. **设置参数**：
   - 输入总资金
   - 选择凯利模式
6. **导出投注单**：点击导出CSV文件

## 核心算法

### 串关生成策略
1. 每场比赛选取凯利值最高的正EV选项（最多2个）
2. 生成2串1到3串1的组合
3. 排除同一场比赛的重复组合
4. 仅保留组合凯利 > 0 的结果
5. 按凯利值降序排列，取前12个推荐

### 建议金额取整
- 向下取整为2的倍数，便于实际投注
- 例：计算结果为37.5 → 建议投注36元

## 注意事项

- 本工具仅供参考，不构成投注建议
- 彩票投注存在风险，请理性参与
- 凯利公式基于概率估计的准确性
- 建议结合多方信息做决策

## 许可证

Private - 仅供个人使用
