import request from '@/utils/request'


  export function faceDesign(faceObj) {
    return request({
        url: 'admin/faceDesign',
        method: 'post',
        data : faceObj
    })
}

   /*
  // 修改原有提交接口 
  export function faceDesign(data) {
    return request({
      url: '/api/student/register',
      method: 'post',
      data 
    })
  }*/