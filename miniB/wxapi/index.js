
  // var API_BASE_URL = 'https://pr.joymanor.cn/merchantapi';
  // var IMG_BASE_URL = 'https://pr.joymanor.cn/img';
  // var OA_URL = 'https://pr.joymanor.cn/adminapi';
  var API_BASE_URL = 'http://localhost:8086/merchantapi';
  var IMG_BASE_URL = 'http://localhost:8082/img';
  var OA_URL = 'http://localhost:8888/adminapi';

var request = function request(uri,  method, data, emulateJSON) { 
    return new Promise(function (resolve, reject) {
        getTokenPromise().then(res => {
            var token = res 
            let setHeader={
                'token': token,
                'pr_member_id': wx.getStorageSync('pr_member_id'),
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
            if(emulateJSON){
                setHeader={
                'token': token,
                'pr_member_id': wx.getStorageSync('pr_member_id'),
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

var oaRequest = function request(uri,  method, data, emulateJSON) { 
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
          url: OA_URL +  uri,
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

const getTokenPromise=()=>{
    return new Promise((resolve, reject) => {
        var token = wx.getStorageSync('token');
        if(token){
            resolve(token)
            return
        }
        wx.navigateTo({
          url: '/pages/index/index',
        })
      })
}
 

module.exports = {
    request: request,
    oaRequest: oaRequest,
    API_BASE_URL: API_BASE_URL, 
    IMG_BASE_URL: IMG_BASE_URL,
    OA_URL: OA_URL,
}