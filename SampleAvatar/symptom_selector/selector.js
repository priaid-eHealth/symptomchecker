/**
 * ApiMedic.com Sample Avatar, a demo implementation of the ApiMedic.com Symptom Checker by priaid Inc, Switzerland
 * 
 * Copyright (C) 2012 priaid inc, Switzerland
 * 
 * This file is part of The Sample Avatar.
 * 
 * This is free implementation: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License Version 3 as published by the Free Software Foundation.
 * 
 * The ApiMedic.com Sample Avatar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * 
 * See the GNU General Public License for more details. You should have received a copy of the GNU
 * General Public License along with ApiMedic.com. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Authors: priaid inc, Switzerland
 */

var keys = [
    "litTermsOfUsePolicyPrivacy",//disclaimerText
    "litDisclaimerNotChecked",//disclaimerNotAcceptedText
    "litAddAdditionalComplaints",//noSelectedSymptomsText
    "litEmergencyInfo",//diagnosisMessage
    "litEmptyDiagnosisDataTemplate",//noDiagnosisMessage
    "litSuggestedSymptoms",//proposedSymptomsText
    "litCarouselItem4",//symptomListMessage
    "genAvatarText",//skinText
    "litYears",//bornOnText
    "litSearchSymptoms",//typeYourSymptomsText
    "genSelectSymptoms",//selectSymptomsText
    "genSelectedSymptoms",//selectedSymptomsText
    "genPossibleDiseases",//possibleDiseasesText
    "btnGenerateDiagnose",//makeDiagnosisText
    "txtProfessionalName",//litProfName
    "genShortDescription",//litShortDescription
    "genDescription",//litDescription
    "genOccurrence",//litOccurrence
    "genSymptom",//litSymptom
    "genFollow1",//litFollow
    "genTreatment",//litTreatment
    "litPossibleSymptoms",//litPossibleSymptoms
    "litTermsOfUse", //litTermsOfUse
    "litPrivacyPolicy" // litPrivacyPolicy
];

var disclaimerText = "";
var disclaimerNotAcceptedText = "";
var noSelectedSymptomsText = "";
var diagnosisMessage = "";
var noDiagnosisMessage = "";
var proposedSymptomsText = "";
var symptomListMessage = "";
var skinText = "";
var bornOnText = "";
var typeYourSymptomsText = "";
var selectSymptomsText = "";
var selectedSymptomsText = "";
var possibleDiseasesText = "";
var makeDiagnosisText = "";

var litProfName = "";
var litShortDescription = "";
var litDescription = "";
var litOccurrence = "";
var litSymptom = "";
var litFollow = "";
var litTreatment = "";
var litPossibleSymptoms = "";
var litTermsOfUse = "";
var litPrivacyPolicy = "";
var resObj = {};



/////////////////////////////Optional parameters//////////////////////////////////

/// Path to priaid webservice
var pathToWebservice;

/// Only for internal use
var currentPlatform = "webservice";

/// Required language
var language = "";

/// Security token for webservice access
var token;

/// Specialisation search url
var specUrl = "/specialisation";

/// Include always all specialisations for custom urls
var includeAllSpec = false;

/// Use redirect mode instead of selecting body parts
var redirectMode = false;

/// Redirect address
var redirectUrl = "";

/// Terms url
var termsUrl = "http://apimedic.net/resources/enduser_priaid_terms.pdf"; // Replace this with your terms html page which includes the referenced End User Terms of Use and Privacy Policy

/// Privacy url
var privacyUrl = "http://apimedic.net/resources/enduser_priaid_privacy.pdf"; // Replace this with your privacy policy html page which includes the referenced End User Privacy Policy and Terms of Use

/// SelectorMode : diagnosis or specialisation
var mode = "diagnosis";

//////////////////////////////////////////////////////////////////////
/////////////Symptom selector plugin start///////////////////////

(function ($) {

    var _plugin;

    var selectorStatus =
        {
            Man: "Man",
            Woman: "Woman",
            Boy: "Boy",
            Girl: "Girl"
        };

    var Gender =
        {
            Male: "Male",
            Female: "Female"
        };

    var SymptomsLocations =
        {
            Head: 6,
            Chest: 15,
            Arms: 7,
            Legs: 10,
            Hips: 16,
            Skin: 17
        };

    var _childAvatar;
    var _womanAvatar;
    var _manAvatar;
    var _childAvatarSmall;
    var _womanAvatarSmall;
    var _manAvatarSmall;
    var _symptomList;

    var _yearSelector;

    var _selectedSelectorStatus;
    var _selectedBodyPart;
    var _selectedGender;
    var _selectedYear;

    var d = new Date();
    var n = parseInt(d.getFullYear());

    var _defaultAdultYear = n - 25;
    var _defaultChildYear = n - 8;
    var _edgeYears = n - 11;

    var _statusLinkBorderColor = "cccccc";
    var pathToImages = "symptom_selector/images";
    var symptomListId = "symptomList";
    var _diagnosisListId = "diagnosisList";



    var methods = {

        init: function (options) {

            return this.each(function () {
                _plugin = $(this);
                pathToWebservice = options.webservice;
                language = options.language;
                token = options.accessToken;

                if (options.specUrl) {
                    specUrl = options.specUrl;
                }

                if (options.includeAllSpec)
                    includeAllSpec = options.includeAllSpec;

                if (options.platform)
                    currentPlatform = options.platform;

                if (options.redirectUrl) {
                    setCookie("selectedBodyPart", "", -1);
                    redirectUrl = options.redirectUrl;
                }

                if (options.termsUrl) {
                    termsUrl = options.termsUrl;
                }

                if (options.privacyUrl) {
                    privacyUrl = options.privacyUrl;
                }

                if (options.mode) {
                    mode = options.mode;
                }

                _ajaxGetSpecificResources();

            });
        },
        Resize: function (options) {
            var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
            _resizeSelector(currentAvatar);
        },
        Select: function (options) {
            var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
            _resizeSelector(currentAvatar);
        },
        GetSelectedSymptoms: function (options) {
            return $("#" + symptomListId).symptomList("GetSelectedSymptoms");
        },
        Unbind: function (options) {
            if (_symptomList.children().length != 0)
                _symptomList.symptomList("Unbind");
            if ($("#" + _diagnosisListId).children().length != 0)
                $("#" + _diagnosisListId).diagnosis("Unbind");

            var avatar = _getAvatarByStatus(_selectedSelectorStatus);
            avatar.mapster('unbind');

            $("#prefetch .typeahead").typeahead("destroy");
            _plugin.unbind('click');
            _plugin.empty();
        }
    };

    $.fn.symptomSelector = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.symptomSelector');
        }

    };

    //////////////////ajax calls//////////////////////////////////////////

    function _ajaxGetSymptoms(initTypeAhead) {
        $.ajax({
            url: pathToWebservice + "/symptoms/0/" + _selectedSelectorStatus,
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    platform: currentPlatform
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: false,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "fillResults",
            success: function (responseData) { fillResults(responseData, initTypeAhead); },
            beforeSend: function (jqXHR, settings) {
                $('#loader').show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                $('#loader').hide();
            }
        });

    }

    function _ajaxGetSpecificResources() {
        $.ajax({
            url: pathToWebservice + "/specificresources",
            type: "GET",
            data:
                {
                    keys: JSON.stringify(keys),
                    token: token,
                    format: "json",
                    language: language
                },
            async: false,
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "_setSpecificResourcesCallback",
            success: function (responseData) { _setSpecificResourcesCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
            }
        });
    }

    //////////////////ajax calls end//////////////////////////////////////

    //////////////////private functions//////////////////////////////////////////
    function _setUpSelector() {
        _selectedSelectorStatus = getCookie("selectedSelectorStatus") !== "" ? getCookie("selectedSelectorStatus") : selectorStatus.Man;
        _selectedBodyPart = getCookie("selectedBodyPart") !== "" ? parseInt(getCookie("selectedBodyPart")) : "";
        //_selectedBodyPart = "";
        _selectedGender = getCookie("selectedGender") !== "" ? getCookie("selectedGender") : Gender.Male;
        _selectedYear = getCookie("selectedYear") !== "" ? parseInt(getCookie("selectedYear")) : _defaultAdultYear;

        _createSelectorHeader();
        _createSelectorTable();
        _createImageMaps();

        var avatarOptions = new Object();
        avatarOptions.LocationId = _selectedBodyPart;
        avatarOptions.SelectorStatus = _selectedSelectorStatus;
        avatarOptions.Gender = _selectedGender;
        avatarOptions.YearOfBirth = _selectedYear;
        _ajaxGetSymptoms(true);
        _symptomList = $("#" + symptomListId).symptomList(avatarOptions);
        _symptomList.symptomList("LoadBodyLocations", avatarOptions);
        _highlightBodyParts();
    }

    function _createSelectorTable() {
        var selectorTable = jQuery("<table/>", {
        });

        var selectorTableRow = jQuery("<tr/>", {
        });

        var statusContainer = _createChangeStatusContainer();

        var avatarContainer = _createAvatarContainer();

        selectorTableRow.append(statusContainer);
        selectorTableRow.append(avatarContainer);

        selectorTable.append(selectorTableRow);

        _markSelectedStatus(_selectedSelectorStatus);

        _plugin.append(selectorTable);

        if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
            _createChildGenderSelector();
        }
    }
    function _createChangeStatusContainer() {
        var statusContainer = jQuery("<td/>", {
            "class": "status-container"
        });

        this._manAvatarSmall = _createStatusChangeLink(selectorStatus.Man);
        this._womanAvatarSmall = _createStatusChangeLink(selectorStatus.Woman);
        //TODO: ADD girl avatar
        this._childAvatarSmall = _createStatusChangeLink(selectorStatus.Boy);

        statusContainer.append(this._manAvatarSmall);
        statusContainer.append(this._womanAvatarSmall);
        statusContainer.append(this._childAvatarSmall);

        return statusContainer;
    }

    function _createAvatarContainer() {
        var avatarContainer = jQuery("<td/>", {
            "class": "avatar-container"
        });

        return avatarContainer;
    }

    function _createImageMaps() {
        _addImages();
        _createManMap();
        _createWomanMap();
        _createChildMap();
        _createSkinLink();
    }

    function _addImages() {
        this._manAvatar = jQuery("<img/>", {
            id: "manImg",
            src: pathToImages + "/male.png",
            usemap: "#manMap"
        });

        this._womanAvatar = jQuery("<img/>", {
            id: "womanImage",
            src: pathToImages + "/female.png",
            usemap: "#womanMap"
        });

        this._childAvatar = jQuery("<img/>", {
            id: "childImage",
            src: pathToImages + "/child.png",
            usemap: "#childMap"
        });

        switch (_selectedSelectorStatus) {
            case (selectorStatus.Man):
                this._womanAvatar.hide();
                this._childAvatar.hide();
                break;
            case (selectorStatus.Woman):
                this._manAvatar.hide();
                this._childAvatar.hide();
                break;
            case (selectorStatus.Boy):
                this._manAvatar.hide();
                this._womanAvatar.hide();
                break;
            case (selectorStatus.Girl):
                this._manAvatar.hide();
                this._womanAvatar.hide();
                break;
        }

        _plugin.find(".avatar-container").append(this._manAvatar);
        _plugin.find(".avatar-container").append(this._womanAvatar);
        _plugin.find(".avatar-container").append(this._childAvatar);
    }

    function _createManMap() {
        var manMap = jQuery("<map/>", {
            id: "manMap",
            name: "manMap"
        });

        var area1 = jQuery("<area/>", {
            shape: "poly",
            coords: "152,3, 150,1, 134,5, 123,12, 116,26, 114,41, 111,52, 114,64, 120,77, 124,86, 126,98, 123,110, 183,110, 179,98, 181,87, 183,75, 189,66, 195,59, 193,51, 191,46, 187,39, 186,31, 186,25, 181,17, 177,12, 171,6, 161,1, 154,1",
            accesskey: "0",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Head); }
        });

        var area2 = jQuery("<area/>", {
            shape: "poly",
            coords: "122,109, 119,106, 109,115, 97,121, 86,123, 79,126, 75,127, 75,182, 75,202, 76,213, 78,227, 79,237, 82,252, 84,258, 86,268, 221,268, 230,233, 233,213, 233,187, 233,175, 233,160, 233,126, 229,124, 204,117, 189,110, 117,110",
            accesskey: "1",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Chest); }
        });

        var area3 = jQuery("<area/>", {
            shape: "poly",
            coords: "85,268, 91,303, 90,319, 87,342, 84,363, 83,380, 80,400, 79,411, 79,420, 80,433, 231,433, 231,398, 229,375, 224,340, 222,316, 220,287, 221,268, 84,268",
            accesskey: "2",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Hips); }
        });

        var area4 = jQuery("<area/>", {
            shape: "poly",
            coords: "80,433, 78,433, 80,453, 84,481, 85,505, 84,532, 80,559, 77,585, 79,612, 83,653, 85,691, 85,716, 79,734, 76,753, 85,764, 99,767, 111,766, 120,762, 126,754, 125,741, 123,725, 121,707, 116,671, 117,647, 126,626, 127,606, 127,590, 124,577, 124,567, 135,524, 141,489, 146,466, 150,450, 153,438, 158,441, 166,468, 172,505, 181,547, 186,569, 182,592, 183,612, 188,639, 191,659, 188,704, 186,738, 185,754, 190,767, 207,767, 224,762, 232,753, 232,742, 227,730, 222,720, 223,705, 221,685, 221,677, 225,653, 230,622, 232,599, 231,567, 228,538, 228,511, 230,488, 232,467, 231,447, 231,433, 79,433",
            accesskey: "3",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Legs); }
        });

        var area5 = jQuery("<area/>", {
            shape: "poly",
            coords: "51,130, 33,146, 25,170, 25,187, 26,222, 24,239, 27,265, 22,283, 20,301, 21,316, 22,326, 16,338, 8,354, 6,363, 1,376, 6,380, 14,369, 23,382, 26,401, 34,414, 47,411, 50,405, 52,396, 56,392, 60,378, 59,360, 55,347, 53,337, 54,324, 59,303, 65,288, 66,270, 65,253, 65,249, 75,236, 75,221, 75,124, 53,129, 233,126, 262,136, 274,152, 280,174, 279,194, 282,221, 286,253, 283,286, 285,312, 288,340, 297,348, 301,362, 307,374, 305,378, 298,373, 293,366, 288,383, 282,403, 273,413, 266,411, 261,404, 258,397, 254,394, 250,375, 248,357, 250,349, 251,344, 255,333, 255,326, 250,300, 246,276, 244,255, 233,242, 233,237, 233,125",
            accesskey: "4",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Arms); }
        });

        manMap.append(area1);
        manMap.append(area2);
        manMap.append(area3);
        manMap.append(area4);
        manMap.append(area5);

        _plugin.find(".avatar-container").append(manMap);
    }

    function _createWomanMap() {
        var womanMap = jQuery("<map/>", {
            id: "womanMap",
            name: "womanMap"
        });

        var area1 = jQuery("<area/>", {
            shape: "poly",
            coords: "150,1, 124,8, 115,17, 110,36, 104,54, 98,71, 96,85, 98,102, 107,119, 118,130, 122,138, 185,138, 189,135, 187,132, 189,125, 201,113, 207,95, 208,76, 205,65, 201,52, 199,33, 195,24, 185,11, 168,3, 153,1",
            accesskey: "0",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Head); }
        });

        var area2 = jQuery("<area/>", {
            shape: "poly",
            coords: "121,139, 105,139, 95,187, 89,208, 90,220, 96,227, 103,235, 105,245, 204,245, 206,236, 211,226, 218,217, 221,209, 219,194, 201,142, 188,139, 120,139",
            accesskey: "1",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Chest); }
        });

        var area3 = jQuery("<area/>", {
            shape: "poly",
            coords: "104,244, 106,270, 108,292, 103,311, 97,329, 92,346, 90,359, 90,375, 91,386, 222,386, 223,365, 220,348, 217,329, 211,315, 208,300, 203,287, 203,277, 204,260, 205,244, 103,244",
            accesskey: "2",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Hips); }
        });

        var area4 = jQuery("<area/>", {
            shape: "poly",
            coords: "91,386, 94,437, 101,489, 109,532, 105,554, 99,577, 98,595, 102,621, 112,664, 116,704, 105,729, 96,742, 94,752, 104,760, 121,764, 133,762, 139,755, 143,747, 143,735, 138,714, 140,662, 144,626, 146,596, 141,559, 140,545, 142,513, 145,482, 148,447, 150,410, 147,397, 151,392, 157,396, 159,423, 160,463, 163,505, 167,537, 165,565, 159,594, 162,625, 166,652, 168,687, 166,714, 163,735, 162,752, 169,761, 185,765, 204,760, 213,747, 211,738, 205,732, 195,715, 191,695, 192,674, 197,653, 203,630, 209,607, 211,585, 207,568, 202,556, 200,540, 199,523, 205,501, 211,475, 215,456, 221,426, 221,405, 222,386, 94,386",
            accesskey: "3",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Legs); }
        });

        var area5 = jQuery("<area/>", {
            shape: "poly",
            coords: "106,141, 84,141, 68,148, 60,163, 56,184, 53,227, 49,264, 47,289, 38,316, 28,344, 13,361, 3,368, 3,374, 13,375, 7,390, 8,400, 15,407, 33,403, 41,388, 46,374, 46,361, 53,344, 64,323, 74,298, 80,275, 83,247, 85,217, 93,194, 106,141, 205,141, 224,141, 234,148, 251,169, 256,189, 259,217, 263,245, 269,267, 276,293, 279,326, 283,346, 295,359, 304,370, 301,375, 293,374, 300,386, 302,396, 296,404, 287,407, 276,404, 270,393, 266,380, 262,364, 263,351, 258,335, 249,315, 244,294, 237,267, 233,241, 226,213, 200,141",
            accesskey: "4",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Arms); }
        });

        womanMap.append(area1);
        womanMap.append(area2);
        womanMap.append(area3);
        womanMap.append(area4);
        womanMap.append(area5);

        _plugin.find(".avatar-container").append(womanMap);
    }

    function _createChildMap() {
        var childMap = jQuery("<map/>", {
            id: "childMap",
            name: "childMap"
        });

        var area1 = jQuery("<area/>", {
            shape: "poly",
            coords: "125,1, 89,12, 78,32, 75,63, 79,92, 91,115, 101,128, 96,152, 160,152, 154,129, 169,111, 177,91, 182,61, 180,33, 168,13, 147,4, 128,2",
            accesskey: "0",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Head); }
        });

        var area2 = jQuery("<area/>", {
            shape: "poly",
            coords: "94,147, 92,147, 70,153, 56,158, 56,263, 59,286, 62,307, 196,307, 204,266, 199,161, 163,152, 94,152",
            accesskey: "1",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Chest); }
        });

        var area3 = jQuery("<area/>", {
            shape: "poly",
            coords: "60,307, 59,343, 58,376, 61,439, 192,439, 197,399, 199,362, 197,329, 197,307, 66,307",
            accesskey: "2",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Hips); }
        });

        var area4 = jQuery("<area/>", {
            shape: "poly",
            coords: "61,439, 61,474, 66,531, 65,569, 69,613, 74,651, 78,693, 75,716, 56,746, 57,756, 73,762, 89,764, 102,758, 111,744, 114,730, 113,720, 110,706, 113,676, 117,643, 121,598, 119,568, 121,539, 123,511, 125,475, 127,440, 131,511, 132,559, 133,597, 135,627, 139,660, 147,701, 144,733, 150,751, 164,761, 183,764, 202,757, 202,749, 195,737, 184,714, 179,688, 184,651, 188,610, 189,581, 187,556, 186,526, 189,489, 191,458, 193,439, 64,439",
            accesskey: "3",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Legs); }
        });

        var area5 = jQuery("<area/>", {
            shape: "poly",
            coords: "56,158, 34,175, 27,193, 21,216, 18,246, 16,276, 11,300, 6,329, 6,356, 7,389, 9,415, 10,437, 12,450, 18,459, 34,465, 43,463, 46,445, 47,432, 46,419, 40,407, 38,387, 41,356, 46,323, 46,305, 48,281, 56,264, 56,158, 199,162, 218,173, 229,196, 236,235, 243,290, 252,324, 251,349, 249,382, 252,412, 250,448, 234,464, 221,465, 214,449, 212,432, 216,415, 221,401, 223,380, 217,348, 215,321, 211,299, 204,273, 199,162",
            accesskey: "4",
            href: "javascript:void(0)",
            click: function () { _selectBodyPart(SymptomsLocations.Arms); }
        });

        childMap.append(area1);
        childMap.append(area2);
        childMap.append(area3);
        childMap.append(area4);
        childMap.append(area5);

        _plugin.find(".avatar-container").append(childMap);
    }

    function _createStatusChangeLink(selectedStatus) {
        var imgSrc;
        switch (selectedStatus) {
            case selectorStatus.Man:
                imgSrc = pathToImages + "/male_small.png";
                break;
            case selectorStatus.Woman:
                imgSrc = pathToImages + "/female_small.png";
                break;
            case selectorStatus.Boy:
                imgSrc = pathToImages + "/child_small.png";
                break;
            case selectorStatus.Girl:
                imgSrc = pathToImages + "/child_small.png";
                break;
        }

        var statusLink = jQuery("<a/>", {
            "class": "status-change-link",
            href: "javascript:void(0)",
            click: function () { _setSelectorStatus(selectedStatus); }
        });

        var statusLinkImg = jQuery("<img/>", {
            src: imgSrc
        });

        statusLink.append(statusLinkImg);

        return statusLink;
    }

    function _createSkinLink() {
        var skinLink = jQuery("<a/>", {
            "class": "skin-link",
            href: "javascript:void(0)",
            //text: skinText,
            click: function () { _selectBodyPart(SymptomsLocations.Skin); }
        });

        var skin_Text = jQuery("<span/>", {
            text: skinText
        });

        var skinImage = jQuery("<img/>", {
            id: "skinImg",
            "class": "skin-image",
            src: pathToImages + "/skin-joint-general-bw-hellgrau-small.png",
            alt: skinText
        });

        skinLink.hover(
        function () {
            $(this).find(".skin-image").attr("src", pathToImages + "/skin-joint-general-bw-hellgrau-smallhover.png");
        },
        function () {
            $(this).find(".skin-image").attr("src", pathToImages + "/skin-joint-general-bw-hellgrau-small.png");
        });

        skinLink.append(skinImage);
        skinLink.append(skin_Text);

        _plugin.find(".avatar-container").append(skinLink);
    }

    function _createChildAvatarSmallMale() {
        var male = jQuery("<a/>", {
            id: "btnMale",
            href: "javascript:void(0)",
            "class": "child-gender-selector"
        });

        var maleIcon = jQuery("<i/>", {
            "class": "fa fa-male"
        });

        var checkIconChecked = jQuery("<i/>", {
            "class": "fa fa-check-square-o"
        });

        var checkIconUnchecked = jQuery("<i/>", {
            "class": "fa fa-square-o"
        });

        if (_selectedGender == Gender.Male)
            male.append(checkIconChecked);
        else
            male.append(checkIconUnchecked);

        male.append(maleIcon);

        male.bind('click', function () {
            $(this).addClass("disabled");
            $(this).find(".fa-square-o").addClass("fa-check-square-o");
            $(this).find(".fa-square-o").removeClass("fa-square-o");
            $("#btnFemale").find(".fa-check-square-o").addClass("fa-square-o");
            $("#btnFemale").find(".fa-check-square-o").removeClass("fa-check-square-o")
            $("#btnFemale").removeClass("disabled");
            _setSelectedGender(Gender.Male);
            _setSelectorStatus(selectorStatus.Boy);
        });

        return male;
    }

    function _createChildAvatarSmallFemale() {
        var female = jQuery("<a/>", {
            id: "btnFemale",
            href: "javascript:void(0)",
            "class": "child-gender-selector"
        });

        var femaleIcon = jQuery("<i/>", {
            "class": "fa fa-female"
        });

        var checkIconChecked = jQuery("<i/>", {
            "class": "fa fa-check-square-o"
        });

        var checkIconUnchecked = jQuery("<i/>", {
            "class": "fa fa-square-o"
        });

        if (_selectedGender == Gender.Female)
            female.append(checkIconChecked);
        else
            female.append(checkIconUnchecked);

        female.append(femaleIcon);

        female.bind('click', function () {
            $(this).addClass("disabled");
            $(this).find(".fa-square-o").addClass("fa-check-square-o");
            $(this).find(".fa-square-o").removeClass("fa-square-o");
            $("#btnMale").find(".fa-check-square-o").addClass("fa-square-o");
            $("#btnMale").find(".fa-check-square-o").removeClass("fa-check-square-o");
            $("#btnMale").removeClass("disabled");
            _setSelectedGender(Gender.Female);
            _setSelectorStatus(selectorStatus.Girl);
        });

        return female;
    }

    function _createChildGenderSelector() {
        var childGenderSelectorContainer = jQuery("<div/>", {
            "class": "child-gender-selector-container"
        });

        var childAvatarSmallMale = _createChildAvatarSmallMale();
        var childAvatarSmallFemale = _createChildAvatarSmallFemale();

        childGenderSelectorContainer.append(childAvatarSmallMale);
        childGenderSelectorContainer.append(childAvatarSmallFemale);

        _plugin.find(".status-container").append(childGenderSelectorContainer);
    }

    function _removeChildGenderSelector() {
        _plugin.find(".child-gender-selector-container").remove();
    }

    function _createSelectorHeader() {
        SetTranslationResources();
        var header = jQuery("<div/>", {
        });

        var searchField = _createSearchField();
        this._yearSelector = _createYearsField();

        var yearContainer = jQuery("<div/>", {
            "class": "year-container"
        });

        var yearIcon = jQuery("<i/>", {
            "class": "fa fa-calendar"
        });

        var yearText = jQuery("<span/>", {
            "class": "year-text",
            "text": bornOnText
        });

        yearContainer.append(yearIcon);
        yearContainer.append(yearText);
        yearContainer.append(this._yearSelector);

        header.append(searchField);
        header.append(yearContainer);

        _plugin.append(header);
    }

    function _createSearchField() {
        var searchField = jQuery("<input/>", {
            "id": "txtSearchSymptoms",
            "class": "typeahead",
            "placeholder": typeYourSymptomsText
        });
        var searchContainer = jQuery("<div/>", {
            "id": "prefetch"
        });

        searchContainer.append(searchField);
        return searchContainer;
    }

    function _createYearsField() {
        var ddlYears = jQuery("<select/>", {
            "id": "ddlYears"
        });

        var d = new Date();
        var n = parseInt(d.getFullYear());

        for (var i = n; i > (n - 100) ; i--) {
            var opt = jQuery("<option/>", {
                "text": i,
                "value": i
            });
            ddlYears.append(opt);
        }

        ddlYears.bind('change', function () {
            _handleSelectedYearChanged($(this).val());
        });

        ddlYears.val(_selectedYear);

        return ddlYears;
    }

    function _handleSelectedYearChanged(selectedYear) {
        _setSelectedYear(selectedYear);

        if (parseInt(selectedYear) < _edgeYears) {
            if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
                if (_selectedGender == Gender.Male)
                    _setSelectorStatus(selectorStatus.Man);
                else
                    _setSelectorStatus(selectorStatus.Woman);
            }
            else {
                _makeDiagnosis();
            }
        }
        else {
            if (_selectedSelectorStatus == selectorStatus.Man || _selectedSelectorStatus == selectorStatus.Woman) {
                if (_selectedGender == Gender.Male)
                    _setSelectorStatus(selectorStatus.Boy);
                else
                    _setSelectorStatus(selectorStatus.Girl);
            }
            else {
                _setSelectorStatus(_selectedSelectorStatus);
            }
        }
    }

    function _highlightBodyParts() {
        var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
        currentAvatar.mapster({
            fillColor: 'acacac',
            fillOpacity: 0.3,
            //isSelectable: true,
            clickNavigate: true,
            scaleMap: true,
            //singleSelect: true,
            mapKey: 'accesskey' //  (see http://www.outsharked.com/imagemapster/default.aspx?docs.html)
            //stroke: true,
            //strokeColor: "585858",
            //strokeOpacity: 0.8,
            //strokeWidth: 1
        });
        _selectBodyPart(_selectedBodyPart);
        _resizeSelector(currentAvatar);
    }

    function _resizeSelector(avatar) {
        var avatarHeight = _plugin.find(".avatar-container").height();
        if (_selectedSelectorStatus == selectorStatus.Boy || _selectedSelectorStatus == selectorStatus.Girl) {
            avatarHeight = avatarHeight * 0.7;
        }
        avatar.mapster('resize', 0, avatarHeight, 100);
    }

    function _selectBodyPart(location) {
        if (location === "")
            return;

        var currentAvatar = _getAvatarByStatus(_selectedSelectorStatus);
        _setSelectedBodyPart(location);

        // use try/catch to hide image mapster child resizing problem
        try {
            $('area').mapster('deselect');
        }
        catch (e) { }

        switch (location) {
            case SymptomsLocations.Head:
                currentAvatar.mapster('set', true, "0");
                break;
            case SymptomsLocations.Chest:
                currentAvatar.mapster('set', true, "1");
                break;
            case SymptomsLocations.Arms:
                currentAvatar.mapster('set', true, "4");
                break;
            case SymptomsLocations.Legs:
                currentAvatar.mapster('set', true, "3");
                break;
            case SymptomsLocations.Hips:
                currentAvatar.mapster('set', true, "2");
                break;
            case SymptomsLocations.Skin:
                currentAvatar.mapster('set', true, "0,1,2,3,4");
                break;
        }

        if (redirectUrl !== "") {
            setTimeout(function () { window.location = redirectUrl; }, 500);
            return;
        }

        if (location !== "")
            _fillBodySublocationList(location);
    }

    function _fillBodySublocationList(location) {
        var options = new Object();
        options.LocationId = location;
        options.SelectorStatus = _selectedSelectorStatus;
        options.Gender = _selectedGender;
        options.YearOfBirth = _selectedYear;
        _symptomList.symptomList("LoadBodySublocations", options);
    }
    function _showMainAvatar(selectedStatus) {
        var avatar = _getAvatarByStatus(selectedStatus);
        avatar.show();
        _highlightBodyParts();
    }

    function _hideMainAvatar(selectedStatus) {
        var avatar = _getAvatarByStatus(selectedStatus);
        avatar.mapster('unbind');
        avatar.hide();
    }

    function _getSmallAvatarByStatus(selectedStatus) {
        switch (selectedStatus) {
            case selectorStatus.Man:
                return this._manAvatarSmall;
            case selectorStatus.Woman:
                return this._womanAvatarSmall;
            case selectorStatus.Boy:
                return this._childAvatarSmall;
            case selectorStatus.Girl:
                return this._childAvatarSmall;
        }
    }

    function _getAvatarByStatus(selectedStatus) {
        switch (selectedStatus) {
            case selectorStatus.Man:
                return this._manAvatar;
            case selectorStatus.Woman:
                return this._womanAvatar;
            case selectorStatus.Boy:
                return this._childAvatar;
            case selectorStatus.Girl:
                return this._childAvatar;
        }
    }

    function _setSelectedBodyPart(selectedBodyPart) {
        _selectedBodyPart = selectedBodyPart;
        setCookie("selectedBodyPart", selectedBodyPart, 1);
    }

    function _setSelectorStatus(selectedStatus) {
        setCookie("selectedSelectorStatus", selectedStatus, 1);
        _hideMainAvatar(_selectedSelectorStatus);
        _clearSelectedStatusMark(_selectedSelectorStatus);
        _selectedSelectorStatus = selectedStatus;
        _showMainAvatar(_selectedSelectorStatus);
        _markSelectedStatus(selectedStatus);

        switch (selectedStatus) {
            case (selectorStatus.Man):
                _setSelectedGender(Gender.Male);
                _removeChildGenderSelector();
                if (_edgeYears <= parseInt(this._yearSelector.val()))
                    _setSelectedYear(_defaultAdultYear);
                break;
            case (selectorStatus.Woman):
                _setSelectedGender(Gender.Female);
                _removeChildGenderSelector();
                if (_edgeYears <= parseInt(this._yearSelector.val()))
                    _setSelectedYear(_defaultAdultYear);
                break;
            case (selectorStatus.Boy):
                _removeChildGenderSelector();
                _createChildGenderSelector();
                if (_edgeYears > parseInt(this._yearSelector.val()))
                    _setSelectedYear(_defaultChildYear);
                break;
            case (selectorStatus.Girl):
                _removeChildGenderSelector();
                _createChildGenderSelector();
                if (_edgeYears > parseInt(this._yearSelector.val()))
                    _setSelectedYear(_defaultChildYear);
                break;
        }
        _ajaxGetSymptoms(false);
        _makeDiagnosis();
    }

    function _setSelectedGender(selectedGender) {
        setCookie("selectedGender", selectedGender, 1);
        _selectedGender = selectedGender;
    }

    function _setSelectedYear(selectedYear) {
        setCookie("selectedYear", selectedYear, 1);
        this._yearSelector.val(selectedYear);
        _selectedYear = selectedYear;
    }

    function _markSelectedStatus(selectedStatus) {
        var selectedSmallAvatar = _getSmallAvatarByStatus(selectedStatus);
        selectedSmallAvatar.css("border", "2px solid #" + _statusLinkBorderColor);
    }

    function _clearSelectedStatusMark(selectedStatus) {
        var selectedSmallAvatar = _getSmallAvatarByStatus(selectedStatus);
        selectedSmallAvatar.css("border", "none");
    }

    function _makeDiagnosis() {
        if (mode == "booking")
            return;

        if (isDisclaimerChecked()) {
            var options = new Object();

            options.Symptoms = _symptomList.symptomList("GetSelectedSymptoms");
            options.Gender = _selectedGender;
            options.YearOfBirth = _selectedYear;
            if (mode == "diagnosis")
                $("#" + _diagnosisListId).diagnosis("GetDiagnosis", options);

            if (mode == "specialisations")
                $("#" + _diagnosisListId).specialisations("GetSpecialisations", options);

            _symptomList.symptomList("LoadProposedSymptoms", options);
        }

    }

    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substrRegex.test(str.Name)) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({ value: str.Name });
                }
            });

            cb(matches);
        };
    };

    var fillResults = function (symptoms, initTypeAhead) {
        var _symptoms = new Array();
        $.each(symptoms, function () {
            if (this.Name !== "" && this.Name !== " ")
                _symptoms.push(this);
        });

        var options = new Object();
        options.LocationId = location;
        options.SelectorStatus = _selectedSelectorStatus;
        options.Gender = _selectedGender;
        options.YearOfBirth = _selectedYear;
        options.ValidSymptoms = _symptoms;

        _symptomList.symptomList("SetValidSymptoms", options);

        if (initTypeAhead)
            _initTypeAhead();
        else {
            $("#prefetch .typeahead").typeahead("destroy");
            _initTypeAhead();
        }

    };

    function _initTypeAhead() {
        $('#prefetch .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 2
        },
        {
            name: '_symptoms',
            displayKey: 'value',

            source: substringMatcher(_symptomList.symptomList("GetValidSymptoms"))
        }
        ).bind("typeahead:selected", function (obj, datum, name) {
            var result = $.grep(_symptomList.symptomList("GetValidSymptoms"), function (e) { return e.Name == datum.value; });
            var options = new Object();
            options.ID = result[0].ID;
            options.Name = result[0].Name;
            _symptomList.symptomList("SelectSymptom", options);
        });
    }


    function _setResourcesCallback(resources) {

        if (resources.length > 0) {
            var skinText = resources[0].Key;//("btnContactForm");
        }
    }

    function _setSpecificResourcesCallback(resources) {

        if (resources.length > 0) {

            $.each(resources, function () {
                resObj[this.Key] = this.Value;

            });
            SetTranslationResources();
            _setUpSelector();
            $("#selectSymptomsTitle").text(selectSymptomsText);
            $("#selectedSymptomsTitle").text(selectedSymptomsText);
            $("#possibleDiseasesTitle").text(possibleDiseasesText);
        }
    }

    function SetTranslationResources() {

        if (resObj != null) {
            disclaimerText = resObj.litTermsOfUsePolicyPrivacy;
            litTermsOfUse = resObj.litTermsOfUse;
            litPrivacyPolicy = resObj.litPrivacyPolicy;
            disclaimerNotAcceptedText = resObj.litDisclaimerNotChecked;
            noSelectedSymptomsText = resObj["litAddAdditionalComplaints"];
            diagnosisMessage = resObj["litEmergencyInfo"];
            noDiagnosisMessage = resObj["litEmptyDiagnosisDataTemplate"];
            proposedSymptomsText = resObj["litSuggestedSymptoms"];
            symptomListMessage = resObj["litCarouselItem4"];
            skinText = resObj["genAvatarText"];
            bornOnText = resObj.litYears;
            typeYourSymptomsText = resObj.litSearchSymptoms;
            selectSymptomsText = resObj.genSelectSymptoms;
            selectedSymptomsText = resObj.genSelectedSymptoms;
            possibleDiseasesText = resObj.genPossibleDiseases;

            makeDiagnosisText = resObj.btnGenerateDiagnose;
            litProfName = resObj.txtProfessionalName;
            litShortDescription = resObj.genShortDescription;
            litDescription = resObj.genDescription;
            litOccurrence = resObj.genOccurrence;
            litSymptom = resObj.genSymptom;
            litFollow = resObj.genFollow1;
            litTreatment = resObj.genTreatment;
            litPossibleSymptoms = resObj.litPossibleSymptoms;
        }
    }

    //////////////////end private functions//////////////////////////////////////////

})(jQuery);

/////////////Symptom selector plugin end//////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/////////////Symptom list plugin start/////////////////////////
//////////////////////////////////////////////////////////////////////
(function ($) {

    var _plugin;
    var _symptomList;
    var _locationName;
    var _selectorStatus;
    var _locations = new Object();
    var _validSymptoms = new Array();

    var _selectedList;
    var _selectedListId = "selectedSymptomList";
    var _diagnosisListId = "diagnosisList";
    var _proposedList;
    var _proposedListHeader;
    var _symptomListMessage;
    var _loader;
    var _header;
    var _emptySelectedSymptomMessage;
    var _redFlagMessage;

    var _avatarOptions;

    var methods = {

        init: function (options) {
            return this.each(function () {
                _plugin = $(this);
                _initSymptomList();
                _avatarOptions = options;

                if (redirectUrl === "") {
                    if (mode == "diagnosis")
                        $("#" + _diagnosisListId).diagnosis();

                    if (mode == "specialisations")
                        $("#" + _diagnosisListId).specialisations();

                    var symptoms = _getSelectedSymptoms();
                    if (symptoms.length !== 0) {
                        _showTerms();
                        _makeDiagnosis();
                    }
                }
            });
        },
        LoadBodyLocations: function (options) {
            _ajaxLoadBodyLocations(options.LocationId);
        },
        LoadBodySublocations: function (options) {
            _avatarOptions = options;
            _loadBodySublocation(options.LocationId, options.SelectorStatus);
            _header.text(_locations[options.LocationId]);
        },
        GetSelectedSymptoms: function (options) {
            return _getSelectedSymptoms();
        },
        SelectSymptom: function (options) {
            _selectSymptom(options);
        },
        SetValidSymptoms: function (options) {
            _validSymptoms = options.ValidSymptoms;
            _avatarOptions.LocationId = options.LocationId;
            _avatarOptions.SelectorStatus = options.SelectorStatus;
            _avatarOptions.Gender = options.Gender;
            _avatarOptions.YearOfBirth = options.YearOfBirth;

            var synonyms = new Array();
            $.each(_validSymptoms, function () {
                if (this.Synonyms != null && typeof (this.Synonyms) !== "undefined" && this.Synonyms.length > 0) {
                    var currentId = this.ID;
                    var name = this.Name;
                    var hasRedFlag = this.HasRedFlag;
                    $.each(this.Synonyms, function () {
                        var syn = new Object();
                        syn.ID = currentId;
                        syn.Name = this + "(" + name + ")";
                        syn.HasRedFlag = hasRedFlag;
                        syn.IsSynonym = true;
                        syn.HealthSymptomLocationIDs = new Array();
                        synonyms.push(syn);
                    });
                }
            });

            $.each(synonyms, function () {
                _validSymptoms.push(this);
            });
            var symptoms = _getSelectedSymptoms();
            if (symptoms.length !== 0) {
                _addSelectedSymptoms(symptoms);
            }
        },
        GetValidSymptoms: function (options) {
            return _validSymptoms;
        },
        LoadProposedSymptoms: function (options) {
            _clearProposedSymptom();
            _ajaxLoadProposedSymptoms(options.Symptoms, options.Gender, options.YearOfBirth);
        },
        Unbind: function (options) {
            _selectedList.unbind('click');
            _selectedList.empty();
            _plugin.unbind('click');
            _plugin.empty();
        }
    };

    $.fn.symptomList = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.symptomList');
        }

    };

    //////////////////ajax calls/////////////////////////////////////////////////////
    function _ajaxLoadBodyLocations(selectedLocationId) {
        $.ajax({
            url: pathToWebservice + "/body/locations",
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addLocationsCallback",
            success: function (responseData) { _addLocationsCallback(responseData, selectedLocationId); },
            beforeSend: function (jqXHR, settings) {
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
            }
        });
    }

    function _ajaxLoadBodySublocations(locationId) {
        $.ajax({
            url: pathToWebservice + "/body/locations/" + locationId,
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addSublocationsCallback",
            success: function (responseData) { _addSublocationsCallback(responseData, locationId); },
            beforeSend: function (jqXHR, settings) {
                _loader.show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                _loader.hide();
            }
        });
    }

    function _ajaxLoadProposedSymptoms(symptoms, gender, year_of_birth) {
        $.ajax({
            url: pathToWebservice + "/symptoms/proposed",
            type: "GET",
            async: true,
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    symptoms: JSON.stringify(symptoms),
                    gender: gender,
                    year_of_birth: year_of_birth,
                    platform: currentPlatform
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addProposedSymptomsCallback",
            success: function (responseData) { _addProposedSymptomsCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
                $('#loader').show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                $('#loader').hide();
            }
        });
    }

    function _ajaxGetRedFlagText(symptomId) {
        $.ajax({
            url: pathToWebservice + "/redflag",
            type: "GET",
            async: true,
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    symptomId: symptomId
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_getRedFlagCallback",
            success: function (responseData) { _getRedFlagCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
                $('#loader').show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                $('#loader').hide();
            }
        });
    }

    //////////////////end ajax calls/////////////////////////////////////////////////////

    //////////////////private functions//////////////////////////////////////////////

    function _initSymptomList() {
        _symptomList = jQuery("<ul/>", { "class": "location_list" });

        _proposedList = jQuery("<ul/>", { "class": "proposed_list" });
        _proposedListHeader = jQuery("<h4/>", { "text": proposedSymptomsText, "class": "header proposed_list_header" });
        _proposedListHeader.hide();

        _header = jQuery("<h4/>", { "class": "header symptom_list_header" });
        _header.hide();

        _symptomListMessage = jQuery("<span/>", { "class": "message info", "text": symptomListMessage });

        _loader = jQuery("<div/>", { "class": "loader" });
        _loader.hide();

        _plugin.append(_header);
        _plugin.append(_symptomListMessage);
        _plugin.append(_loader);

        _selectedList = $("#" + _selectedListId);
        _selectedList.parent().addClass("box-inactive");

        _selectedList.append(jQuery("<ul/>", { "class": "selected_list" }));
        _selectedList.append(_createNoSymptomsSelectedMessage());
        _selectedList.append(_createTermsElement());
        _selectedList.append(_createTermsNotAcceptedMessage());
        _selectedList.append(_proposedListHeader);
        _selectedList.append(_proposedList);

        _plugin.append(_symptomList);

        _createRedFlagMessage();
    }

    function _createRedFlagMessage() {
        _redFlagMessage = jQuery("<div/>", { "id": "redFlagMessage", "class": "info_page" });
        var redFlagMessageContainer = jQuery("<div/>", { "class": "container" });
        var message = jQuery("<span/>");
        _redFlagMessage.append(redFlagMessageContainer);

        _redFlagMessage.hide();


        $("body").append(_redFlagMessage);

        var content = jQuery("<div/>", { "id": "redFlagContent", "class": "warning" });
        content.append(message);
        redFlagMessageContainer.append(content);

        var btnClose = jQuery("<i/>", { "id": "btnCloseRedFlag", "class": "fa fa-times" });
        btnClose.bind('click', function () {
            _redFlagMessage.find("#redFlagContent span").empty();
            _redFlagMessage.hide();
        });

        content.append(btnClose);
    }

    //load body sublocations
    function _loadBodySublocation(locationId, selectorStatus) {
        _header.show();

        if (_selectorStatus != "" && _selectorStatus != selectorStatus)
            _hideSymptoms(_selectorStatus);

        _selectorStatus = selectorStatus;

        _symptomList.find(".sublocation").hide();

        if (!_isLoadedSublocations(locationId)) {
            _symptomListMessage.hide();
            _ajaxLoadBodySublocations(locationId);
        }
        else
            _symptomList.find(".location_" + locationId).show();
    }

    //create body sublocations list elements
    function _addBodySublocation(sublocation, locationId) {
        if (_isValidSublocation(sublocation.ID) == false)
            return;

        var sublocationListElement = jQuery("<li/>", {
            "id": "sublocation_" + sublocation.ID,
            "class": "sublocation location_" + locationId,
            "text": sublocation.Name
        });

        //var sublocationListElementText = jQuery("<p/>", {
        //    "text": sublocation.Name
        //});

        sublocationListElement.bind('click', function () {
            if (_isLoadedSymptoms(sublocation.ID))
                _symptomList.find("#symptoms_" + _selectorStatus + "_" + sublocation.ID).toggle();
            else {
                var symptoms = _getSublocationSymptoms(sublocation.ID)
                _fillSublocations(symptoms, sublocation.ID);
            }

            $(this).toggleClass("open");
        });

        //sublocationListElement.append(sublocationListElementText);
        _symptomList.append(sublocationListElement);
    }

    //create body sublocations symptoms list elements
    function _addBodySublocationSymptoms(symptom, sublocation, selectedSymptoms) {

        var sublocationSymptomListElement = jQuery("<li/>", {
            "class": "symptom-item symptom_" + symptom.ID,
            "text": symptom.Name,
            "symptom_id": symptom.ID
        });

        var isSelected = $.grep(selectedSymptoms, function (e) { return parseInt(e) == parseInt(symptom.ID); });

        if (isSelected.length != 0)
            sublocationSymptomListElement.hide();

        sublocationSymptomListElement.bind('click', function () {
            _selectSymptom(symptom);
        });

        sublocation.append(sublocationSymptomListElement);
    }

    function _addLocationsCallback(locations, selectedLocationId) {
        $.each(locations, function () {
            _locations[this.ID] = this.Name;
        });

        if (selectedLocationId !== null && selectedLocationId !== "")
            _header.text(_locations[selectedLocationId]);
    }

    function _addSublocationsCallback(sublocations, locationId) {
        $.each(sublocations, function () {
            _addBodySublocation(this, locationId);
        });
    }

    function _fillSublocations(symptoms, sublocationId) {
        var symptomListElement = jQuery("<ul/>", {
            "id": "symptoms_" + _selectorStatus + "_" + sublocationId,
            "class": "symptom_list symptoms_" + _selectorStatus
        });

        _symptomList.find("#sublocation_" + sublocationId).append(symptomListElement);

        var selectedSymptoms = _getSelectedSymptoms();
        $.each(symptoms, function () {
            _addBodySublocationSymptoms(this, symptomListElement, selectedSymptoms);
        });
    }

    function _getSublocationSymptoms(sublocationId) {
        var symptoms = $.grep(_validSymptoms, function (e) {
            var valid = false;
            $.each(e.HealthSymptomLocationIDs, function () {

                if (parseInt(this) == sublocationId)
                    valid = true;
            });
            return valid;
        });

        symptoms.sort(_sortByName);

        return symptoms;
    }

    function _getRedFlagCallback(redFlagText) {
        if (redFlagText !== null && redFlagText !== "") {
            _redFlagMessage.show();
            _redFlagMessage.find("#redFlagContent span").html(redFlagText);
        }
    }

    function _addSelectedSymptoms(symptoms) {
        $.each(symptoms, function () {
            var symptomId = this;

            var symptom = $.grep(_validSymptoms, function (e) { return parseInt(e.ID) == parseInt(symptomId); });
            _createSelectedSymptomElement(symptom[0]);
        });
    }

    function _isLoadedSymptoms(sublocationId) {
        return _symptomList.find("#symptoms_" + _selectorStatus + "_" + sublocationId).length > 0;
    }

    function _isLoadedSublocations(locationId) {
        return _symptomList.find(".location_" + locationId).length > 0;
    }

    function _selectSymptom(symptom) {
        var symptoms = _getSelectedSymptoms();
        if (inArray(symptom.ID, symptoms) >= 0)// already exist
            return;

        var selected = getCookie("selectedSymptoms");

        if (selected != "")
            selected += "," + symptom.ID;
        else
            selected = symptom.ID;

        setCookie("selectedSymptoms", selected, 1);

        if (redirectUrl !== "") {
            setTimeout(function () { window.location = redirectUrl; }, 500);
            return;
        }

        _createSelectedSymptomElement(symptom);
        _symptomList.find(".symptom_" + symptom.ID).hide();

        _showTerms();
        _ajaxGetRedFlagText(symptom.ID);
        _makeDiagnosis();
        _plugin.parent().removeClass("box-inactive");
    }

    function _hideSymptoms(selectorStatus) {
        _symptomList.find(".symptoms_" + _selectorStatus).hide();
        _symptomList.find(".symptoms_" + _selectorStatus).parent().removeClass("open");
    }

    function _isValidSublocation(sublocationId) {
        var valid = false;
        $.each(_validSymptoms, function () {
            $.each(this.HealthSymptomLocationIDs, function () {
                if (parseInt(this) == parseInt(sublocationId))
                    valid = true;
            });
        });

        return valid;
    }

    function _sortByName(a, b) {
        var aName = a.Name.toLowerCase();
        var bName = b.Name.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    ////////////////////selected list////////////////////////////////////////////////

    function _createSelectedSymptomElement(symptom) {
        if (_selectedList.find("#selected_" + symptom.ID).length > 0)
            return;

        var symptomElement = jQuery("<li/>", {
            "text": symptom.Name,
            "id": "selected_" + symptom.ID,
            "class": "selected_symptom",
            "symId": symptom.ID
        });

        var btnRemove = jQuery("<i/>", {
            "class": "fa fa-times"
        });

        btnRemove.bind('click', function () {
            _removeSymptom(symptom.ID);
            $(this).parent().remove();
        });

        symptomElement.append(btnRemove);

        _selectedList.find("ul.selected_list").append(symptomElement);
    }

    function _getSelectedSymptoms() {
        var symptoms = new Array();
        var selected = getCookie("selectedSymptoms");
        if (selected !== "")
            symptoms = selected.split(",");

        return symptoms;
    }

    function _addGenerateDiagnosisButton() {
        var btnGenerateDiagnosis = jQuery("<input/>", {
            "value": makeDiagnosisText,
            "id": "btnGenerateDiagnosis",
            "type": "button"
        });

        btnGenerateDiagnosis.bind('click', function () {
            if (!isDisclaimerChecked()) {
                _selectedList.find("#termsNotAcceptedMessage").show();
                return;
            }
            _makeDiagnosis();
        });

        return btnGenerateDiagnosis;
    }

    function _makeDiagnosis() {
        _avatarOptions.Symptoms = _getSelectedSymptoms();

        if (isDisclaimerChecked()) {
            if (mode == "diagnosis")
                $("#" + _diagnosisListId).diagnosis("GetDiagnosis", _avatarOptions);

            if (mode == "specialisations")
                $("#" + _diagnosisListId).specialisations("GetSpecialisations", _avatarOptions);
        }

        if (_avatarOptions.Symptoms.length > 0) {
            _clearProposedSymptom();
            _ajaxLoadProposedSymptoms(_avatarOptions.Symptoms, _avatarOptions.Gender, _avatarOptions.YearOfBirth);
        }
    }

    function _removeSymptom(symptomId) {
        var selected = _getSelectedSymptoms();

        selected = jQuery.grep(selected, function (el) {
            return (parseInt(el) !== symptomId);
        });
        setCookie("selectedSymptoms", selected, 1);

        if (selected.length == 0)
            _hideTerms();

        _symptomList.find(".symptom_" + symptomId).show();

        _makeDiagnosis();
    }

    function _createNoSymptomsSelectedMessage() {
        var p = jQuery("<span/>", {
            "id": "noSymptomsSelectedMessage",
            "class": "message info",
            "text": noSelectedSymptomsText
        });

        return p;
    }

    function _createTermsElement() {
        if (mode == "booking") {
            var p = jQuery("<p/>");
            return p;
        }

        var p = jQuery("<span/>", {
            id: "terms",
            "class": "message info"
        });
        var checked = isDisclaimerChecked();
        var chkBoxTerms = jQuery("<input/>", {
            "type": "checkbox",
            "checked": checked,
            "class": "terms-checkbox"
        });

        chkBoxTerms.bind('click', function () {
            if (this.checked) {
                setCookie("diagnosisDisclaimer", "true", 0.1);
                _selectedList.find("#termsNotAcceptedMessage").hide();
            }
            else {
                setCookie("diagnosisDisclaimer", "false", -1);
            }
            isDisclaimerChecked();
        });

        // set privacy and terms links
        //disclaimerText = disclaimerText.replace(litTermsOfUse, "<a href='" + termsUrl + "' download='" + termsUrl + "' class='terms' target='_blank'>" + litTermsOfUse + "</a>").replace(litPrivacyPolicy, "<a href='" + privacyUrl + "' download='" + privacyUrl + "' class='terms' target='_blank'>" + litPrivacyPolicy + "</a>");
        var litTermsOfUseInText = '#' + litTermsOfUse.replace(/ /g, '').toLowerCase() + '#';
        var litPrivacyPolicyInText = '#' + litPrivacyPolicy.replace(/ /g, '').toLowerCase() + '#';
        disclaimerText = disclaimerText.replace(litTermsOfUseInText, "<a href='" + termsUrl + "' class='terms' target='_blank' >" + litTermsOfUse + "</a>").replace(litPrivacyPolicyInText, "<a href='" + privacyUrl + "' class='terms' target='_blank' >" + litPrivacyPolicy + "</a>");

        var termsText = jQuery("<label/>", {
        });

        termsText.html(disclaimerText);

        var diagnosisButton = _addGenerateDiagnosisButton();

        p.append(chkBoxTerms);
        p.append(termsText);
        p.append("<br/>");
        p.append(diagnosisButton);
        p.hide();

        return p;
    }

    function _createTermsNotAcceptedMessage() {
        var p = jQuery("<span/>", {
            "id": "termsNotAcceptedMessage",
            "class": "message warning",
            "text": disclaimerNotAcceptedText
        });

        p.hide();
        return p;
    }

    function _showTerms() {
        _selectedList.find("#noSymptomsSelectedMessage").hide();
        _selectedList.find("#terms").show();
        _selectedList.parent().removeClass("box-inactive");
    }

    function _hideTerms() {
        _selectedList.find("#terms").hide();
        _selectedList.find("#noSymptomsSelectedMessage").show();
        _selectedList.parent().addClass("box-inactive");
    }

    //////////////////proposed symptoms list/////////////////////////////////////////

    function _addProposedSymptomsCallback(symptoms) {
        if (symptoms.length > 0)
            _proposedListHeader.show();
        else
            _proposedListHeader.hide();

        $.each(symptoms, function () {
            _addProposedSymptom(this);
        });
    }

    function _addProposedSymptom(symptom) {
        var proposedSymptomListElement = jQuery("<li/>", {
            "text": symptom.Name,
            "symptom_id": symptom.ID
        });

        proposedSymptomListElement.bind('click', function () {
            _selectSymptom(symptom);
        });

        _proposedList.append(proposedSymptomListElement);
    }

    function _clearProposedSymptom() {
        _proposedList.find("li").remove();
    }

    //////////////////end private functions//////////////////////////////////////////

})(jQuery);

/////////////symptom list plugin end/////////////////////////
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
/////////////diagosis result plugin start///////////////////////

(function ($) {

    var _plugin;
    var _diagnosisList;
    var _diagnosisMessage;
    var _loader;
    var _infoPage;

    var methods = {

        init: function (options) {

            return this.each(function () {
                _plugin = $(this);
                _plugin.parent().addClass("box-inactive");
                _initDiagnosisList();
            });
        },
        GetDiagnosis: function (options) {
            _clearDiagnosis();
            _ajaxGetDiagnosis(options.Symptoms, options.Gender, options.YearOfBirth);
        },
        Unbind: function (options) {
            _plugin.unbind('click');
            _plugin.empty();
        }
    };

    $.fn.diagnosis = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.diagnosis');
        }

    };

    //////////////////private functions//////////////////////////////////////////
    function _initDiagnosisList() {
        _diagnosisList = jQuery("<ul/>", { "class": "diagnosis_list" });

        _diagnosisMessage = jQuery("<span/>", { "class": "message info", "text": diagnosisMessage });
        _diagnosisMessage.hide();
        _loader = jQuery("<div/>", { "id": "diagnosisLoader", "class": "loader" });
        _loader.hide();
        _plugin.append(_loader);
        _plugin.append(_diagnosisList);
        _plugin.append(_diagnosisMessage);

        _createIssueInfoPage();
    }

    function _createIssueInfoPage() {
        _infoPage = jQuery("<div/>", { "class": "info_page" });
        $("body").append(_infoPage);

        var content = jQuery("<div/>", { "class": "info_page_content" });
        _infoPage.append(content);

        infoPageLoader = jQuery("<div/>", { "id": "infoPageLoader", "class": "loader" });
        _infoPage.append(infoPageLoader);

        var btnClose = jQuery("<i/>", { "id": "btnCloseInfo", "class": "fa fa-times btn_info" });
        btnClose.bind('click', function () {
            _infoPage.find(".info_page_content").empty();
            _infoPage.hide();
        });
        var btnPrint = jQuery("<i/>", { "id": "btnPrintInfo", "class": "fa fa-print btn_info" });
        btnPrint.bind('click', function () {
            _print(content);
        });

        _infoPage.append(btnClose);
        _infoPage.append(btnPrint);
    }

    function _createDiagnosisElement(diagnosis) {
        _diagnosisList.append(_createDiagnosisNameElement(diagnosis.Issue.ID, diagnosis.Issue.Name));
        _diagnosisList.append(_createProbabilityElement(diagnosis.Issue.Accuracy));
        _diagnosisList.append(_createSpecialisationElement(diagnosis.Specialisation));
    }

    function _addDiagnosisCallback(diagnosis) {
        _diagnosisMessage.hide();
        $.each(diagnosis, function () {
            _createDiagnosisElement(this);
        });
        if (diagnosis.length > 0) {
            _plugin.parent().removeClass("box-inactive");
            _setDiagnosisMessage(diagnosisMessage);
        }
        else {
            _plugin.parent().addClass("box-inactive");
            _setDiagnosisMessage(noDiagnosisMessage);
        }
    }

    function _addIssueInfoCallback(issueInfo) {
        var htmlContent = "<div>";
        htmlContent += "<h1 class='margin-none' itemprop=\"name\">" + issueInfo.Name + "</h1>";

        var countSynonyms = 0;
        if (issueInfo.Synonyms != null && issueInfo.Synonyms !== "") {
            htmlContent += "<h4>(" + issueInfo.Synonyms + ")</h4>";
        }

        if (issueInfo.ProfName != null && issueInfo.ProfName !== "") {
            htmlContent += "<h3 class='border-bottom'><small>" + litProfName + "  (<b itemprop=\"alternateName\">" + issueInfo.ProfName + "</b>)</small></h3>";
        }

        if (issueInfo.DescriptionShort != null && issueInfo.DescriptionShort != "") {
            htmlContent += "<h3>" + litShortDescription + "</h3><p class='healthIssueInfo'>" + issueInfo.DescriptionShort + "</p>";
        }

        if (issueInfo.Description != null && issueInfo.Description != "") {
            htmlContent += "<h3>" + litDescription + "</h3><p class='healthIssueInfo'>" + issueInfo.Description + "</p>";
        }

        if (issueInfo.MedicalCondition != null && issueInfo.MedicalCondition != "" && typeof (issueInfo.MedicalCondition) != 'undefined' && issueInfo.MedicalCondition != null) {
            htmlContent += "<h3>" + litOccurrence + " + " + litSymptom + "</h3><p class='healthIssueInfo'>" + issueInfo.MedicalCondition + "</p>";
        }

        if (issueInfo.TreatmentDescription != null && issueInfo.TreatmentDescription != "") {
            htmlContent += "<h3>" + litFollow + " + " + litTreatment + "</h3><p class='healthIssueInfo'>" + issueInfo.TreatmentDescription + "</p>";
        }

        if (issueInfo.PossibleSymptoms != "" && issueInfo.PossibleSymptoms != null) {
            htmlContent += "<h3>" + litPossibleSymptoms + "</h3><p class='healthIssueInfo'>" + issueInfo.PossibleSymptoms + "</p>";
        }

        //TODO: references should be shown properly - this string is comming from Wikipedia !!!! string ret = client.DownloadString(url);
        htmlContent = htmlContent.replace("Cite error: There are <ref> tags on this page, but the references will not show without a {{reflist}} template (see the help page).", "");

        var windowHeight = $(".container-table").height();
        _infoPage.css('min-height', windowHeight + 'px');

        _infoPage.find(".info_page_content").append(htmlContent);
        $("html, body").animate({ scrollTop: 0 }, "fast");
        $('html, body', window.parent.document).animate({ scrollTop: 100 }, 'fast');
    }

    function _createDiagnosisNameElement(issueId, diagnosisName) {
        var diagnosisListElement = jQuery("<li/>", {
        });

        var diagnosisNameElement = jQuery("<h4/>", {
            "text": diagnosisName,
            "class": "header diagnosis_name_header"
        });

        var issueInfo = jQuery("<i/>", {
            "class": "fa fa-info-circle ic-issue-info"
        });

        issueInfo.bind('click', function () {
            _ajaxGetIssueInfo(issueId);
        });

        diagnosisNameElement.append(issueInfo);

        diagnosisListElement.append(diagnosisNameElement);

        return diagnosisListElement;
    }

    function _createProbabilityElement(accuracy) {
        diagnosisListElement = jQuery("<li/>", {
        });

        var progress = jQuery("<div/>", {
            "class": "progress"
        });

        var bar = jQuery("<div/>", {
            "class": "progress-bar progress-bar-primary animate"
        });
        console.log(accuracy);
        var currentProgress = 0;
        bar.width(currentProgress + '%');
        var interval = setInterval(function () {
            if (currentProgress >= accuracy) {
                clearInterval(interval);
            } else {
                currentProgress++;
                bar.width(currentProgress + '%');
            }
        }, 20);
        progress.append(bar);
        diagnosisListElement.append(progress);
        return diagnosisListElement;
    }

    function _createSpecialisationElement(specialisation) {
        var specList = jQuery("<ul/>", { "class": "spec_list" });

        if (!includeAllSpec) {
            $.each(specialisation, function () {
                specListElement = jQuery("<li/>", {
                });
                var spec = jQuery("<a/>", {
                    "text": this.Name,
                    //TODO possible implementations:
                    //"href": specUrl + "/" + this.Name + "/" + this.ID
                    //"href": specUrl + "?specId=" + this.SpecialistID
					"href": specUrl  + "/" + "specId" + this.SpecialistID + ".html"
                });

                specListElement.append(spec);
                specList.append(specListElement);
            });
        }
        else {
            var specNames = new Array();
            $.each(specialisation, function () {
                specNames.push(this.Name);
            });
            $.each(specialisation, function () {
                specListElement = jQuery("<li/>", {
                });
                var spec = jQuery("<a/>", {
                    "text": this.Name,
                    "href": specUrl + "?specs=" + JSON.stringify(specNames)
                });

                specListElement.append(spec);
                specList.append(specListElement);
            });
        }


        var element = jQuery("<li/>", {
        });

        element.append(specList);
        return element;
    }

    function _clearDiagnosis() {
        _plugin.find("ul").empty();
    }

    function _setDiagnosisMessage(message) {
        _diagnosisMessage.text(message);
        _diagnosisMessage.show();
    }

    function _print(printSource) {
        var name = printSource.find("h1").text();
        var printFooter = "<div style=\"float:right;\"><img src=\"symptom_selector/images/logo.jpg\" alt=\"priaid\" class=\"logo\"><span><a href=\"http://www.priaid.com\" target=\"_blank\" class=\"priaid-powered\"> powered by  </a> </span></div>"
        printFooter += "<div style=\"float:right;padding-right:16px;clear:both;\"><span><a href=\"http://www.priaid.com\" target=\"_blank\"  class=\"priaid-powered padding0\">(www.priaid.com)</a> </span> </div></div>"
        var printContent = printSource.clone();

        printContent = printContent.html();

        var popupWin = window.open('', '_blank', 'width=800,height=600');
        popupWin.document.open();
        popupWin.document.write("<html><head><link rel=\"stylesheet\" type=\"text/css\" href=\"symptom_selector/print.css\"><title=\"priaid -" + name + "></title></head><body onload=\"window.print()\"><div id=\"#container\">" + printContent + printFooter + "</div></html>");
        //popupWin.document.write(html.join(""));
        popupWin.document.title = "priaid - " + name;
        popupWin.document.close();
    }

    //////////////////ajax calls//////////////////////////////////////////

    function _ajaxGetDiagnosis(symptoms, gender, year_of_birth) {
        $.ajax({
            url: pathToWebservice + "/diagnosis",
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    symptoms: JSON.stringify(symptoms),
                    gender: gender,
                    year_of_birth: year_of_birth,
                    platform: currentPlatform
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addDiagnosisCallback",
            success: function (responseData) { _addDiagnosisCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
                _loader.show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                _loader.hide();
            }
        });
    }

    function _ajaxGetIssueInfo(issueId) {
        $.ajax({
            url: pathToWebservice + "/issues/" + issueId + "/info",
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    platform: currentPlatform
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addIssueInfoCallback",
            success: function (responseData) { _addIssueInfoCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
                _infoPage.find("#infoPageLoader").show();
                _infoPage.show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                _infoPage.find("#infoPageLoader").hide();
            }
        });


    }

    //////////////////end ajax calls//////////////////////////////////////////

    //////////////////end private functions//////////////////////////////////////////

})(jQuery);

/////////////diagosis result plugin end/////////////////////////
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
/////////////specialisation result plugin start///////////////////////

(function ($) {

    var _plugin;
    var _specialisationsList;
    var _diagnosisMessage;
    var _loader;

    var methods = {

        init: function (options) {

            return this.each(function () {
                _plugin = $(this);
                _plugin.parent().addClass("box-inactive");
                _initSpecialisationList();
            });
        },
        GetSpecialisations: function (options) {
            _clearSpecialisations();
            _ajaxGetSpecialisations(options.Symptoms, options.Gender, options.YearOfBirth);
        },
        Unbind: function (options) {
            _plugin.unbind('click');
            _plugin.empty();
        }
    };

    $.fn.specialisations = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.diagnosis');
        }

    };

    //////////////////private functions//////////////////////////////////////////
    function _initSpecialisationList() {
        _specialisationsList = jQuery("<ul/>", { "class": "diagnosis_list" });

        _diagnosisMessage = jQuery("<span/>", { "class": "message info", "text": diagnosisMessage });
        _diagnosisMessage.hide();
        _loader = jQuery("<div/>", { "id": "diagnosisLoader", "class": "loader" });
        _loader.hide();
        _plugin.append(_loader);
        _plugin.append(_specialisationsList);
        _plugin.append(_diagnosisMessage);
    }

    function _createSpecialisationElement(spec, allSuggestedSpec) {
        _specialisationsList.append(_createSpecialisationNameElement(allSuggestedSpec, spec.Name));
        _specialisationsList.append(_createProbabilityElement(spec.Accuracy));
    }

    function _addSpecialisationsCallback(specialisations) {
        _diagnosisMessage.hide();
        var allSuggestedSpec = new Array();
        $.each(specialisations, function () {
            allSuggestedSpec.push(this.Name);
        });
        var specnames = JSON.stringify(allSuggestedSpec);

        $.each(specialisations, function () {
            _createSpecialisationElement(this, specnames);
        });
        if (specialisations.length > 0) {
            _plugin.parent().removeClass("box-inactive");
            _setDiagnosisMessage(diagnosisMessage);
        }
        else {
            _plugin.parent().addClass("box-inactive");
            _setDiagnosisMessage(noDiagnosisMessage);
        }
    }

    function _createSpecialisationNameElement(allSuggestedSpec, specName) {
        var specListElement = jQuery("<li/>", {
        });

        var spec = jQuery("<a/>", {
            "class": "suggested_spec",
            "text": specName,
            "href": specUrl + "?specs=" + allSuggestedSpec
        });

        var specNameElement = jQuery("<h4/>", {
            "class": "header diagnosis_name_header"
        });

        specNameElement.append(spec);

        specListElement.append(specNameElement);

        return specListElement;
    }

    function _createProbabilityElement(accuracy) {
        specListElement = jQuery("<li/>", {
        });

        var progress = jQuery("<div/>", {
            "class": "progress"
        });

        var bar = jQuery("<div/>", {
            "class": "progress-bar progress-bar-primary animate"
        });
        var currentProgress = 0;
        bar.width(currentProgress + '%');
        var interval = setInterval(function () {
            if (currentProgress >= accuracy) {
                clearInterval(interval);
            } else {
                currentProgress++;
                bar.width(currentProgress + '%');
            }
        }, 20);
        progress.append(bar);
        specListElement.append(progress);
        return specListElement;
    }

    function _clearSpecialisations() {
        _plugin.find("ul").empty();
    }

    function _setDiagnosisMessage(message) {
        _diagnosisMessage.text(message);
        _diagnosisMessage.show();
    }
    //////////////////ajax calls//////////////////////////////////////////

    function _ajaxGetSpecialisations(symptoms, gender, year_of_birth) {
        $.ajax({
            url: pathToWebservice + "/diagnosis/specialisations",
            type: "GET",
            data:
                {
                    token: token,
                    format: "json",
                    language: language,
                    symptoms: JSON.stringify(symptoms),
                    gender: gender,
                    year_of_birth: year_of_birth,
                    platform: currentPlatform
                },
            contentType: "application/json; charset=utf-8",
            cache: false,
            dataType: "jsonp",
            jsonpCallback: "_addSpecialisationsCallback",
            success: function (responseData) { _addSpecialisationsCallback(responseData); },
            beforeSend: function (jqXHR, settings) {
                _loader.show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (window.console)
                    console.log(xhr.responseText);
            },
            complete: function () {
                _loader.hide();
            }
        });
    }
    //////////////////end ajax calls//////////////////////////////////////////

    //////////////////end private functions//////////////////////////////////////////

})(jQuery);

/////////////specialisation result plugin end/////////////////////////
//////////////////////////////////////////////////////////////////////


//////////////global cookies functions ///////////////////

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = $.trim(ca[i]);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function isDisclaimerChecked() {
    var isChecked = getCookie("diagnosisDisclaimer");
    return isChecked !== "" ? isChecked : false;
}


//////////////end cookies functions //////////////////////////////////

function inArray(val, arr) {
    cnt = 0;
    index = -1;
    $(arr).each(function () {
        if (parseInt(this) == parseInt(val)) { index = cnt; }
        cnt++;
    });
    return index;
}