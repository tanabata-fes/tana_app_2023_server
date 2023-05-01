var CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN')
var id = PropertiesService.getScriptProperties().getProperty('ID');
var ss = SpreadsheetApp.openById(id);
var member_sheet = ss.getSheetByName("member");
var groupList_sheet = ss.getSheetByName("group_sheet");
var cache = CacheService.getScriptCache();

//メッセージを送られた際に自動的に実行される処理
function doPost(e) {
    let reply = getReplyData(e);
    licenceCheck(reply.userId);
    GetMessage(e);
}

//受け取ったメッセージの処理
function GetMessage(e) {
  var replydata = getReplyData(e);
  var licence = cache.get("licence");
  var status = cache.get("status");
  var level = cache.get("level");

  if(licence != null){
    store(groupList_sheet,replydata.token);
  }else{
    //ライセンスがない場合
    if(replydata.text == "キャンセル"){
      cache.remove("status");
      cache.remove("level");
      reply(replydata.token,"現在の動作をキャンセルしました。最初からやり直してください。")
    }else{
      if(status == "Register"){
        licenceRegister(replydata,level,replydata.userId);
      }else{
        if(replydata.text == "ライセンス登録"){
          //ライセンス登録段階にある事のキャッシュ保存
          licenceRegisterSetup(replydata.token);
        }else{
          reply(replydata.token,"ライセンス登録を行ってください。");
        }
      }
    }
  }
}


function licenceCheck(userid){
  var last = member_sheet.getLastRow();
  var status_licence = false;

  for(var i = 2; i <= last; i++){
    var data_id = member_sheet.getRange(i,6).getValue();
    if(data_id === userid){
      var store_licence = member_sheet.getRange(i,4).getValue();
      status_licence = true;
      cache.put("licence", store_licence);
      break;
    }
  }

}


function getReplyData(request) {
  var contents = request.postData.contents;
  var json = JSON.parse(contents);
  var events = json.events;
  var event = events[0];
  var replyToken = event.replyToken;
  var message = event.message;
  var messageType = message.type;
  var messageText = message.text;
  var userId = event.source.userId;

  return {
    token: replyToken,
    text: messageText,
    userId: userId
  };
}

//返信用処理、トークン及びメッセージ内容を書けばそのまま送られる
function reply(replyToken, message) {
  var url = "https://api.line.me/v2/bot/message/reply";
  UrlFetchApp.fetch(url, {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "text",
        "text": message,
      }],
    }),
  });
  //return ContentService.createTextOutput(JSON.stringify({"content": "post ok"})).setMimeType(ContentService.MimeType.JSON);
}