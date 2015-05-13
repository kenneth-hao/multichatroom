(function() {
  var d = document, 
  w = window,
  p = parseInt, 
  dd = d.documentElement,
  db = d.body,
  dc = d.compatMode == 'CSS1Compat',
  dx = dc ? dd : db,
  ec = encodeURIComponent;

  w.CHAT = {
    msgObj: d.getElementById("message"),
    screenHeight: w.innerHeight ? w.innerHeight: dx.clientHeight,
    username: null,
    userid: null,
    socket: null,
    // let browser keep bottom in scroll
    
    scrollToBottom: function() {
      w.scrollTo(0, this.msgObj.clientHeight)
    },
    // logout, it's only a simple refresh
    logout: function() {
      // this.socket.disconnect()
      location.reload()
    },
    // commit message
    submit: function() {
      var content = d.getElementById("content").value
      if (content != '') {
        var obj = {
          userid: this.userid,
          username: this.username,
          content: content
        }
        this.socket.emit('message', obj)
        d.getElementById('content').value = ''
      }
      return false
    },
    genUid: function() {
      return new Date().getTime()+''+Math.floor(Math.random()*899+100)
    },
    // update system message, in this case it will be invoked when user join or user exit
    updateSysMsg: function(o, action) {
      var onlineUsers = o.onlineUsers
      var onlineCount = o.onlineCount
      var user = o.user

      var userhtml = ''
      var separator = ''
      for (key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userhtml += separator + onlineUsers[key]
          separator = '、'
        }
      }
      d.getElementById('onlinecount').innerHTML = 'There are ' + onlineCount  + ' users online. User List: ' + userhtml

      var html = ''
      html += '<div class="msg-system">'
      html += user.username
      html += (action == 'login') ? ' join chatroom' : ' quit chatroom'
      html += '</div>'
      var section = d.createElement('section')
      section.className = 'system J-mjrlinkWrap J-cutMsg'
      section.innerHtml = html
      this.msgObj.appendChild(section)
      this.scrollToBottom()
    },
    usernameSubmit: function() {
      var username = d.getElementById('username').value
      if (username != '') {
        d.getElementById("username").value = ''
        d.getElementById("loginbox").style.display = 'none'
        d.getElementById("chatbox").style.display = 'block'
        this.init(username)
      }
      return false
    },
    init: function(username) {
      this.userid = this.genUid()
      this.username = username

      d.getElementById("showusername").innerHTML = this.username
      this.msgObj.style.minHeight = (this.screenHeight - db.clientHeight + this.msgObj.clientHeight) + 'px'
      this.scrollToBottom()

      // connect websocket to server
      this.socket = io.connect('ws://127.0.0.1:3000')

      // tell server someone is login
      this.socket.emit('login', {userid:this.userid, username: this.username})

      // listen to new user login
      this.socket.on('login', function(o) {
        CHAT.updateSysMsg(o, 'login')
      })

      // listen to user quit
      this.socket.on('logout', function(o) {
        CHAT.updateSysMsg(o, 'logout')
      })

      // listen to message
      this.socket.on('message', function(obj) {
        var isme = (obj.userid = CHAT.userid) ? true : false
        var contentDiv = '<div>' + obj.content + '</div>'
        var usernameDiv = '<span>'+ obj.username + '</span>'

        var section = d.createElement('section')
        if (isme) {
          section.className = 'user'
          section.innerHTML = contentDiv + usernameDiv
        } else {
          section.className = 'service'
          section.innerHTML = usernameDiv + contentDiv
        }
        CHAT.msgObj.appendChild(section)
        CHAT.scrollToBottom()
      })
    }
  }
  // 通过“回车”提交用户名
  d.getElementById("username").onkeydown = function(e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.usernameSubmit()
    }
  }
  // 通过“回车”提交信息
  d.getElementById("content").onkeydown = function(e) {
    e = e || event;
    if (e.keyCode === 13) {
      CHAT.submit();
    }
  };            
})()
