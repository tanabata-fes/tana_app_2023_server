var member_sheet = ss.getSheetByName("member");
var groupList_sheet = ss.getSheetByName("group_sheet");
var cache = CacheService.getScriptCache();

function licenceRegisterSetup(token) {
  cache.put("status", "Register");
  cache.put("level", 1);
  reply(token, "各団体ごとに配られた団体コードを送ってください。");
}

function licenceRegister(replydata,level,userid){
  if(level == 1){
    registerLevel1(replydata.text,replydata.token);
  }else if (level == 2){
    registerLevel2(replydata.text,replydata.token);
  }else if(level == 3){
    registerLevel3(replydata.text,replydata.token);
  }else if(level == 4){
    registerLevel4(replydata.text,replydata.token);
  }else if(level == 5){
    registerLevel5(replydata.text,replydata.token);
  }else if(level == 6){
    registerLevel6(replydata.text,replydata.token);
  }else if(level == 7){
    registerLevel7(replydata.text,replydata.token,userid);
  }
}

function registerLevel1(text,token){
  let status = false;
  var last = groupList_sheet.getLastRow();

  for(var i = 2; i <= last; i++){
    var group_id = groupList_sheet.getRange(i,2).getValue();
    if(group_id == text){
      var store_id = text;
      var store_name = groupList_sheet.getRange(i,1).getValue();
      reply(token,`団体名[${store_name}]\n\nですか？\n違う場合は「キャンセル」を、正しい場合は団体ごとに配られた参加キーを入力してください。`);
      status = true;
      cache.put("store",store_id);
      cache.put("store_name",store_name);
      cache.put("store_line", i);
      cache.put("level", 2);
      break;
    }
  }

  if(status == false){
    reply(token,"団体コードが存在しない値です。正しい団体コードを入力してください。");
  }
}

function registerLevel2(text,token){
  var line = cache.get("store_line");
  var store_key = groupList_sheet.getRange(line,3).getValue();

  if(text == store_key){
    reply(token,"有効な参加キーを確認しました。\n\n次に名前(漢字、姓名の間半角空け)を入力してください。");
    cache.put("level", 3);
  }else{
    reply(token,`参加キーが有効ではありません。\n\n正しい参加キーを入力してください。\n\n最初からやり直したい場合は「キャンセル」と入力してください。`);
  }
}

function registerLevel3(text,token){
  reply(token,"次に学部を入力してください");
  cache.put("level",4);
  cache.put("name",text);
}

function registerLevel4(text,token){
  reply(token,"次に学年を半角数字で入力してください");
  cache.put("level",5);
  cache.put("faculty",text);
}

function registerLevel5(text,token){
  if(/^\d+$/.test(text)){
    reply(token,"次に学籍番号を半角数字で入力してください");
    cache.put("level",6);
    cache.put("grade",text);
  }else{
    reply(token,"学年は半角数字で入力してください。");
  }
}

function registerLevel6(text,token){
  var store_name = cache.get("store_name");
  var name = cache.get("name");
  var faculty = cache.get("faculty");
  var grade = cache.get("grade");


  if(/^\d+$/.test(text)){
    cache.put("level",7);
    cache.put("student_number",text);
    var student_number = cache.get("student_number");
    var message = `団体名:${store_name}\n名前:${name}\n学部:${faculty}\n学年:${grade}年\n学籍番号:${student_number}\n\nで登録します。\n\n間違いがない場合は「はい」、間違いがある場合は「キャンセル」と送信してください。`
    replyTwoButtons(token,"はい","キャンセル", "はい", "キャンセル",message);
  }else{
    reply(token,"学籍番号は半角数字で入力してください。");
  }
}

function registerLevel7(text,token,userid){
  var data = {};
  data.store_name = cache.get("store_name");
  data.name = cache.get("name");
  data.faculty = cache.get("faculty");
  data.grade = cache.get("grade");
  data.student_number = cache.get("student_number");
  
  if(text == "はい"){
    var last_row = member_sheet.getLastRow();
    var data_row = last_row + 1;
    member_sheet.getRange(data_row,1).setValue(data.name);
    member_sheet.getRange(data_row,2).setValue(data.faculty);
    member_sheet.getRange(data_row,3).setValue(data.grade);
    member_sheet.getRange(data_row,4).setValue(data.store_name);
    member_sheet.getRange(data_row,5).setValue(data.student_number);
    member_sheet.getRange(data_row,6).setValue(userid);
    reply(token,"ライセンス登録が完了しました。")
    cache.remove("level");
    cache.remove("status");
    cache.remove("store_name");
    cache.remove("name");
    cache.remove("faculty");
    cache.remove("grade");
    cache.remove("student_number");

  }else{
    reply(token,"「はい」もしくは「キャンセル」と送信してください。");
  }
}

function licenceRegisterSetup(token){
  cache.put("status","Register");
  cache.put("level", 1);
  reply(token,"各団体ごとに配られた団体コードを送ってください。");
}