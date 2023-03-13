function testRequest(){
  var response = accessProtectedResource("https://api.veracross.com/saas/v3/classes?primary_teacher_id=<#####>")
  Logger.log(JSON.stringify(response))
  showAsTable(response) //Not fully implemented
}

function accessProtectedResource(url, scopes, headers_opt) {

  //Get an authetication Token
  var token = getHTTPRequestToken(scopes);
  if (token) {
    // A token is present, but it may be expired or invalid. Make a
    // request and check the response code to be sure.
    var method ='get';
    var headers = headers_opt || {};
    headers['Authorization'] =
        Utilities.formatString('Bearer %s', token);
    var resp = UrlFetchApp.fetch(url, {
      'method' : method,
      'headers': headers,
      'muteHttpExceptions': true, // Prevents thrown HTTP exceptions.
    });

    var code = resp.getResponseCode();
    var responseText = resp.getContentText("utf-8")
    if (code >= 200 && code < 300) {
      return JSON.parse(resp.getContentText("utf-8")); // Success
    } else if (code == 401 || code == 403) {
       // Not fully authorized for this action.
       maybeAuthorized = false;
    } else {
       // Handle other response codes by logging them and throwing an
       // exception.
       throw ("Backend server error: " + code);
    }
  }

  if (!token) {
      Logger.log("Failed")
  }
}

//////This is the Authentication Code that returns a valid token to make the http request for data. 
//I could not get the OAuth Library to work from the Google Workspace, so this is a raw HTTP request that we got to work. 
function getHTTPRequestToken (scope){
  //In this example, I am grabbing the class list for a teacher. 
  var newScope = scope || "classes:list"
  var options = {
    'method' : 'post',
    'contentType': 'application/x-www-form-urlencoded',
    // Convert the JavaScript object to a JSON string.
    'payload' :"client_id=<CLIENT_id>&" + "client_secret=<CLIENT_SECRET>&" + 
    "scope="+encodeURIComponent(newScope)+"&" + 
    "grant_type=client_credentials"
  };
  
  try {
    var response = UrlFetchApp.fetch("https://accounts.veracross.com/<SCHOOL_SHORT_NAME>/oauth/token/", options)
  }
  catch (e){
    return false;
  }
     var content = JSON.parse(response.getContentText())
     if (content){
       return content.access_token
     }
     else {
       return false
     }
  }


///////////////////////////NOT USED IN ABOVE IMPLEMENTATION

function showAsTable(data){
  var seperator = ',';
$('#json').html(jData);
$('#btnConvert').click(function() {
  ConvertToTable(jData);
});

function ConvertToTable(jData) {
  var arrJSON = typeof jData != 'object' ? JSON.parse(jData) : jData;
  var $table = $('<table/>');
  var $headerTr = $('<tr/>');
  
  for (var index in arrJSON[0]) {
    $headerTr.append($('<th/>').html(index));
  }
  $table.append($headerTr);
  for (var i = 0; i < arrJSON.length; i++) {
   var $tableTr = $('<tr/>');
    for (var index in arrJSON[i]) {
      $tableTr.append($('<td/>').html(arrJSON[i][index]));
    }
    $table.append($tableTr);
  }
  $('body').append($table);
}
}



//https://oauth.pstmn.io/v1/browser-callback
/**
 * Boilerplate code to determine if a request is authorized and returns
 * a corresponding HTML message. When the user completes the OAuth2 flow
 * on the service provider's website, this function is invoked from the
 * service. In order for authorization to succeed you must make sure that
 * the service knows how to call this function by setting the correct
 * redirect URL.
 *
 * The redirect URL to enter is:
 * https://script.google.com/macros/d/<Apps Script ID>/usercallback
 *
 * See the Apps Script OAuth2 Library documentation for more
 * information:
 *   https://github.com/googlesamples/apps-script-oauth2#1-create-the-oauth2-service
 *
 *  @param {Object} callbackRequest The request data received from the
 *                  callback function. Pass it to the service's
 *                  handleCallback() method to complete the
 *                  authorization process.
 *  @return {HtmlOutput} a success or denied HTML message to display to
 *          the user. Also sets a timer to close the window
 *          automatically.
 */
function authCallback(callbackRequest) {
  var authorized = getOAuthService().handleCallback(callbackRequest);
  if (authorized) {
    return HtmlService.createHtmlOutput(
      'Success! <script>setTimeout(function() { top.window.close() }, 1);</script>');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}

/**
 * Unauthorizes the non-Google service. This is useful for OAuth
 * development/testing.  Run this method (Run > resetOAuth in the script
 * editor) to reset OAuth to re-prompt the user for OAuth.
 */
function resetOAuth() {
  getOAuthService().reset();
}
