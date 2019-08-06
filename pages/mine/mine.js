// pages/mine/mine.js
const app = getApp()
Page({
  data: {
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,
    publisherId:null,
    userInfo : app.getGlobalUserInfo(),
  },
  onLoad:function(e){
    
    // debugger;
    var that = this;
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.id;

    var publisherId = e.publisherId;
    
    if (publisherId != null && publisherId != "" && publisherId!=undefined){
      var isMe = '';
      if (userId == publisherId){
        isMe = true
      }else{
        isMe = false
      }
      userId=publisherId;
      that.setData({
        isMe: isMe,  
        publisherId: publisherId,
      });
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: serverUrl + 'user/qureyByUser?userId=' + userId + "&fanId=" + userInfo.id,
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': userInfo.id,
          'headerUserToken': userInfo.userToken
        },
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          var data = res.data.data;
          if (res.data.status == "200") {
            if (data.faceImage != null && data.faceImage != '' && data.faceImage != undefined) {
              that.setData({
                fansCounts: data.fansCounts,
                nickname: data.nickname,
                followCounts: data.followCounts,
                receiveLikeCounts: data.receiveLikeCounts,
                faceUrl: serverUrl + data.faceImage,
                isFollow: data.follow
              })
            }
          } else if (res.data.status == "502") {
            wx.showToast({
              title: res.data.msg,
              duration: 3000,
              icon: "none",
              success: function () {
                wx.redirectTo({
                  url: '../userLogin/login',
                })
              }
            })
          }
        }
      })

    }else{

      wx.request({
        url: serverUrl + 'user/query?userId=' + userId,
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          var data = res.data.data;
          console.log(res)
          if (res.data.status == "200") {
            if (data.faceImage != null && data.faceImage != '' && data.faceImage != undefined) {
              that.setData({
                fansCounts: data.fansCounts,
                nickname: data.nickname,
                followCounts: data.followCounts,
                receiveLikeCounts: data.receiveLikeCounts,
                faceUrl: serverUrl + data.faceImage,
              })
            }
          } else if (res.data.status == "502") {
            wx.showToast({
              title: res.data.msg,
              duration: 3000,
              icon: "none",
              success: function () {
                wx.redirectTo({
                  url: '../userLogin/login',
                })
              }
            })
          }
        }
      })
    }
  },
  followMe:function(e){
    var that = this;

    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = that.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;

    // 1：关注 0：取消关注
    var url = '';
    if (followType == '1') {
      url = '/user/fansLikeUsers?userId=' + publisherId + '&fanId=' + userId;
    } else {
      url = '/user/fansUnLikeUsers?userId=' + publisherId + '&fanId=' + userId;
    }

    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function () {
        wx.hideLoading();
        if (followType == '1') {
          that.setData({
            isFollow: true,
            fansCounts: ++that.data.fansCounts
          })
        } else {
          that.setData({
            isFollow: false,
            fansCounts: --that.data.fansCounts
          })
        }
      }
    })
  },
  logout:function(e){
    var that = this;
    var userId = that.userId;
      wx.showToast({
        title: '注销中',
      })
    wx.request({
      url: app.serverUrl + '/logout?userId=' + userId,      
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading();
        var status = res.data.status;
        if (status == 200) {
          wx.showToast({
            title: "用户注销成功~！！！",
            icon: 'none',
            duration: 3000
          }),
            that.userInfo = null;
          wx.redirectTo({
            url: '../../pages/userLogin/login',
          })
        } 
      }
    })
  },
  changeFace:function(){
    var that = this;
    var serverUrl = app.serverUrl;
    var userId = app.getGlobalUserInfo().id;
    console.log(userId)
    var that = this;
    //选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: '上传中',
        })
        //上传图片
        wx.uploadFile({
          url: serverUrl + 'user/uploadFace?userId=' + userId, 
          filePath: tempFilePaths[0],
          name: 'file',
          success(res) {
            wx.hideLoading();
            var data = JSON.parse(res.data);
            var status = data.status;
            if(status==200){
              wx.showToast({
                title: '上传成功',
                icon: 'success',
              })
            }else if(status==500){
              wx.showToast({
                title: data.msg,
                icon: 'error',
              })
            }
            console.log(data)
            that.setData({
              faceUrl: serverUrl + data.data
            });
          }
        })
      }
    })
  },
  uploadVideo:function(){
    var that = this
    wx.chooseVideo({
      sourceType: ['album'],
      success: function (res) {
        var duration = res.duration;//视频长度
        var height = res.height;
        var width = res.width;
        var tempVideoUrl = res.tempFilePath; //视频临时路径
        var tempColorUrl = res.thumbTempFilePath;//视频截图路径
        if(duration>11){
          wx.showToast({
            title: '视频长度不能超过10秒',
            icon:'none',
            duration:3000,
          })
        }else if(duration<1){
          wx.showToast({
            title: '视频长度低于1秒,请上传超过1秒视频',
            icon:'none',
            duration:3000,
          })
        }else{
          that.setData({
            duration: duration,
            height: height,
            width: width,
            tempVideoUrl: tempVideoUrl,
            tempColorUrl: tempColorUrl,
          })
        }
        wx.redirectTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration+
            '&height=' + height+
            '&width=' + width +
            '&tempVideoUrl=' + tempVideoUrl +
            '&tempColorUrl=' + tempColorUrl,
        })
      }
    })
  },
  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },
  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },
  getMyVideoList: function () {
    var that = this;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/queryByUserId?userId=' + app.getGlobalUserInfo().id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data.data)
        wx.hideLoading();
        if (res.data.data.rows!=null){
        var myVideoList = res.data.data.rows;
        var page = res.data.data.page
        var newVideoList = that.data.myVideoList;
        that.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
        }else{
          wx.showToast({
            title: '还没发表过视频',
            icon: 'none',
            duration: 3000,
          })
        }
      }
    })
  },

  getMyLikesList: function () {
    var that = this;
    var userId = app.getGlobalUserInfo().id;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/queryMyLikeVideos/?userId=' + userId,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        var page = res.data.data.page;
        wx.hideLoading();

        var newVideoList = that.data.likeVideoList;
        that.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var that = this;
    var userId = app.getGlobalUserInfo().id;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/queryMyFollowVideos/?userId=' + userId,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = that.data.followVideoList;
        that.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  // 点击跳转到视频详情页面
  showVideo: function (e) {

    console.log(e);

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })

  },

  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }

  }
})