/**
 * TODAYSERVICE.IN – WEBSITE ENQUIRIES
 * Paste this file into https://script.google.com/ then run setupTodayService() once.
 * Deployment: Deploy > New deployment > Web app > Execute as: Me; Who has access: Anyone.
 * Copy the /exec URL into APPS_SCRIPT_URL in index.html AND booking.html.
 * This code writes to a new tab called "TodayService Enquiries" in the supplied spreadsheet.
 */
var TS_CFG = Object.freeze({
  spreadsheetId: '1otcfPImvDxMd0MEGWv878z3Cn0i228AGzABgeo0EPZY',
  sheetName: 'TodayService Enquiries',
  notifyEmail: 'todayservice942@gmail.com',
  timezone: 'Asia/Kolkata'
});
var TS_HEADERS = [
  'Enquiry ID','Received At (IST)','Client Request ID','Source Page','Customer Name',
  'Mobile Number','Machine Type','Brand','Other Brand','PIN Code','Area / Locality',
  'Issue','Additional Details','UTM Source','UTM Medium','UTM Campaign',
  'GCLID','GBRAID','WBRAID','Consent','Email Status'
];

function setupTodayService() {
  var s = getSheet_();
  return 'Setup complete: ' + s.getName() + '. Remaining daily email quota: ' + MailApp.getRemainingDailyQuota();
}

function doPost(e) {
  var lock;
  try {
    if (!e || !e.postData || !e.postData.contents || e.postData.contents.length > 12000)
      throw new Error('Invalid request body');
    var input = JSON.parse(e.postData.contents);
    validate_(input);
    lock = LockService.getScriptLock();
    lock.waitLock(25000);
    var sheet = getSheet_();
    var existing = findRequest_(sheet, input.clientRequestId);
    if (existing) {
      return asJson_({success:true,referenceId:existing.values[0],duplicate:true,emailStatus:existing.values[20]});
    }
    var time = new Date();
    var day = Utilities.formatDate(time,TS_CFG.timezone,'yyyyMMdd');
    var received = Utilities.formatDate(time,TS_CFG.timezone,'dd MMM yyyy, hh:mm:ss a');
    var id = nextId_(sheet,day);
    var row = [
      id,received,input.clientRequestId,input.sourcePage,input.name,cleanPhone_(input.phone),
      input.machineType,input.brand,input.otherBrand || '',input.pin,input.area || '',
      input.issue || '',input.notes || '',input.utmSource || '',input.utmMedium || '',
      input.utmCampaign || '',input.gclid || '',input.gbraid || '',input.wbraid || '',
      'Yes','PENDING'
    ].map(safeCell_);
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    var savedRow = sheet.getLastRow();
    lock.releaseLock();lock=null;
    var emailStatus='SENT';
    try {
      sendEnquiryEmail_(row);
    } catch(emailError) {
      emailStatus='FAILED: '+String(emailError && emailError.message || emailError).slice(0,140);
      console.error(emailError);
    }
    sheet.getRange(savedRow,21).setValue(emailStatus);
    SpreadsheetApp.flush();
    return asJson_({success:true,referenceId:id,emailStatus:emailStatus});
  } catch (error) {
    console.error('TodayService submission failed: '+String(error));
    return asJson_({success:false,error:'Request could not be saved.'});
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

/** GET receipt: a callback-based confirmation for a static GitHub Pages frontend.
 * No personal details are ever returned by this endpoint. */
function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  var id = String(p.receipt || '');
  var callback = String(p.callback || '');
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(id) ||
      !/^__todayReceipt_[A-Za-z0-9_]{8,80}$/.test(callback)) {
    return ContentService.createTextOutput('/* Invalid receipt request */')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  try {
    var record = findRequest_(getSheet_(),id);
    var result={
      success:!!record,
      referenceId:record ? String(record.values[0]) : '',
      emailStatus:record ? String(record.values[20]) : ''
    };
    return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }catch(err){
    console.error(err);
    return ContentService.createTextOutput(callback+'({"success":false});')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function getSheet_(){
  var book=SpreadsheetApp.openById(TS_CFG.spreadsheetId);
  var sheet=book.getSheetByName(TS_CFG.sheetName);
  if(!sheet){
    sheet=book.insertSheet(TS_CFG.sheetName);
    sheet.getRange(1,1,1,TS_HEADERS.length).setValues([TS_HEADERS])
      .setBackground('#24105d').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    ['C:C','F:F','J:J','Q:S'].forEach(function(c){sheet.getRange(c).setNumberFormat('@');});
  }
  return sheet;
}
function validate_(d){
  if(!d || typeof d !== 'object')throw new Error('Invalid payload');
  if(d.website)throw new Error('Spam detected');
  if(!/^[A-Za-z0-9_-]{8,100}$/.test(String(d.clientRequestId||'')))throw new Error('Invalid request ID');
  if(d.consent!==true)throw new Error('Consent is needed');
  if(String(d.name||'').trim().length<2 || String(d.name).length>85)throw new Error('Name required');
  if(!/^[6-9]\d{9}$/.test(cleanPhone_(d.phone)))throw new Error('Invalid mobile number');
  if(!/^[1-9]\d{5}$/.test(String(d.pin||'')))throw new Error('Invalid PIN');
  if(['Front Load','Top Load','Semi-Automatic'].indexOf(String(d.machineType||''))<0)throw new Error('Invalid machine');
  if(['LG','Samsung','IFB','Whirlpool','Bosch','Haier','Godrej','Other'].indexOf(String(d.brand||''))<0)throw new Error('Invalid brand');
  if(d.brand==='Other' && (!String(d.otherBrand||'').trim() || String(d.otherBrand).length>70))throw new Error('Other brand name required');
  ['sourcePage','area','issue','notes','utmSource','utmMedium','utmCampaign','gclid','gbraid','wbraid'].forEach(function(k){
    if(String(d[k]||'').length>(k==='notes'?800:200))throw new Error(k+' too long');
  });
}
function cleanPhone_(v){return String(v||'').replace(/\D/g,'');}
function findRequest_(sheet,requestId){
  if(sheet.getLastRow()<2)return null;
  var cell=sheet.getRange(2,3,sheet.getLastRow()-1,1)
    .createTextFinder(String(requestId)).matchEntireCell(true).findNext();
  if(!cell)return null;
  return {rowNumber:cell.getRow(),values:sheet.getRange(cell.getRow(),1,1,TS_HEADERS.length).getDisplayValues()[0]};
}
function nextId_(sheet,date){
  var prefix='TS-'+date+'-';
  var n=sheet.getLastRow(),max=0;
  if(n>=2){
    sheet.getRange(2,1,n-1,1).getDisplayValues().forEach(function(x){
      if(String(x[0]).indexOf(prefix)===0)max=Math.max(max,parseInt(String(x[0]).slice(prefix.length),10)||0);
    });
  }
  return prefix+('00000'+(max+1)).slice(-5);
}
function safeCell_(value){
  var s=value==null?'':String(value);
  return /^[\s]*[=+\-@\t\r]/.test(s) ? "'"+s : s;
}
function escapeHtml_(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
});}
function asJson_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function sendEnquiryEmail_(r){
  var entries=[
    ['Reference',r[0]],['Received (IST)',r[1]],['Name',r[4]],['Phone',r[5]],
    ['Machine type',r[6]],['Brand',r[7]==='Other'?r[8]+' (Other)':r[7]],
    ['PIN code',r[9]],['Area / Locality',r[10]],['Reported issue',r[11]],
    ['Additional details',r[12]],['Source page',r[3]],
    ['UTM source',r[13]],['UTM medium',r[14]],['UTM campaign',r[15]],
    ['Google Ads click ID',r[16]]
  ];
  var plain=['TODAYSERVICE.IN - NEW WASHING MACHINE REPAIR REQUEST',''];
  entries.forEach(function(v){if(v[1])plain.push(v[0]+': '+v[1]);});
  plain.push('','Please contact the customer to confirm availability and estimated charges.');
  var phone=cleanPhone_(r[5]);
  var htmlRows=entries.filter(function(v){return v[1];}).map(function(v){return '<tr><td style="padding:10px 8px;border-bottom:1px solid #eee8f5;font-size:13px;color:#655b7b;font-weight:bold">'+escapeHtml_(v[0])+'</td><td style="padding:10px 8px;border-bottom:1px solid #eee8f5;font-size:13px;color:#25213a">'+escapeHtml_(v[1])+'</td></tr>';}).join('');
  var html='<div style="background:#f8f4fd;padding:24px 12px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:white;border-radius:14px;overflow:hidden;border:1px solid #e3d8ef"><div style="padding:24px;background:linear-gradient(110deg,#24105d,#8d209c);color:#fff"><div style="font-size:22px;font-weight:bold">todayservice.in</div><div style="margin-top:5px;font-size:13px">New Washing Machine Repair Request</div></div><div style="padding:22px"><h2 style="font-size:18px;color:#211449;margin:0 0 14px">'+escapeHtml_(r[0])+'</h2><table style="width:100%;border-collapse:collapse">'+htmlRows+'</table><p style="font-size:13px;color:#585267">Contact the customer to confirm repair availability and estimated charges.</p><a href="tel:+91'+phone+'" style="display:inline-block;padding:11px 16px;background:#6227bc;color:white;text-decoration:none;border-radius:7px;font-weight:bold">Call Customer</a> <a href="https://wa.me/91'+phone+'" style="display:inline-block;padding:11px 16px;background:#15995d;color:white;text-decoration:none;border-radius:7px;font-weight:bold">WhatsApp</a></div></div></div>';
  MailApp.sendEmail({
    to:TS_CFG.notifyEmail,
    subject:'TodayService | New Washing Machine Repair Request | '+r[0],
    body:plain.join('\n'),htmlBody:html,
    name:'TodayService Website Enquiries'
  });
}

/** Optional: run manually after the first real enquiry to test email again. */
function testLatestEnquiryEmail(){
  var sheet=getSheet_();
  if(sheet.getLastRow()<2)throw new Error('No enquiries saved yet');
  var row=sheet.getRange(sheet.getLastRow(),1,1,TS_HEADERS.length).getDisplayValues()[0];
  sendEnquiryEmail_(row);
  return 'Test email sent for '+row[0];
}
