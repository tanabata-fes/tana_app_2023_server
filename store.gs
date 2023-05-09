var cache = CacheService.getScriptCache();

function store(groupList,token,text){
  storeCheck(groupList);

  var store_sheet_id = cache.get("store_sheet");
  var store_sheet = ss.getSheetByName(store_sheet_id);

  var user_Status = cache.get("status");

  var status = storeStatus(store_sheet); 

  if(text == "キャンセル"){
    cache.remove("status")
    cache.remove("level")
    cache.remove("ID")
    reply(token,"現在の動作をキャンセルしました。もう一度やり直してください。")
  }else{
    if(user_Status == "changeStatus"){
      changeStatus(token,store_sheet,text)
    }else if(user_Status == "changeTime"){
      changeTime(token,store_sheet,text)
    }else if(user_Status == "changeStock"){
      changeStock(token, store_sheet, text)
    }else{
      if(text == "開店状況変更"){
        cache.put("status", "changeStatus")
        changeStatus(token,store_sheet,text)
      }else if(text == "待ち時間変更"){
        cache.put("status", "changeTime")
        changeTime(token, store_sheet, text)
      }else if(text == "在庫変更"){
        cache.put("status", "changeStock")
        changeStock(token, store_sheet, text)
      }else{
        if(status.apply.useTime && status.apply.useStock){
          replyuseTimeStock(store_sheet,token);
        }else if(status.apply.useTime && status.apply.useStock == false){
          replyuseTime(store_sheet,token);
        }else if(status.apply.useTime == false && status.apply.useStock){
          replyuseStock(store_sheet,token);
        }else if(status.apply.useTime == false && status.apply.useStock == false){
          replyonlyStatus(store_sheet, token);
        }
      }
    }
  }
}

function changeStatus(token,store_Sheet,text){
  var level = cache.get("level")
  var status =store_Sheet.getRange(4,2).getValue();

  if(level == 10){
    if(text == "はい"){
      var message = "開店状況を変更しました。"
      store_Sheet.getRange(4,2).setValue("Close");
      cache.remove("level")
      cache.remove("status")
      reply(token, message)
    }if(text == "いいえ"){
      var message = "変更をキャンセルしました。\n\n変更したい場合はもう一度やり直してください。"
      cache.remove("level")
      cache.remove("status")
      reply(token, message)
    }
  }else if(level == 11){
    if(text == "はい"){
      var message = "開店状況を変更しました。"
      store_Sheet.getRange(4,2).setValue("Open");
      cache.remove("level")
      cache.remove("status")
      reply(token, message)
    }if(text == "いいえ"){
      var message = "変更をキャンセルしました。\n\n変更したい場合はもう一度やり直してください。"
      cache.remove("level")
      cache.remove("status")
      reply(token, message)
    }
  }else{
    if(status == "Open"){
      var message = "【開店状況変更】\n\n現在のステータスは「Open」です。\n\n「Close」に変更しますか？"
      cache.put("level",10)
      replyTwoButtons(token,"はい","いいえ","はい","いいえ",message);
    }else if(status == "Close"){
      var message = "【開店状況変更】\n\n現在のステータスは「Close」です。\n\n「Open」に変更しますか？"
      cache.put("level",11)
      replyTwoButtons(token,"はい","いいえ","はい","いいえ",message);
    }else{
      var message = "Errorが発生しました。"
      reply(token, message)
    }
  }
}

function changeTime(token, store_sheet, text){
  var time =store_sheet.getRange(5,2).getValue();
  var level = cache.get("level")

  if(level == 21){
    if(text == "混雑" || text == "普通" || text == "空き気味"){
      var message = `【待ち時間】\n\n現在の混雑度を${text}に設定しました。`
      store_sheet.getRange(5,2).setValue(text);
      cache.remove("level")
      cache.remove("status")
      reply(token, message)
    }else{
      reply(token, "「混雑」「普通」「空き気味」の中から選択してください。")
    }
  }else{
      var message = `【待ち時間変更】\n\n現在の待ち時間は「${time}」となっています。変更する値を選んでください。もし変更したくない場合は今と同じ混雑度を選択してください。`
      cache.put("level",21)
    replyThreeButtons(token, "混雑", "普通", "空き気味", "混雑", "普通", "空き気味", message)
  }
}

function changeStock(token, store_sheet, text){
  var level = cache.get("level")

  if(level == 30){
    var lastrow = store_sheet.getLastRow()
    var item_number = lastrow - 5
    if(/^\d+$/.test(text)){
      if(1 <= text && text <= item_number){
        var message = `【在庫状況変更】\n\n`
        var info_message = `上記の商品が選択されています。問題がなければ在庫状況を〇、△、×の中から選択してください。\n\nもし問題がある場合は「キャンセル」を選択してください。`
        cache.put("ID", text)
        var item_row = text + 5
        var item_data = {}
        item_data.id = text
        item_data.name = store_sheet.getRange(item_row,1)
        item_data.stock = store_sheet.getRange(item_row,2)
        var lastrow = store_sheet.getLastRow()
    var item_number = lastrow - 5
    if(/^\d+$/.test(text)){
      if(1 <= text && text <= item_number){
        var message = `【在庫状況変更】\n\n`
        var info_message = `上記の商品が選択されています。\n問題がなければ在庫状況を〇、△、×の中から選択してください。\n\nもし問題がある場合は「キャンセル」を選択してください。`
        cache.put("ID", text)
        var item_row = text + 5
        var item_data = {}
        item_data.id = text
        item_data.name = store_sheet.getRange(item_row,1).getValue()
        item_data.stock = store_sheet.getRange(item_row,2).getValue()

        message += `ID:${item_data.id} ${item_data.name}:${item_data.stock}`
        message += info_message;
        cache.put("level", 31)
        replyFourButtons(token, "〇(残数あり)", "△(残り少し)", "×(売り切れ)", "キャンセル", "〇", "△", "×", "キャンセル", message)
      }else{
        var message = "正しい商品のIDを入力して下さい。\n\n変更をキャンセルしたい場合は「キャンセル」を押してください。"
        reply(token,message)
      }
    }else{
      var message = "変更したい商品のIDを半角数字で入力して下さい。\n\n変更をキャンセルしたい場合は「キャンセル」を押してください。"
      replyOneButton(token, "キャンセル", "キャンセル", message)
    }
        cache.put("level", 31)
        replyFourButtons(token, "〇(残数あり)", "△(残り少し)", "×(売り切れ)", "キャンセル", "〇", "△", "×", "キャンセル", message)
      }else{
        var message = "正しい商品のIDを入力して下さい。\n\n変更をキャンセルしたい場合は「キャンセル」を押してください。"
        reply(token,message)
      }
    }else{
      var message = "変更したい商品のIDを半角数字で入力して下さい。\n\n変更をキャンセルしたい場合は「キャンセル」を押してください。"
      reply(token,message)
    }
  }else if(level == 31){
    var id = cache.get("ID")
    var item_row = id + 5

    if(text == "〇" || text == "△" || text == "×"){
      var message=`【在庫状況変更】\n\n`
      var item_data = {}
      item_data.id = id
      item_data.name = store_sheet.getRange(item_row, 1)

      store_sheet.getRange(item_row, 2).setValue(text)

      message += `ID:${item_data.id} ${item_data.name}:${text}\n\nに変更しました。`

      cache.remove("level")
      cache.remove("status")
      cache.remove("ID")
    }else{
      var message = "〇、△、×、キャンセルのどれかを選択してください。"
      reply(token,message)
    }
  }else{
    var message = `【在庫状況】\n\n変更したい商品のIDを半角数字で入力してください。\n\n変更をキャンセルしたい場合は「キャンセル」を押してください。`
    cache.put("level", 30)
    reply(token,message)
  }
}

function replyuseTimeStock(store_Sheet,token){
  var status =store_Sheet.getRange(4,2).getValue();
  var time = store_Sheet.getRange(5,2).getValue();
  var store_name = cache.get("licence");
  var message = `【${store_name}様のステータス】\n開店状況:${status}\n待ち時間:${time}\n\n`;
  var stock_message = `[在庫状況]\n`
  var message_footer = `\n変更したい値を選択してください`;

  var lastRow = store_Sheet.getLastRow();

  for(let i = 6; i <= lastRow; i++){
    var data = {}
    data.id = i - 5
    data.name = store_Sheet.getRange(i,1).getValue();
    data.number = store_Sheet.getRange(i,2).getValue();
    stock_message += `ID:${data.id} ${data.name}:${data.number}\n`
  }
  
  message = message + stock_message;
  message += message_footer
  replyThreeButtons(token, "開店状況", "待ち時間", "在庫", "開店状況変更","待ち時間変更", "在庫変更", message);
}

function replyuseTime(store_Sheet,token){
  var status =store_Sheet.getRange(4,2).getValue();
  var time = store_Sheet.getRange(5,2).getValue();
  var store_name = cache.get("licence");
  var message = `【${store_name}様のステータス】\n開店状況:${status}\n待ち時間:${time}\n\n`;
  var message_footer = `\n変更したい値を選択してください`;
  
  message += message_footer;
  replyTwoButtons(token, "開店状況", "待ち時間", "開店状況変更","待ち時間変更", message);
}

function replyuseStock(store_Sheet,token){
  var status =store_Sheet.getRange(4,2).getValue();
  var store_name = cache.get("licence");
  var message = `【${store_name}様のステータス】\n開店状況:${status}\n\n`;
  var stock_message = `[在庫状況]\n`
  var message_footer = `\n変更したい値を選択してください`;

  var lastRow = store_Sheet.getLastRow();

  for(let i = 6; i <= lastRow; i++){
    var data = {}
    data.id = i - 5
    data.name = store_Sheet.getRange(i,1).getValue();
    data.number = store_Sheet.getRange(i,2).getValue();
    stock_message += `ID:${data.id} ${data.name}:${data.number}\n`
  }
  
  message = message + stock_message;
  message += message_footer;
  replyTwoButtons(token, "開店状況", "在庫", "開店状況変更", "在庫変更", message);
}

function replyonlyStatus(store_Sheet,token){
  var status = store_Sheet.getRange(4,2).getValue();
  var store_name = cache.get("licence");
  var message = `【${store_name}様のステータス】\n開店状況:${status}`;
  replyOneButton(token, "開店状況変更", "開店状況変更", message);
}

function storeCheck(groupList){
  var store_name = cache.get("licence");
  var group_number = groupList.getLastRow();
  for(let i = 2; i <= group_number; i++){
    var data_name = groupList.getRange(i,1).getValue();
    if(data_name == store_name){
      var store_sheet_name = groupList.getRange(i,4).getValue();
      cache.put("store_sheet", store_sheet_name);
    }
  }
}

function storeStatus(store_sheet){
  var status_data = {};
  var applyData = {};
  applyData.useStatus = store_sheet.getRange(1,2).getValue();
  applyData.useTime = store_sheet.getRange(2,2).getValue();
  applyData.useStock = store_sheet.getRange(3,2).getValue();
  
  status_data.apply = applyData;
  return status_data;
}