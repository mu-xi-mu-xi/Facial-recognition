<template>
  <div class="webrtc-container">
    <div class="camera-wrapper">
      <h2 class="system-title">课堂智能考勤系统</h2>
      
      <!-- 视频采集区域 -->
      <div class="video-container">
        <video 
          id="myVideo"
          class="video-feed"
          muted 
          loop 
          playsinline 
          disablePictureInPicture 
          @loadedmetadata="fnRun"
        ></video>
        <canvas id="myCanvas" class="recognition-overlay" />
      </div>
 
      <!-- 实时统计面板 -->
      <div class="stats-panel">
        <div class="stat-item success">
          <span class="count">{{ stats.recognized  }}</span>
          <span>已识别</span>
        </div>
      </div>
 
      <!-- 操作控制台 -->
      <div class="control-panel">
        <button class="btn-primary" @click="fnOpen">
          <i class="icon-camera">📷</i>
          启动识别系统 
        </button>
        <button class="btn-info" @click="viewAttendanceData" :disabled="isNavigating">
          <i class="icon-data">📊</i>
          {{ isNavigating ? '跳转中...' : '查看考勤数据' }}
        </button>
        <button class="btn-secondary" @click="fnClose">
          <i class="icon-power">⏻</i>
          结束服务 
        </button>
      </div>
 
      <!-- 识别结果列表 -->
      <div class="result-panel">
        <div class="result-header">
          <h3>实时识别结果</h3>
          <span class="status-indicator" :class="{ active: isRecognizing }"></span>
        </div>
        <div class="result-list">
          <div 
            v-for="(result, index) in filteredResults"
            :key="index"
            class="result-item"
            :class="result.status"    
          >
            <span class="badge">{{ statusIcons[result.status] }}</span>
            <div class="student-info">
              <span class="name">{{ result.name  }}</span>
              <span class="student-id">#{{ result.studentId  }}</span>
            </div>
            <span class="timestamp">{{ result.time  }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
import * as faceapi from "face-api.js";    
import axios from 'axios';
 
export default {
  name: "FaceAttendanceSystem",
  data() {
    return {
      stats: {
        recognized: 0 
      },
      recognitionResults: [],
      recognizedFaces: new Set(),
      isRecognizing: false,
      isNavigating: false, // 新增导航状态 
      statusIcons: {
        success: '✅',
        error: '❌'
      },
      username: "123",
      nets: "tinyFaceDetector",
      options: null,
      withBoxes: true,
      detectFace: "detectSingleFace",
      detection: "landmark",
      videoEl: null,
      canvasEl: null,
      timeout: 0,
      constraints: {
        audio: false,
        video: {
          width: { min: 320, ideal: 640, max: 1920 },
          height: { min: 240, ideal: 480, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 60 },
          facingMode: "user"
        }
      }
    };
  },
  computed: {
    filteredResults() {
      return this.recognitionResults.filter(item  => item.status  === 'success');
    }
  },
  methods: {
    // 新增方法：查看考勤数据 
    async viewAttendanceData() {
      this.isNavigating  = true;
      try {
        await this.$router.push({ 
          path: '/attendance-data',
          query: {
            date: new Date().toISOString().split('T')[0], // 传递当天日期 
            classId: 'default' // 可根据实际需求添加班级参数 
          }
        });
      } catch (error) {
        console.error(" 跳转失败:", error);
        this.$notify({
          title: '错误',
          message: '无法跳转到考勤页面',
          type: 'error'
        });
      } finally {
        this.isNavigating  = false;
      }
    },
    
    generateStudentId() {
      return '2023' + Math.floor(1000  + Math.random()  * 9000);
    },
    
    async fnInit() {
      await faceapi.nets[this.nets].loadFromUri("/models");    
      await faceapi.loadFaceLandmarkModel("/models");    
      await faceapi.loadFaceExpressionModel("/models");    
      await faceapi.loadAgeGenderModel("/models");  
      
      switch (this.nets)  {
        case "ssdMobilenetv1":
          this.options  = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
          break;
        case "tinyFaceDetector":
          this.options  = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.5 
          });
          break;
        case "mtcnn":
          this.options  = new faceapi.MtcnnOptions({
            minFaceSize: 20,
            scaleFactor: 0.709 
          });
          break;
      }
      
      this.videoEl  = document.getElementById("myVideo");    
      this.canvasEl  = document.getElementById("myCanvas");    
    },
    
    async fnRunFaceLandmark() {
      if (this.videoEl.paused)  return clearTimeout(this.timeout);    
      
      const result = await faceapi[this.detectFace](this.videoEl, this.options)    
        .withFaceLandmarks();
        
      if (result && !this.videoEl.paused)  {  
        const dims = faceapi.matchDimensions(this.canvasEl,  this.videoEl,  true);
        const resizeResult = faceapi.resizeResults(result,  dims);
        
        let ctx = this.canvasEl.getContext("2d");    
        ctx.drawImage(this.videoEl,  0, 0);
        
        var imgBase64 = this.canvasEl.toDataURL("image/jpeg",  1);
        
        try {
          const response = await axios.post("http://localhost:8080/admin/facesearch",  {
            imagebase64: imgBase64,
          });
          
          if (response.data.data.username!=null)  {  
            if (!this.recognizedFaces.has(response.data.data.username))  {  
              this.stats.recognized++;    
              this.recognitionResults.unshift({    
                name: response.data.data.username,    
                studentId: this.generateStudentId(),    
                status: 'success',
                time: new Date().toLocaleTimeString()
              });
              this.recognizedFaces.add(response.data.data.username);   
              
              if (this.recognitionResults.length  > 10) {
                this.recognitionResults.pop();    
              }
            }
          }
          
          this.withBoxes     
            ? faceapi.draw.drawDetections(this.canvasEl,  resizeResult)
            : faceapi.draw.drawFaceLandmarks(this.canvasEl,  resizeResult);
        } catch (error) {
          console.error(" 识别请求失败:", error);
        }
      } else {
        this.canvasEl.getContext("2d")    
          .clearRect(0, 0, this.canvasEl.width,  this.canvasEl.height);    
      }
      
      this.timeout  = setTimeout(() => this.fnRunFaceLandmark());
    },
    
    fnRun() {
      this.isRecognizing  = true;
      this.fnRunFaceLandmark();    
    },
    
    fnOpen() {
      if (typeof window.stream  === "object") return;
      clearTimeout(this.timeout);    
      
      navigator.mediaDevices.getUserMedia(this.constraints)    
        .then(stream => {
          window.stream  = stream;
          this.videoEl.srcObject  = stream;
          this.videoEl.play();    
          this.isRecognizing  = true;
        })
        .catch(error => {
          console.error(" 摄像头访问失败:", error);
          alert("请允许摄像头访问权限！");
        });
    },
    
    fnClose() {
      this.canvasEl.getContext("2d")    
        .clearRect(0, 0, this.canvasEl.width,  this.canvasEl.height);    
      this.videoEl.pause();    
      clearTimeout(this.timeout);    
      this.isRecognizing  = false;
      this.recognizedFaces.clear();  
      
      if (typeof window.stream  === "object") {
        window.stream.getTracks().forEach(track  => track.stop());    
        window.stream  = "";
        this.videoEl.srcObject  = null;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit();    
    });
  },
  beforeDestroy() {
    this.fnClose();    
  }
};
</script>
 
<style>
/* 原有样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
 
.webrtc-container {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,255,136,0.1) 100%);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
 
.camera-wrapper {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
}
 
.system-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-size: 2rem;
  position: relative;
}
 
.system-title::after {
  content: "";
  display: block;
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #007bff, #00ff88);
  margin: 0.5rem auto 0;
  border-radius: 2px;
}
 
.video-container {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}
 
.video-feed {
  width: 100%;
  height: auto;
  background: #000;
  display: block;
}
 
.recognition-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
 
.stats-panel {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
}
 
.stat-item {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  background: rgba(0,123,255,0.1);
  transition: all 0.3s;
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
 
.control-panel {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}
 
.btn-primary, .btn-secondary, .btn-info {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
}
 
.btn-primary {
  background: #007bff;
}
 
.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,123,255,0.3);
}
 
.btn-secondary {
  background: #6c757d;
}
 
.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108,117,125,0.3);
}
 
/* 新增按钮样式 */
.btn-info {
  background: #17a2b8;
}
.btn-info:hover {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(23,162,184,0.3);
}
.btn-info:disabled {
  background: #b1dfe7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
 
.result-panel {
  margin-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 1.5rem;
}
 
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
 
.result-header h3 {
  color: #2d3748;
  font-size: 1.25rem;
}
 
.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
}
 
.status-indicator.active  {
  background: #00ff88;
  box-shadow: 0 0 8px rgba(0,255,136,0.5);
  animation: breath 1.5s ease-in-out infinite;
}
 
@keyframes breath {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}
 
.result-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
 
.result-item {
  padding: 1rem;
  margin: 0.5rem 0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  animation: slideIn 0.3s ease-out;
}
 
@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
 
.result-item.success  {
  border-left: 4px solid #28a745;
}
 
.badge {
  margin-right: 1rem;
  font-size: 1.2rem;
  min-width: 20px;
}
 
.student-info {
  flex: 1;
}
 
.student-info .name {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #2d3748;
}
 
.student-info .student-id {
  color: #6c757d;
  font-size: 0.9em;
}
 
.timestamp {
  color: #6c757d;
  font-size: 0.85em;
  min-width: 80px;
  text-align: right;
}
 
@media (max-width: 768px) {
  .webrtc-container {
    padding: 1rem;
  }
  
  .camera-wrapper {
    padding: 1rem;
  }
  
  .video-container {
    aspect-ratio: 9/16;
  }
  
  .stats-panel {
    flex-direction: column;
  }
  
  .control-panel {
    flex-direction: column;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timestamp {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}
 
::-webkit-scrollbar {
  width: 6px;
}
 
::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}
 
::-webkit-scrollbar-thumb {
  background: rgba(0,123,255,0.3);
  border-radius: 3px;
}
 
::-webkit-scrollbar-thumb:hover {
  background: rgba(0,123,255,0.5);
}
</style>