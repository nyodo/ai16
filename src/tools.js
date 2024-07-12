import fa_comment from "@fortawesome/fontawesome-free/svgs/solid/comment.svg";
import fa_paper_plane from "@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg";
import fa_user_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-user.svg";
import fa_street_view from "@fortawesome/fontawesome-free/svgs/solid/street-view.svg";
import fa_camera_retro from "@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg";
import fa_info_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-info.svg";
import fa_xmark from "@fortawesome/fontawesome-free/svgs/solid/xmark.svg";

import showMessage from "./message.js";
let messageTimer;


let requestObj = {
    APPID: '6483403d',
    APISecret: 'ZmRlNGUxMjMwZTcxZTVhZTYwOWNjZWE3',
    APIKey: '9a4eefb7835fd4065f624bee6c308048',
    sparkResult: ''
}
let thisres='';
// 点击发送信息按钮
let questionInput = document.querySelector("#name");
// 输入完信息点击enter发送信息
function showHitokoto() {
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    sendMsg();

}

const tools = {
    "hitokoto": {
        icon: fa_comment,
        callback: showHitokoto
    },
    "asteroids": {
        icon: fa_paper_plane,
        callback: () => {
            if (window.Asteroids) {
                if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
                window.ASTEROIDSPLAYERS.push(new Asteroids());
            } else {
                const script = document.createElement("script");
                script.src = "https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
                document.head.appendChild(script);
            }
        }
    },
    "switch-model": {
        icon: fa_user_circle,
        callback: () => {}
    },
    "switch-texture": {
        icon: fa_street_view,
        callback: () => {}
    },
    "photo": {
        icon: fa_camera_retro,
        callback: () => {
            showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
            Live2D.captureName = "photo.png";
            Live2D.captureFrame = true;
        }
    },
    "info": {
        icon: fa_info_circle,
        callback: () => {
            open("https://github.com/stevenjoezhang/live2d-widget");
        }
    },
    "quit": {
        icon: fa_xmark,
        callback: () => {
            localStorage.setItem("waifu-display", Date.now());
            showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
            document.getElementById("waifu").style.bottom = "-500px";
            setTimeout(() => {
                document.getElementById("waifu").style.display = "none";
                document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
            }, 3000);
        }
    }
};

// 发送消息
const sendMsg = async () => {
    // 获取请求地址
    let myUrl = await getWebsocketUrl();
    // 获取输入框中的内容
    let inputVal = questionInput.value;
    // 每次发送问题 都是一个新的websocketqingqiu
    let socket = new WebSocket(myUrl);
    
    // 监听websocket的各阶段事件 并做相应处理
    socket.addEventListener('open', (event) => {
        console.log('开启连接！！', event);
        // 发送消息
        let params = {
            "header": {
                "app_id": requestObj.APPID,
            },
            "parameter": {
                "chat": {
                    // "domain": "general",
                    "domain": "generalv3.5",
                    "temperature": 0.5,
                    "max_tokens": 64,
                }
            },
            "payload": {
                "message": {
                    // 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
                    // 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
                    "text": [
                        // ....... 省略的历史对话
                        { "role": "user", "content": inputVal },  //# 最新的一条问题，如无需上下文，可只传最新一条问题
                    ]
                }
            }
        };
        console.log("发送消息");
        socket.send(JSON.stringify(params))
    })
    socket.addEventListener('message', (event) => {
        let data = JSON.parse(event.data)
        // console.log('收到消息！！',data);
        requestObj.sparkResult += data.payload.choices.text[0].content
        if (data.header.code !== 0) {
            console.log("出错了", data.header.code, ":", data.header.message);
            // 出错了"手动关闭连接"
            socket.close()
        }
        if (data.header.code === 0) {
            // 对话已经完成
            if (data.payload.choices.text && data.header.status === 2) {
                
                //requestObj.sparkResult += data.payload.choices.text[0].content;
                setTimeout(() => {
                    thisres=requestObj.sparkResult;
                    showMessage(thisres,4000,9);
                    // 清空输入框
                    questionInput.value = '';
                    thisres='';
                    requestObj.sparkResult='';
                    // "对话完成，手动关闭连接"
                    socket.close()
                }, 1000)
            }
        }
    })
    socket.addEventListener('close', (event) => {
        console.log('连接关闭！！', event);
        // 对话完成后socket会关闭，将聊天记录换行处理

    })
    socket.addEventListener('error', (event) => {
        console.log('连接发送错误！！', event);
    })
}
// 鉴权url地址
const getWebsocketUrl = () => {
    return new Promise((resovle, reject) => {
        // let url = "wss://spark-api.xf-yun.com/v1.1/chat";
        let url = "wss://spark-api.xf-yun.com/v3.5/chat";
        let host = "spark-api.xf-yun.com";
        let apiKeyName = "api_key";
        let date = new Date().toGMTString();
        let algorithm = "hmac-sha256"
        let headers = "host date request-line";
        // let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
        let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`;
        let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, requestObj.APISecret);
        let signature = CryptoJS.enc.Base64.stringify(signatureSha);

        let authorizationOrigin = `${apiKeyName}="${requestObj.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;

        let authorization = window.btoa(authorizationOrigin);

        // 将空格编码
        url = `${url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`;

        resovle(url)
    })
}
/** 将信息添加到textare中
    在textarea中不支持HTML标签。
    不能使用
    标签进行换行。
    也不能使用\r\n这样的转义字符。

    要使Textarea中的内容换行，可以使用&#13;或者&#10;来进行换行。
    &#13;表示回车符；&#10;表示换行符；
*/



export default tools;
