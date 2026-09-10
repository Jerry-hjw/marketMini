
  var API_BASE_URL = 'https://pr.joymanor.cn/api';
  var IMG_BASE_URL = 'https://pr.joymanor.cn/img';
  var OA_URL = 'https://pr.joymanor.cn/adminapi'; 
  // var API_BASE_URL = 'http://localhost:8080/api';
  // var IMG_BASE_URL = 'http://localhost:8082/img';
  // var OA_URL = 'http://localhost:8888/adminapi';

var request = function request(uri,  method, data, emulateJSON) { 
    return new Promise(function (resolve, reject) {
        getTokenPromise().then(res => {
            var token = res 
            let setHeader={
                'token': token,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
            if(emulateJSON){
                setHeader={
                'token': token,
                'Content-Type': 'application/json;charset=UTF-8'
                }
            } 
            wx.request({
            url: API_BASE_URL +  uri, 
            method: method,
            data: data,
            header: setHeader,
            success: function success(request) {
                if(request.statusCode=='403'){
                wx.hideLoading()
                //改为判断特殊情况出现403 直接retrun
                return
                }else {
                resolve(request.data);
                }
            },
            fail: function fail(error) {
                reject(error);
                wx.showToast({
                  title: '出现了一点问题呢',
                  icon: 'none'
                })
                console.log(error)
                wx.hideLoading()
            },
            complete: function complete(aaa) {
                // 加载完成
            }
            });
        });
    }); 
};

var request2 = function request(uri,  method, data, qrData) {
  // 没有拦截403
  try {
    // （保留）捕获全局错误
  } catch(e) {
    // （保留）捕获全局错误
  }
  let setHeader={
    'token': wx.getStorageSync('token'),
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  let responseType='';
  if(qrData==true){
    responseType='arraybuffer';
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: API_BASE_URL +  uri,
      responseType:responseType,
      method: method,
      data: data,
      header: setHeader,
      success: function success(request) {
        resolve(request.data);
      },
      fail: function fail(error) {
        reject(error);
        wx.hideLoading()
      },
      complete: function complete(aaa) {
        // 加载完成
      }
    });
  });
};

const getTokenPromise=()=>{
    return new Promise((resolve, reject) => {
        var token = wx.getStorageSync('token');
        if(token){
            resolve(token)
            return
        }
        wx.login({
            success: res => {
              let params={
                code: res.code
              }
              wx.request({
                url: API_BASE_URL +  '/wx/login',
                method: 'post',
                data: params,
                header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
                success: function success(res2) {
                    token = res2.data
                  wx.setStorageSync('token', token)
                  resolve(token);
                }
              })
            }
          }) 
      })
}
 

module.exports = {
    request: request, 
    requestArrayBuffer: request2,
    API_BASE_URL: API_BASE_URL, 
    IMG_BASE_URL: IMG_BASE_URL,
    OA_URL: OA_URL,
}