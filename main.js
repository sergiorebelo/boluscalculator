/* 
* IBC js
* Author: http://maxkalb.github.io/ 
*/

/* Check if the app is executed as webapp */
navigator.standalone = navigator.standalone || (screen.height-document.documentElement.clientHeight<40);
if( navigator.standalone == false ) {
  console.log("IBC browser version");
} else { 
  console.log("IBC webapp version"); 
}

// Variable to identify already passed initialization
var initialized = false;

// Array holding the therapy settings
var settings = [];

// Array holding local storage variable names
var localNames = [];

// Holds the active therapy setting
var selectedTherapy = 0;

// 0 = [mg/dl] ; 1 = [mmol/l]
var glucoseUnits = 0;

/* 
* Some simplyfing getter methods
*/
function getTherapyAim(therapyId) {
  return settings[therapyId].aim;
}
function getTherapyCorrection(therapyId) {
  return settings[therapyId].corr;
}
function getTherapyBolus(therapyId) {
  return settings[therapyId].bolus;
}

/*
* Set default therapy settings and initialize local variable names.
*/
function initDefaultSettings() {
  settings[0] = {aim:100, corr:50, bolus:1.0};
	settings[1] = {aim:100, corr:50, bolus:1.0};
	settings[2] = {aim:120, corr:50, bolus:1.0};
	settings[3] = {aim:120, corr:50, bolus:1.0};
  initLocalNames(); 
}

/*
* Initializes the local storage variable names used for therapies.
*/
function initLocalNames() {
	var therapyId;
  for	(therapyId = 0; therapyId < settings.length; therapyId++) {
    var name1 = "aim" + therapyId;
  	var name2 = "corr" + therapyId;
  	var name3 = "bolus" + therapyId;
    localNames[therapyId] = {aim:name1, corr:name2, bolus:name3};
  }
}

/*
* Initializes the settings array with local stored values and the user inputs. 
*/
function initLocalSettings() {
  var therapyId;
  for( therapyId = 0; therapyId < settings.length; therapyId++ ) {
    loadTherapySettings(therapyId);
  }
  
  if( localStorage.getItem("glucose") != null ) {
    var bg = localStorage.getItem("glucose");
    document.getElementById('glucose').value = bg;
  }
    
  if( localStorage.getItem("meal") != null ) {
    document.getElementById('foodbe').value = localStorage.getItem("meal");
  }
}

/*
* Overwrites the therapy setting with local storage values (if exist).
*/
function loadTherapySettings( therapyId ) {
  var stringAimName = localNames[therapyId].aim;
  var stringCorrName = localNames[therapyId].corr;
  var stringBolusName = localNames[therapyId].bolus;
  
  if( localStorage.getItem(stringAimName) != null )
    settings[therapyId].aim = localStorage.getItem(stringAimName);
  if( localStorage.getItem(stringCorrName) != null )
    settings[therapyId].corr = localStorage.getItem(stringCorrName);
  if( localStorage.getItem(stringBolusName) != null )
    settings[therapyId].bolus = localStorage.getItem(stringBolusName);
}

/*
* Overwrites the default blood glucose unit with local storage (if exist)
* and selects the correspondig units select option.  
*/
function initLocalUnits() {
  if( localStorage.getItem('bgunits') != null )
    glucoseUnits = localStorage.getItem('bgunits'); 
  setSelectedGlucoseUnit();
}

/*
* Gets called if the page gets loaded (used as initialization).
*/
window.onload = function () {
  initDefaultSettings();
  initLocalSettings();
  initLocalUnits();
  autoTherapySetting();
  updateTime();
  initialized = true;
}


/*
* Writes the therapy settings of the given id into local storage. 
*/
function saveTherapySettings( therapyId ) {
  localStorage.setItem(localNames[therapyId].aim, getTherapyAim(therapyId));
  localStorage.setItem(localNames[therapyId].corr, getTherapyCorrection(therapyId));
  localStorage.setItem(localNames[therapyId].bolus, getTherapyBolus(therapyId));
}

/*
* Writes the blood glucose units into local storage. 
*/
function saveLocalUnits() {
  localStorage.setItem('bgunits', glucoseUnits);
}

/*
* Writes the user inputs, glucose and meal, into the local storage.
*/
function saveGlucoseAndMeal() {
  localStorage.setItem("glucose", document.getElementById('glucose').value);
  localStorage.setItem("meal", document.getElementById('foodbe').value);
}

/*
* Transforms a value from [mg/dl] to [mmol/l].
*/
function mgDl2mmoll( mgDlVal ) {
  return parseFloat( mgDlVal ) / 18.0;
}

/*
* Transforms a value from [mmol/l] to [mg/dl].
*/
function mmoll2mgDl( mmolVal ) {
  return parseFloat( mmolVal ) * 18.0;
}

/* 
 * Called when the user changes the glucose measurement unit. 
 */
function glucoseUnitChanged() {
  glucoseUnits = document.getElementById('selectGlucoseUnit').selectedIndex;
  transformGlucoseUnits();
  saveLocalUnits();
}

/*
* Transfroms all glucose inputs into the given unit, updates ui and local storage. 
*/
function transformGlucoseUnits() {

  // Changed displayed units
  setSelectedGlucoseUnit();

  // Change displayed values
  var glucoseInput = document.getElementById('glucose');
  var settingsAim  = document.getElementById('settingsAim');
  var settingsCorr = document.getElementById('settingsCorr');
  
  // Transfrom values from [mmol/l] to [mg/dl]
  if( glucoseUnits == 0 ) {
    glucoseInput.value = mmoll2mgDl( glucoseInput.value ).toFixed(0);
    settingsAim.value  = mmoll2mgDl( settingsAim.value ).toFixed(0);
    settingsCorr.value = mmoll2mgDl( settingsCorr.value ).toFixed(0);
    
    for( var i=0; i<4; i++ ) {
      settings[i].aim = mmoll2mgDl( settings[i].aim ).toFixed(0);
      settings[i].corr = mmoll2mgDl( settings[i].corr ).toFixed(0);
      
      saveTherapySettings(i);
    }
  } // Transfrom values from [mg/dl] to [mmol/l]
  else {
    glucoseInput.value = mgDl2mmoll( glucoseInput.value ).toFixed(2);
    settingsAim.value  = mgDl2mmoll( settingsAim.value ).toFixed(2);
    settingsCorr.value = mgDl2mmoll( settingsCorr.value ).toFixed(2);
    
    for( var i=0; i<4; i++ ) {
      settings[i].aim = mgDl2mmoll( settings[i].aim ).toFixed(2);
      settings[i].corr = mgDl2mmoll( settings[i].corr ).toFixed(2);
      
      saveTherapySettings(i);
    }
  }
  saveGlucoseAndMeal();
  updateTherapySettings();
}

/* 
 * Sets the selected index of the blood glucose units option to 'glucoseUnits'. 
 */
function setSelectedGlucoseUnit() {
  var select = document.getElementById('selectGlucoseUnit');
  var settingsAim  = document.getElementById('settingsAim');
  var settingsCorr = document.getElementById('settingsCorr');
  
  if( select.selectedIndex != glucoseUnits ) {
    select.selectedIndex = glucoseUnits;
  }
  
  if( glucoseUnits == 0 ) {
    document.getElementById('glucoseAimUnit').innerHTML = "mg/dl";
    document.getElementById('correctionUnit').innerHTML = "mg/dl";
  }
  else {
    document.getElementById('glucoseAimUnit').innerHTML = "mmol/l";
    document.getElementById('correctionUnit').innerHTML = "mmol/l";
  }
}


/*
* Returns a string with the main therapy informations.
*/
function getTherapyInfoText(therapyId) {
  var infoText = "Aim " + getTherapyAim(therapyId) + " "
							 + "Corr " + getTherapyCorrection(therapyId) + " "
  						 + "Meal " + getTherapyBolus(therapyId);
  return infoText;
}

/*
* Returns the therapy name of the given id. 
*/
function getTherapyName(therapyId) {
  var therapyName = "";
  if( therapyId == 0 ) therapyName = "Morning (06:00-12:00)";
  if( therapyId == 1 ) therapyName = "Noontime (12:00-18:00)";
  if( therapyId == 2 ) therapyName = "Evening (18:00-24:00)";
  if( therapyId == 3 ) therapyName = "Late (00:00-06:00)";
  return therapyName;
}

/*
* Updates the GUI by viewing the values stored in the settings array. 
*/
function updateTherapySettings() {
  refreshSettings(selectedTherapy);
  return selectedTherapy;
}

/*
* Puts the UI values into the settings array and updates the GUI. 
*/
function changeTherapySettings() {
  settings[selectedTherapy].aim = document.getElementById('settingsAim').value;
  settings[selectedTherapy].corr = document.getElementById('settingsCorr').value;
  settings[selectedTherapy].bolus = document.getElementById('settingsBolus').value;
  saveTherapySettings(selectedTherapy);
  updateTherapySettings();
}

/*
* Takes the settings and applies them to the gui.
*/
function refreshSettings(therapyId) {
  var therapyInfo = document.getElementById('therapyInfo');
  var therapySetup = document.getElementById('therapySetup');
  
  therapyInfo.innerHTML = getTherapyInfoText(therapyId);
  therapySetup.innerHTML = getTherapyName(therapyId);
  document.getElementById('settingsAim').value = getTherapyAim(therapyId);
  document.getElementById('settingsCorr').value = getTherapyCorrection(therapyId);
  document.getElementById('settingsBolus').value = getTherapyBolus(therapyId);
  
  updateCalculations();
}

/*
* Automaticly choose the therapy setting depending on the actual daytime.
*/
function autoTherapySetting() {
  var daytimeId = getTherapyDaytime();
  setTherapy( daytimeId );
}

/*
* Toggles (show/hide) the settings. 
*/
function toggleSettings() {
	var e = document.getElementById('settings');
	var btn = document.getElementById('settingsButton');
  if ( e.style.display == 'block' ) {
    hideElement(e);
    btn.style.border = "1px solid transparent";
  }
  else {
    showElement(e);
    btn.style.border = "1px solid #ccc";
    window.scrollTo(0, document.body.scrollHeight);
  }
  return false;
}

/*
* Toggles (show/hide) the app setup page. 
*/
function toggleSetup() {
  var e = document.getElementById('setupGroup');
  var btn = document.getElementById('setupButton');
  if ( e.style.display == 'block' ) {
    hideElement(e);
    btn.style.border = "1px solid transparent";
  }
  else {
    showElement(e);
    btn.style.border = "1px solid #ccc";
    window.scrollTo(0, document.body.scrollHeight);
  }
}

/*
* Hides the given element after opacity transition
*/
function hideElement(elem) {
  elem.style.opacity = 0;
  /* The following static delayed call to afterTransition 
     could/should be added as event listener to transitionend. */
  tTimeout = setTimeout(function() { afterTransition(elem); }, 500);
}
function afterTransition(elem) {
  elem.style.display = 'none';
}


/*
* Shows the given element after opacity transition
*/
function showElement(elem) {
  elem.style.display = 'block';
  tTimeout = setTimeout(function() { timeoutShow(elem); }, 1);
}
function timeoutShow(elem) {
  elem.style.opacity = 1;
}


/*
* Return the index of the select button elem.
*/
function getIndexOfSelectButton(elem) {
  var sub = document.getElementsByClassName("selectButton");
  for(var i=0; i<sub.length; i++)
    if( sub[i] == elem )
      return i;
  return -1; 
}

/*
* Called if the user selects a therapy.
*/
function selectTherapy(elem) {
  setTherapy( getIndexOfSelectButton(elem) );
}

/*
* Sets the border color of the therapy buttons.
*/
function updateTherapyColor() {
  var badSelection = false;
  var infotext = document.getElementById("therapySetup");
  var buttons = document.getElementsByClassName("selectButton");
  for( var i=0; i<buttons.length; i++ ) {
    if( i == selectedTherapy && i != getTherapyDaytime() ) badSelection = true;
    else buttons[i].style.border = "0.1em solid transparent";
  }
  if( badSelection == true ) {
    buttons[ selectedTherapy ].style.border = "0.1em solid #FAA";
    infotext.style.color = "#D00";
  }
  else { 
    buttons[ selectedTherapy ].style.border = "0.1em solid #ccc";
    infotext.style.color = "#444";
  }
}

/*
* Switches to the given therapy setting id.
*/
function setTherapy(id) {
  selectedTherapy = id;
  updateTherapyColor();
  refreshSettings(id);
  updateTherapySettings();
}

/*
* Calculate correction
*/
function calcCorrection(therapyId) {
  var glu = document.getElementById('glucose').value;
  var gluAim = getTherapyAim(therapyId);
  var corr = getTherapyCorrection(therapyId);
  var result = (glu - gluAim) / corr;
  if( glu == "" || gluAim == "" || corr == "" ) result = NaN;
  return result;
}

/*
* Calculate meal
*/
function calcEffectiveFood(therapyId) {
  var food = document.getElementById("foodbe").value;
  var factor = getTherapyBolus(therapyId);
  var result = food * factor;
  if( food = "" || factor == "" ) result = NaN;
  return result;
}

/*
* Recalculate results and save user input settings.
*/
function updateCalculations() {
  var bolusElement = document.getElementById('finalBolus');
    
  var correction = calcCorrection( selectedTherapy );
  var effectiveFood = calcEffectiveFood( selectedTherapy );
  var finalBolus = correction + effectiveFood;
  if( isNaN(correction) ) finalBolus = 0;
  if( isNaN(effectiveFood) ) finalBolus = 0;
  
  var bolusInvalid = finalBolus == 0;
  
  /* Set final bolus result (text) */
  if( bolusInvalid ) bolusElement.value = "";
  else bolusElement.value = finalBolus.toFixed(2);
 
  /* Set final bolus result (color) */
  if( bolusInvalid ) bolusElement.style.color = "#444";
  else if( finalBolus <= 0 ) bolusElement.style.color = "darkgreen";
  else bolusElement.style.color = "#D00";
  
  /* Update residual results (correction and meal) */
  var elemSum = document.getElementById('sum');
 
  var calcString = "";
  if( !bolusInvalid ){
    calcString = "Corr (" + correction.toFixed(2) + ") + Meal (" + effectiveFood.toFixed(2) + ")";
    elemSum.style.background = "#fff";
  }
  else { elemSum.style.background = "transparent"; }
  elemSum.innerHTML = calcString;
  
  /* Always store inputs */
  saveGlucoseAndMeal();
}

/*
* Checks if the given elements value is a number.
*/
function validateInputNumber(elementID) {
  var x = document.getElementById(elementID).value;
  if (isNaN(x)) // this is the code I need to change
  {
    alert("Must input numbers");
    return false;
  }
}

/*
* Frequently called to update the therapy colors to indicate a wrong selection.
*/
function updateTime() {
  var timeOutMs = 10000;
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  if (minutes < 10){
      minutes = "0" + minutes;
  }
  if (seconds < 10){
      seconds = "0" + seconds;
  }
  var v = " " + hours + ":" + minutes + " ";
  setTimeout("updateTime()", timeOutMs);
  document.getElementById('therapyTime').innerHTML = v;
    
  if( initialized == true && selectedTherapy != getTherapyDaytime() ) {
  	updateTherapyColor();
  }
}

/*
* Returns an ID for the daytime depending on the actual time.
* Return values: 0 = morning, 1 = noontime, 2 = evening, 3 = late.
*/
function getTherapyDaytime() {
	var daytime = 0;
  var currentTime = new Date();
  var hours = currentTime.getHours();
  if( hours >= 6 && hours < 12 ) daytime = 0;
  if( hours >= 12 && hours < 18 ) daytime = 1;
  if( hours >= 18 && hours < 24 ) daytime = 2;
  if( hours >= 0 && hours < 6 ) daytime = 3;
  return daytime;  
}


var tid = 0;      /* Active timer id for incrementation */
var speed = 250;  /* Time between incrementations [ms] */
var start = 0;    /* Starting time of mouse down */
var duration = 0; /* Duration of mouse down */

// Check if the device has touch enabled
var isTouch = 'ontouchstart' in window;


/*
* Touchstart and mousedown event equalization.
* Ignore any mouse down event on touch devices. 
*/
function mouseDown(element, value, minimum, decimals) {
  if( !isTouch ) { 
    touchDown(element, value, minimum, decimals);
  }
}
function touchDown(element, value, minimum, decimals) {
  toggleOn(element, value, minimum, decimals);
}

/*
* Touchend and mouseup event equalization.
* Ignore any mouse up event on touch devices. 
*/
function mouseUp() {
  if( !isTouch ) { 
    touchUp();
  }
}
function touchUp(element, value, minimum, decimals) {
  toggleOff();
}

/*
* Starts a timer for continous incrementation on mouse down
*/
function toggleOn(element, value, minimum, decimals) {
  duration = 0;
  var id = element.id;
  if( tid == 0 ) {
    start = new Date().getTime();
    tid = setInterval('incrementElement("'+id+'", '+value+', '+minimum+', '+decimals+')', speed);
  }
  else toggleOff();
}

/*
* Starts a timer for continous incrementation on mouse down
*/
function toggleOff() {
  if( tid !=0 ) {
    var end = new Date().getTime();
    duration = end - start;
    clearInterval(tid);
    tid = 0;
  }
}

/*
* Helper function to increment values of input field elemId.
*/
function incrementElement(elemId, value, minimum, decimals) {
  // Dismiss onclick event while releasing pressed down button  
  if( duration > speed ) return false; 

  var element = document.getElementById(elemId);
  var min = parseFloat(minimum);
  var old = parseFloat(element.value);
  var add = parseFloat(value);
  var dec = parseInt(decimals);
  
  if( isNaN(min) ) min = -Number.MAX_VALUE;
  if( isNaN(old) ) old = 0; 
  if( isNaN(add) ) add = 0;
  if( isNaN(dec) ) dec = 0;
  
  var out = old + add;
  
  if( out <= min ) element.value = "";
  else element.value = out.toFixed(dec);
  
  updateCalculations();
}

