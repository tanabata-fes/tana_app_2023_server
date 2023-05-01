var cache = CacheService.getScriptCache();

function store(groupList,token){
  storeCheck(groupList);

  var store_sheet_id = cache.get("store_sheet");
  var store_sheet = ss.getSheetByName(store_sheet_id);

  var status = storeStatus(store_sheet); 

  status_info(status,token);
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

  var data_number = store_sheet.getLastRow;
  var status = store_sheet.getRange(1,2).getValue();
  var waittime = store_sheet.getRange(2,2).getValue();
  var stock = []
  for(let i= 3; i <= data_number; i++){
    var stock_data = {};
    stock_data.name = store_sheet.getRange(i,1).getValue();
    stock_data.number = store_sheet.getRange(i,2).getValue();
    stock.push(stock_data);
  }

  status_data.status = status;
  status_data.waittime = waittime;
  status_data.stock = stock;

  return status_data;
}

function status_info(status,token){
  var store_name = cache.get("licence");
  var message = `【${store_name}様のステータス】\n開店状態:${status.status}\n待ち時間:${status.waittime}\n\n[在庫状況]\n`;
  for(let stock of status.stock){
    var text = `${stock.name}:${stock.number}\n`;
    message = message + text; 
  }

  reply(token, message);
}