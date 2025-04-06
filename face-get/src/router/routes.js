import Home from "@/views/Home.vue";

export default [
 {
    path: "/attendance-data",
    name: "考勤数据报表",
    component: () => import("@/views/AttendanceData.vue"), 
    meta: {
      requiresAuth: true  // 可选：添加路由元信息用于权限控制 
    }
  },

  {
    path: "*",
    name: "WebRTC人脸识别",
    component: () => import("@/views/WebRTCFaceRecognition.vue"),
  }

];
