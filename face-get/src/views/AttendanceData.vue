<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能考勤管理系统 - 教师端</title>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script> 
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script> 
    <style>
        /* 全局样式 */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,255,136,0.1) 100%);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            color: #2d3748;
        }
 
        /* 卡片容器 */
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            width: 100%;
            max-width: 1200px;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
        }
 
        /* 标题样式 */
        .section-title {
            text-align: center;
            margin-bottom: 1.5rem;
            font-size: 2rem;
            position: relative;
            color: #2d3748;
        }
 
        .section-title::after {
            content: "";
            display: block;
            width: 100px;
            height: 4px;
            background: linear-gradient(to right, #007bff, #00ff88);
            margin: 0.5rem auto 0;
            border-radius: 2px;
        }
 
        /* 表单控件 */
        .form-group {
            display: flex;
            gap: 1rem;
            margin: 1.5rem 0;
            justify-content: center;
            align-items: center;
        }
 
        input, select {
            padding: 0.8rem 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            min-width: 200px;
            transition: all 0.3s;
        }
 
        input:focus, select:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
 
        /* 按钮样式 */
        .btn {
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 30px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
 
        .btn-primary {
            background: #007bff;
        }
 
        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
 
        .btn-info {
            background: #17a2b8;
        }
 
        .btn-info:hover {
            background: #138496;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(23,162,184,0.3);
        }
 
        /* 统计卡片 */
        .stats-panel {
            display: flex;
            gap: 1.5rem;
            margin: 1.5rem 0;
            justify-content: center;
        }
 
        .stat-item {
            flex: 1;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            background: rgba(0,123,255,0.1);
            max-width: 200px;
        }
 
        .stat-item.success  {
            background: rgba(40,167,69,0.1);
        }
 
        .stat-item .count {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #2d3748;
        }
 
        /* 表格样式 */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
 
        .data-table th, .data-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
 
        .data-table th {
            background: #007bff;
            color: white;
            position: sticky;
            top: 0;
            cursor: pointer;
        }
 
        .data-table tr:hover {
            background: rgba(0,123,255,0.05);
        }
 
        /* 图表容器 */
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            width: 100%;
            height: 400px;
            margin: 1.5rem 0;
            position: relative;
        }
 
        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }
            
            .card {
                padding: 1rem;
            }
            
            .form-group {
                flex-direction: column;
                align-items: stretch;
            }
            
            input, select {
                width: 100%;
            }
            
            .stats-panel {
                flex-direction: column;
                align-items: center;
            }
            
            .stat-item {
                max-width: 100%;
                width: 100%;
            }
            
            .data-table {
                display: block;
                overflow-x: auto;
            }
        }
 
        /* 动画效果 */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
 
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }
 
        /* 加载状态 */
        .loading {
            position: relative;
            pointer-events: none;
        }
 
        .loading::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
        }
 
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- 筛选区域 -->
        <div class="card fade-in">
            <h2 class="section-title">考勤记录查询</h2>
            
            <div class="form-group">
                <input type="date" id="start-date" v-model="startDate">
                <input type="date" id="end-date" v-model="endDate">
                <select id="course-select" v-model="selectedCourse">
                    <option value="CS101">计算机科学基础</option>
                    <option value="MATH202">高等数学</option>
                    <option value="ENG105">大学英语</option>
                </select>
            </div>
            
            <div class="stats-panel">
                <div class="stat-item">
                    <span class="count">{{ totalRecords }}</span>
                    <span>总记录数</span>
                </div>
                <div class="stat-item success">
                    <span class="count">{{ attendanceRate }}%</span>
                    <span>平均出勤率</span>
                </div>
            </div>
            
            <div class="form-group">
                <button class="btn btn-primary" @click="loadData" :disabled="isLoading">
                    <span v-if="isLoading">查询中...</span>
                    <span v-else>🔍 查询</span>
                </button>
                <button class="btn btn-info" @click="exportReport">
                    📊 导出Excel 
                </button>
            </div>
        </div>
        
        <!-- 数据表格 -->
        <div class="card fade-in" v-if="attendanceData.length  > 0">
            <h2 class="section-title">考勤明细</h2>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th @click="sortTable('time')">时间 
                            <span v-if="sortField === 'time'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                        </th>
                        <th @click="sortTable('course')">课程名称 
                            <span v-if="sortField === 'course'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                        </th>
                        <th @click="sortTable('total')">应到人数 
                            <span v-if="sortField === 'total'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                        </th>
                        <th @click="sortTable('actual')">实到人数 
                            <span v-if="sortField === 'actual'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                        </th>
                        <th>
                            缺勤名单 
                            <input type="text" placeholder="搜索姓名" v-model="searchTerm" style="margin-left: 0.5rem;">
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in filteredData" :key="index">
                        <td>{{ formatDate(item.time)  }}</td>
                        <td>{{ getCourseName(item.course)  }}</td>
                        <td>{{ item.total  }}</td>
                        <td>{{ item.actual  }}</td>
                        <td>{{ item.absent.join(',  ') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 数据可视化 -->
        <div class="card fade-in" v-if="chartData">
            <h2 class="section-title">考勤统计</h2>
            
            <div class="chart-container">
                <canvas id="attendance-chart" ref="chartCanvas"></canvas>
            </div>
        </div>
    </div>
 
    <script>
        new Vue({
            el: '#app',
            data() {
                return {
                    startDate: '',
                    endDate: '',
                    selectedCourse: 'CS101',
                    attendanceData: [],
                    isLoading: false,
                    sortField: 'time',
                    sortOrder: 'desc',
                    searchTerm: '',
                    chartInstance: null,
                    courses: {
                        'CS101': '计算机科学基础',
                        'MATH202': '高等数学',
                        'ENG105': '大学英语'
                    }
                }
            },
            computed: {
                totalRecords() {
                    return this.attendanceData.length; 
                },
                attendanceRate() {
                    if (this.attendanceData.length  === 0) return 0;
                    const total = this.attendanceData.reduce((sum,  item) => sum + item.total,  0);
                    const actual = this.attendanceData.reduce((sum,  item) => sum + item.actual,  0);
                    return Math.round((actual  / total) * 100);
                },
                filteredData() {
                    let data = [...this.attendanceData]; 
                    
                    // 排序 
                    data.sort((a,  b) => {
                        const fieldA = a[this.sortField];
                        const fieldB = b[this.sortField];
                        
                        if (typeof fieldA === 'string') {
                            return this.sortOrder  === 'asc' 
                                ? fieldA.localeCompare(fieldB) 
                                : fieldB.localeCompare(fieldA); 
                        } else {
                            return this.sortOrder  === 'asc' 
                                ? fieldA - fieldB 
                                : fieldB - fieldA;
                        }
                    });
                    
                    // 搜索过滤 
                    if (this.searchTerm)  {
                        const term = this.searchTerm.toLowerCase(); 
                        data = data.filter(item  => 
                            item.absent.some(name  => 
                                name.toLowerCase().includes(term) 
                            )
                        );
                    }
                    
                    return data;
                },
                chartData() {
                    if (this.attendanceData.length  === 0) return null;
                    
                    const labels = this.attendanceData.map(item  => 
                        `${this.getCourseName(item.course)}\n${this.formatDate(item.time)}` 
                    );
                    
                    return {
                        labels: labels,
                        datasets: [
                            {
                                label: '应到人数',
                                data: this.attendanceData.map(item  => item.total), 
                                backgroundColor: '#007bff',
                                borderColor: '#0056b3',
                                borderWidth: 1 
                            },
                            {
                                label: '实到人数',
                                data: this.attendanceData.map(item  => item.actual), 
                                backgroundColor: '#28a745',
                                borderColor: '#1e7e34',
                                borderWidth: 1 
                            }
                        ]
                    };
                }
            },
            mounted() {
                // 设置默认日期范围（最近7天）
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate()  - 7);
                
                this.startDate  = this.formatDateForInput(start); 
                this.endDate  = this.formatDateForInput(end); 
                
                // 初始加载数据 
                this.loadData(); 
            },
            methods: {
                async loadData() {
                    this.isLoading  = true;
                    
                    try {
                        // 模拟API请求 
                        await new Promise(resolve => setTimeout(resolve, 800));
                        
                        // 模拟数据 
                        this.attendanceData  = [
                            {
                                time: '2023-11-01T08:00:00',
                                course: 'CS101',
                                total: 45,
                                actual: 43,
                                absent: ['张三', '李四']
                            },
                            {
                                time: '2023-11-02T10:00:00',
                                course: 'MATH202',
                                total: 50,
                                actual: 48,
                                absent: ['王五', '赵六']
                            },
                            {
                                time: '2023-11-03T14:00:00',
                                course: 'ENG105',
                                total: 40,
                                actual: 38,
                                absent: ['钱七', '孙八']
                            }
                        ];
                        
                        // 渲染图表 
                        this.renderChart(); 
                    } catch (error) {
                        console.error(' 数据加载失败:', error);
                    } finally {
                        this.isLoading  = false;
                    }
                },
                
                renderChart() {
                    if (this.chartInstance)  {
                        this.chartInstance.destroy(); 
                    }
                    
                    const ctx = this.$refs.chartCanvas.getContext('2d'); 
                    this.chartInstance  = new Chart(ctx, {
                        type: 'bar',
                        data: this.chartData, 
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: '人数'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: '课程/时间'
                                    }
                                }
                            },
                            onClick: (e, elements) => {
                                if (elements.length  > 0) {
                                    const index = elements[0].index;
                                    console.log(' 点击了:', this.attendanceData[index]); 
                                }
                            }
                        }
                    });
                },
                
                sortTable(field) {
                    if (this.sortField  === field) {
                        this.sortOrder  = this.sortOrder  === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.sortField  = field;
                        this.sortOrder  = 'asc';
                    }
                },
                
                exportReport() {
                    // 模拟导出功能 
                    console.log(' 导出数据:', this.attendanceData); 
                    alert('导出功能将在实际项目中实现');
                },
                
                getCourseName(code) {
                    return this.courses[code]  || code;
                },
                
                formatDate(dateStr) {
                    const date = new Date(dateStr);
                    return date.toLocaleString('zh-CN',  {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(/\//g, '-');
                },
                
                formatDateForInput(date) {
                    const year = date.getFullYear(); 
                    const month = String(date.getMonth()  + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2,  '0');
                    return `${year}-${month}-${day}`;
                }
            },
            watch: {
                chartData() {
                    if (this.chartData)  {
                        this.$nextTick(() => {
                            this.renderChart(); 
                        });
                    }
                }
            }
        });
    </script>
</body>
</html>