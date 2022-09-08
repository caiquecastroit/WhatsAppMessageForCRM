/**
 * @module ZOHO.CRM
 */
var ZOHO = (function() {
    var appSDK;
    var eventListenerMap = {};
    var isInitTriggered = false; // verificar
    var initPromise = undefined; // verificar 
    
    return {
        embeddedApp: {
            on: function(event, fn) {
                eventListenerMap[event] = fn;
            },
            init: function() {
            	if(!isInitTriggered)
            	{
            		isInitTriggered = true;
                    appSDK = new ZSDK;
                    var promiseResolve;
                    
                    initPromise = new Promise(function(resolve, reject) {
                        promiseResolve = resolve;
                      
                    });

                    appSDK.OnLoad(function() {

                        promiseResolve();
                    });

                    for (var key in eventListenerMap) {
                        appSDK.getContext().Event.Listen(key, eventListenerMap[key]);
                    }
            	}
                return initPromise;
            }
        },
        CRM: (function() {
            function newRequestPromise(data) {
                /*
                 * Sdk Version Maintainance
                 */
                data['sdkVersion'] = '1';
                return appSDK.getContext().Event.Trigger('CRM_EVENT', data, true);
            }
            // file upload issue fie
            function createNewFileObj(file)
            {
				var oldfile = file;
				var newfile = new File([oldfile], oldfile.name, { type: oldfile.type });
	         	return newfile;
            }
            function createRecord(Entity, APIdata, RecordID, RelatedEntity) {
            	if(APIdata.FileData)
                {
            	  var newfileObj = createNewFileObj(APIdata.FileData);
                  APIdata.FileData = newfileObj;
                }
                var data = {
                    category: "CREATE", //no i18n
                    Entity: Entity,
                    RelatedID: RecordID,
                    APIData: APIdata
                };
                data.type = RelatedEntity || "RECORD"
                return newRequestPromise(data);

            };

            function getRecord(Entity, recordID, relatedListSysRef) {
                var data = {
                    category: "READ", //no i18n
                    APIData: {
                        Entity: Entity,
                        RecordID: recordID,
                        RelatedList: relatedListSysRef
                    }
                };
                return newRequestPromise(data);
            };
            function getBluePrint(APIData) {
                APIData.category = "BLUEPRINT" //no i18n
                return newRequestPromise(APIData);
            };
            function uploadFile(APIData)
            {
            	if(APIData.FILE)
        		{
            		var newfileobj = createNewFileObj(APIData.FILE.file);
            		APIData.FILE.file = newfileobj;
        		}
                var data = {
                    FileData : APIData,
                    category : "FILES", //no i18n
                    type : "UPLOAD_FILE"
                }
                return newRequestPromise(data);
            };
            function getFile(APIData)
            {
                APIData.category = "FILES";
                APIData.type = "DOWNLOAD_FILE"
                return newRequestPromise(APIData);
            }
            function getAllActions(APIData)
            {
                APIData.category = "APPROVALS";
                return newRequestPromise(APIData);
            }
            function getAllRecords(APIData) {
                var data = {
                    category: "READ",
                    APIData: APIData
                }
                return newRequestPromise(data);
            };

            function updateRecord(Entity, APIData) {
                var data = {
                    category: "UPDATE", //no i18n
                    type: "RECORD", //no i18n
                    Entity: Entity,
                    APIData: APIData
                };
                return newRequestPromise(data);
            };

            function getRelatedRecord(APIData)
            {
                var data = {
                    category: "READ",//no i18n
                    APIData: APIData //no i18n
                };
                return newRequestPromise(data);
            };

            function updateRelatedRecord(Entity, RecordID, RelatedList, RelatedRecordID, APIData) {
                var data = {
                    category: "UPDATE", //no i18n
                    type: "RELATED_RECORD", //no i18n
                    Entity: Entity,
                    RecordID: RecordID,
                    RelatedList: RelatedList,
                    RelatedRecordID: RelatedRecordID,
                    APIData: APIData
                };
                return newRequestPromise(data);
            };

            function updateNotes(Entity, RecordID, RelatedRecordID, APIData) {
                var data = {
                    category: "UPDATE", //no i18n
                    type: "NOTES", //no i18n
                    Entity: Entity,
                    RecordID: RecordID,
                    RelatedRecordID: RelatedRecordID,
                    APIData: APIData
                };
                return newRequestPromise(data);
            };

            function deleteRecord(Entity, RecordID) {
                var data = {
                    category: "DELETE", //no i18n
                    type: "RECORD", //no i18n
                    Entity: Entity,
                    RecordID: RecordID
                };
                return newRequestPromise(data);
            };

            function deleteRelatedRecord(Entity, RecordID, RelatedList, RelatedRecordID) {
                var data = {
                    category: "DELETE", //no i18n
                    type: "RELATED_RECORD", //no i18n
                    Entity: Entity,
                    RecordID: RecordID,
                    RelatedList: RelatedList,
                    RelatedRecordID: RelatedRecordID,
                };
                return newRequestPromise(data);
            }

            function searchRecord(Entity, Type, Query, page, per_page,delay) {
                var data = {
                    category: "SEARCH", //no i18n
                    Entity: Entity,
                    Type: Type,
                    Query: Query,
                    page: page,
                    per_page: per_page,
                    delay:delay
                };
                return newRequestPromise(data);
            }

            function getAllProfiles(Category, Type) {
                var data = {
                    category: Category,
                    type: Type
                };
                return newRequestPromise(data);
            }

            function getProfile(Category, Type, ID) {
                var data = {
                    category: Category,
                    type: Type,
                    ID: ID
                };
                return newRequestPromise(data);
            }

            function updateProfile(Category, Type, ID, APIData) {
                var data = {
                    category: Category,
                    type: Type,
                    ID: ID,
                    APIData: APIData
                };
                return newRequestPromise(data);
            }

            function constructQueryString(source) {
                var array = [];

                for (var key in source) {
                    array.push(encodeURIComponent(key) + "=" + encodeURIComponent(source[key]));
                }
                return array.join("&");
            };

            function remoteCall(method, requestData, type) {
            	if(requestData.FILE)
        		{
            		var newfileobj = createNewFileObj(requestData.FILE.file);
            		requestData.FILE.file = newfileobj;
        		}
                var reqData = undefined;
                if (!type) {
                    var url = requestData.url;
                    var params = requestData.params;
                    var headers = requestData.headers;
                    var body = requestData.body;
                    var Parts = requestData.PARTS;
                    var partBoundary = requestData.PART_BOUNDARY;
                    var ContentType = requestData.CONTENT_TYPE;
                    var responseType = requestData.RESPONSE_TYPE;
                    var file = requestData.FILE;
                    if (!url) {
                        throw { Message: "Url missing" }
                    }
                    if (params) {
                        var queryString = constructQueryString(params);
                        url += (url.indexOf("?") > -1 ? "&" : "?") + queryString;
                    }
                    reqData = {
                        url: url,
                        Header: headers,
                        Body: body,
                        CONTENT_TYPE: ContentType,
                        RESPONSE_TYPE: responseType,
                        PARTS: Parts,
                        PARTS_BOUNDARY:partBoundary,
                        FILE: file
                    }
                } else {
                    reqData = requestData;
                }

                var data = {
                    category: "CONNECTOR", //no i18n
                    nameSpace: method,
                    data: reqData,
                    type:type
                };
                return newRequestPromise(data);
            };

            function manipulateUI(data) {
                var config = {
                    category: "UI"
                };
                $.extend(data, config);
                return newRequestPromise(data);
            }

            function config(type, nameSpace,requestData) {
                var data = {
                    category: "CONFIG",
                    type: type,
                    nameSpace: nameSpace,
                    APIData : requestData
                };
                return newRequestPromise(data);
            }

            function action(type, obj) {
                var data = {
                    category: "ACTION",
                    type: type,
                    object: obj
                };
                return newRequestPromise(data);
            }

            function user(data) {
                var promiseData = {
                    category: "USER",
                };
                if (data.ID) {
                    promiseData.ID = data.ID
                } else if (data.Type) {
                    promiseData.Type = data.Type
                    if (data.page) {
                        promiseData.page = data.page
                    }
                    if (data.per_page) {
                        promiseData.per_page = data.per_page
                    }
                }
                return newRequestPromise(promiseData);
            }

            function getMeta(data) {
                var reqJson = {
                    category: "META",
                    type: data.type,
                    Entity: data.Entity,
                    Id: data.Id
                }
                return newRequestPromise(reqJson);

            }
            var HTTPRequest = {
                POST: "wget.post",
                GET: "wget.get",
                PUT: "wget.put",
                PATCH: "wget.patch",
                DELETE: "wget.delete"
            }
            return {
                ACTION: {
                    setConfig: function(obj) {
                        return action("CUSTOM_ACTION_SAVE_CONFIG", obj);
                    },
                    enableAccountAccess: function(obj) {
                        return action("ENABLE_ACCOUNT_ACCESS", obj);
                    }
                },
                /**
                 * @namespace ZOHO.CRM.FUNCTIONS
                 */
                FUNCTIONS: {
                    /**
                     * @function execute
                     * @description Invoke a Function
                     * @returns {Promise} resolved with response of the function executed
                     * @memberof ZOHO.CRM.FUNCTIONS
                     * @param {String} func_name - Function Name
                     * @param {Object} req_data - Request Data
                     * @example
                     * var func_name = "custom_function4";
                     * var req_data ={
                     *   "arguments": JSON.stringify({
                     *       "mailid" : "siprxx.xxx@xxxx.com" 
                     *   })
                     * };
                     * ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     *
                     * //Prints
                     * {
                     *   "code": "success",
                     *   "details": {
                     *     "type":"VOID",
                     *       "output": null,
                     *       "id": "944000000003001"
                     *   },
                     *   "message": "function executed successfully"
                     * }
                     */
                   execute : function(func_name, req_data){
                    var request = {};
                    req_data.auth_type = "oauth";
                    request.data = req_data;
                    var data = {
                    category : "FUNCTIONS_EXECUTE",//no i18n
                    customFunctionName : func_name,
                    data : request
                    };
                    return newRequestPromise(data);
                    }
                },

                /**
                 * @namespace ZOHO.CRM.CONFIG
                 */
                CONFIG: {
                    /**
                     * @function getOrgInfo
                     * @memberof ZOHO.CRM.CONFIG
                     * @description get plugins configuration data
                     * @returns {Promise} Resolved with Plugin Configuration
                     * @example
                     * ZOHO.CRM.CONFIG.getOrgInfo().then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     *{
                     *  "Success": {
                     *   "Content": "12345"
                     *  }
                     *}
                     *
                     */
                    getOrgInfo: function(nameSpace) {
                        return config("ORG");
                    },
                    /**
                     * @function getCurrentUser
                     * @memberof ZOHO.CRM.CONFIG
                     * @description get Current User info
                     * @returns {Promise} Resolved with User info
                     * @example
                     * ZOHO.CRM.CONFIG.getCurrentUser().then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     * {
                     *   "confirm": true,
                     *   "full_name": "asd devvv",
                     *   "role": {
                     *     "name": "CEO",
                     *     "id": "1000000028936"
                     *   },
                     *   "profile": {
                     *     "name": "Administrator",
                     *     "id": "1000000028942"
                     *   },
                     *   "last_name": "asd devvv",
                     *   "alias": null,
                     *   "id": "1000000030132",
                     *   "first_name": null,
                     *   "email": "naresh.babu+dev1@zylker.com",
                     *   "zuid": "4253443",
                     *   "status": "active"
                     * }
                     *
                     */
                    getCurrentUser: function() {
                        return config("CURRENT_USER");
                    },
                    /*
                     * @function GetCurrentEnvironment
                     * @memberof ZOHO.CRM.CONFIG
                     * @description get Current org info
                     * @returns {Promise} Resolved with User info
                     * @example
                     * ZOHO.CRM.CONFIG.GetCurrentEnvironment().then(function(data){
                     *  console.log(data);
                     * });
                     * 
                     * //prints 
                     *
                     *
                     *{
                     *  "deployment": "US",
                     *  "ZGID": 1001244313,
                     *  "ZUID": "1001244314",
                     *  "appDetails": {
                     *    "appUrl": "https://vettti.ucrm.com"
                     *  }
                     *}
                     *
                     */
                    GetCurrentEnvironment: function() {
                        return config("ORG_LEVEL_INFO");
                    },
                    /*
                    * @function createUser
    
                    }*/
                },
                /**
                 * @namespace ZOHO.CRM.META
                 */
                META: {
                    /**
                     * @function getFields
                     * @memberof ZOHO.CRM.META
                     * @description get field lables and api names
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @returns {Promise} Resolved with data of record matching with Entity and type
                     * @example
    
                     */
                    getFields: function(data) {

                        data.type = "FIELD_LIST";
                        return getMeta(data);

                    },
                    /**
                     * @function getModules
                     * @memberof ZOHO.CRM.META
                     * @description get Modules list
                     * @returns {Promise} Resolved with data of all modules
                     * @example
    
                     */
                    getModules: function() {
                        var data = {
                            type: "MODULE_LIST"
                        };
                        return getMeta(data);

                    },
                    /**
                     * @function getAssignmentRules
                     * @memberof ZOHO.CRM.META
                     * @description get Assignment rules details
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @returns {Promise} Resolved with data of Assignment rules matching with Entity
                     * @example
                     */
                    getAssignmentRules: function(data) {
                        data.type = "ASSIGNMENT_RULES";
                        return getMeta(data);
                    },

                    /**
                     * @function getLayouts
                     * @memberof ZOHO.CRM.META
                     * @description get Layout details of a module
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {String} [config.Id] - layout ID.
                     * @returns {Promise} Resolved with data of Assignment rules matching with Entity
                     * @example
                     * ZOHO.CRM.META.getLayouts({"Entity":"Contacts"}).then(function(data){
                     * console.log(data);	
                     * });
                     * @example
                     * ZOHO.CRM.META.getLayouts({"Entity":"Contacts","LayoutId":"5000000000169"}).then(function(data){
                     * console.log(data);	
                     * });
                     * @example
                     */
                    getLayouts: function(data) {
                        data.id = data.id ? data.id : data.LayoutId
                        data.type = data.Id ? "LAYOUT" : "LAYOUTS"
                        return getMeta(data);
                    },

                    /**
                     * @function getRelatedList
                     * @memberof ZOHO.CRM.META
                     * @description get RelatedList meta info of a module
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @returns {Promise} Resolved with data of Assignment rules matching with Entity
                     * @example
                     * ZOHO.CRM.META.getRelatedList({"Entity":"Contacts"}).then(function(data){
                     * console.log(data);	
                     * });
                     *  //prints
                     *{
                     *  "related_lists": [
                     *    {
                     *      "display_label": "Attachments",
                     *      "visible": true,
                     *      "api_name": "Attachments",
                     *      "module": {
                     *        "api_name": "Attachments",
                     *        "id": "3000000000111"
                     *      },
                     *      "name": "Attachments",
                     *      "id": "3000000003968",
                     *      "href": "Contacts/{ENTITYID}/Attachments",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Deals",
                     *      "visible": true,
                     *      "api_name": "Deals",
                     *      "module": {
                     *        "api_name": "Deals",
                     *        "id": "3000000000047"
                     *      },
                     *      "name": "Deals",
                     *      "id": "3000000003974",
                     *      "href": "Contacts/{ENTITYID}/Deals",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Notes",
                     *      "visible": true,
                     *      "api_name": "Notes",
                     *      "module": {
                     *        "api_name": "Notes",
                     *        "id": "3000000000069"
                     *      },
                     *      "name": "Notes",
                     *      "id": "3000000003971",
                     *      "href": "Contacts/{ENTITYID}/Notes",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Open Activities",
                     *      "visible": true,
                     *      "api_name": "Activities",
                     *      "module": {
                     *        "api_name": "Activities",
                     *        "id": "3000000000049"
                     *      },
                     *      "name": "Activities",
                     *      "id": "3000000003965",
                     *      "href": "Contacts/{ENTITYID}/Activities",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Closed Activities",
                     *      "visible": true,
                     *      "api_name": "Activities_History",
                     *      "module": {
                     *        "api_name": "Activities",
                     *        "id": "3000000000049"
                     *      },
                     *      "name": "Activities History",
                     *      "id": "3000000003962",
                     *      "href": "Contacts/{ENTITYID}/Activities_History",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Products",
                     *      "visible": true,
                     *      "api_name": "Products",
                     *      "module": {
                     *        "api_name": "Products",
                     *        "id": "3000000000097"
                     *      },
                     *      "name": "Products",
                     *      "id": "3000000003977",
                     *      "href": "Contacts/{ENTITYID}/Products",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Invited Events",
                     *      "visible": true,
                     *      "api_name": "Invited_Events",
                     *      "module": {
                     *        "api_name": "Events",
                     *        "id": "3000000000065"
                     *      },
                     *      "name": "Invited Events",
                     *      "id": "3000000004001",
                     *      "href": "Contacts/{ENTITYID}/Invited_Events",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Cases",
                     *      "visible": true,
                     *      "api_name": "Cases",
                     *      "module": {
                     *        "api_name": "Cases",
                     *        "id": "3000000000093"
                     *      },
                     *      "name": "Cases",
                     *      "id": "3000000003980",
                     *      "href": "Contacts/{ENTITYID}/Cases",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Quotes",
                     *      "visible": true,
                     *      "api_name": "Quotes",
                     *      "module": {
                     *        "api_name": "Quotes",
                     *        "id": "3000000000103"
                     *      },
                     *      "name": "Quotes",
                     *      "id": "3000000003983",
                     *      "href": "Contacts/{ENTITYID}/Quotes",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Sales Orders",
                     *      "visible": true,
                     *      "api_name": "SalesOrders",
                     *      "module": {
                     *        "api_name": "Sales_Orders",
                     *        "id": "3000000000105"
                     *      },
                     *      "name": "SalesOrders",
                     *      "id": "3000000003986",
                     *      "href": "Contacts/{ENTITYID}/SalesOrders",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Purchase Orders",
                     *      "visible": true,
                     *      "api_name": "PurchaseOrders",
                     *      "module": {
                     *        "api_name": "Purchase_Orders",
                     *        "id": "3000000000107"
                     *      },
                     *      "name": "PurchaseOrders",
                     *      "id": "3000000003989",
                     *      "href": "Contacts/{ENTITYID}/PurchaseOrders",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Invoices",
                     *      "visible": true,
                     *      "api_name": "Invoices",
                     *      "module": {
                     *        "api_name": "Invoices",
                     *        "id": "3000000000109"
                     *      },
                     *      "name": "Invoices",
                     *      "id": "3000000003995",
                     *      "href": "Contacts/{ENTITYID}/Invoices",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Campaigns",
                     *      "visible": true,
                     *      "api_name": "Campaigns",
                     *      "module": {
                     *        "api_name": "Campaigns",
                     *        "id": "3000000000055"
                     *      },
                     *      "name": "Campaigns",
                     *      "id": "3000000003998",
                     *      "href": "Contacts/{ENTITYID}/Campaigns",
                     *      "type": "default"
                     *    },
                     *    {
                     *      "display_label": "Social",
                     *      "visible": true,
                     *      "api_name": "Social",
                     *      "module": {
                     *        "api_name": "Social",
                     *        "id": "3000000000087"
                     *      },
                     *      "name": "Social",
                     *      "id": "3000000004067",
                     *      "href": null,
                     *      "type": "default"
                     *    }
                     *  ]
                     *}
                     */
                    getRelatedList: function(data) {
                        data.type = "RELATED_LIST";
                        return getMeta(data);
                    },

                    /**
                     * @function getCustomViews
                     * @memberof ZOHO.CRM.META
                     * @description get Custom Views of a module
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {String} [config.Id] - layout ID.
                     * @returns {Promise} Resolved with data of Assignment rules matching with Entity
                   
                     *@example
                    
                     */
                    getCustomViews: function(data) {
                        data.type = data.Id ? "CUSTOM_VIEW" : "CUSTOM_VIEWS"
                        return getMeta(data);
                    },
                },
                /**
                 * @namespace ZOHO.CRM.API
                 */
                API: {
                    /**
                     * @function addNotes
                     * @description Add Notes to a record
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {Long} config.RecordID - RecordID to associate the notes.
                     * @param {String} config.Title - Notes Title.
                     * @param {String} config.Content - Notes Content.
                     * @returns {Promise} Resolved with notes creation status
                     * @memberof ZOHO.CRM.API
                     * @example
                    
                     */
                    addNotes: function(data) {
                        var Entity = data.Entity;
                        var RelatedEntity = "NOTES";
                        var RecordID = data.RecordID;
                        var content = {
                            data: [{
                                Note_Title: data.Title,
                                Note_Content: data.Content
                            }]
                        };
                        return createRecord(Entity, content, RecordID, RelatedEntity);
                    },
                    addNotesAttachment: function(data) {
                        var Entity = data.Entity;
                        var RecordID = data.RecordID;
                        var RelatedRecordID = data.RelatedRecordID;
                        var APIData = {
                            Files: {
                                FileName: File.Name,
                                FileData: File.Content
                            }
                        };
                        return updateNotes(Entity, RecordID, RelatedRecordID, APIData)
                    },
                    /**
                     * @function insertRecord
                     * @description Insert record to a modue
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {list} config.Trigger - The trigger input can be "workflow", "approval" or "blueprint". If the trigger is not mentioned, the workflows, approvals and blueprints related to the API will get executed. Enter the trigger value as [] to not execute the workflows
                     * @param {Object} config.APIData - RecordID to associate the notes.
                     * @return {Promise} Resolved with response data 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * var recordData = {
                     *         "Company": "Zylker",
                     *         "Last_Name": "Peterson"
                     *   }
                     * ZOHO.CRM.API.insertRecord({Entity:"Leads",APIData:recordData,Trigger:["workflow"]}).then(function(data){
                     *	console.log(data);
                     *	});
                     * //prints
                     *{
                     *  "data": [
                     *    {
                     *      "code": "SUCCESS",
                     *      "details": {
                     *        "Modified_Time": "2017-12-22T03:24:39+05:30",
                     *        "Modified_By": {
                     *          "name": "NareshTesting ",
                     *          "id": "3000000031045"
                     *        },
                     *        "Created_Time": "2017-12-22T03:24:39+05:30",
                     *        "id": "3000000040011",
                     *        "Created_By": {
                     *          "name": "NareshTesting ",
                     *          "id": "3000000031045"
                     *        }
                     *      },
                     *      "message": "record added",
                     *      "status": "success"
                     *    }
                     *  ]
                     *}
                     * @example
                    
                     */
                    insertRecord: function(data) {
                        var Entity = data.Entity;
                        var APIData = data.APIData;
                        APIData.trigger = data.Trigger;
                        return createRecord(Entity, APIData);
                    },
                     /**
                     * @function upsertRecord
                     * @description Insert record or update matching existing record
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {list} config.Trigger - The trigger input can be "workflow", "approval" or "blueprint". If the trigger is not mentioned, the workflows, approvals and blueprints related to the API will get executed. Enter the trigger value as [] to not execute the workflows
                     * @param {Object} config.APIData - insert json details
                     * @param {Object} config.duplicate_check_fields  - this param will update existing record,add multiple fields with comma separated
                     * @return {Promise} Resolved with response data 
                     * @memberof ZOHO.CRM.API
                     * @example
                    
                     *]
                     */
                    upsertRecord: function(data) {
                        var Entity = data.Entity;
                        var APIData = data.APIData;
                        APIData.trigger = data.Trigger;
                        APIData.action = "UPSERT";
                        if(data.duplicate_check_fields && data.duplicate_check_fields instanceof Array)
                        {
							APIData.duplicate_check_fields = data.duplicate_check_fields.join(",")
                        }
                        return createRecord(Entity, APIData);
                    },
                    /**
                     * @function getRecord
                     * @description get all Details of a record
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {String} config.RecordID - RecordID to associate the notes.
                     * @return {Promise} Resolved with data of record matching with RecordID 
                     * @memberof ZOHO.CRM.API
                     * @example
                    
                     */
                    getRecord: function(data) {
                        var Entity = data.Entity;
                        var RecordID = data.RecordID;
                        return getRecord(Entity, RecordID);
                    },
                    /**
                    * @function getBluePrint
                    * @description Get blueprint details
                    * @param {object} config - configuration object
                    * @param {String} config.Entity - SysRefName of the module.
                    * @param {String} config.RecordID - RecordID to associate the notes.
                    * @return {Promise} Resolved with data of record matching with RecordID 
                    * @memberof ZOHO.CRM.API
                    * @example
                    * var config = 
                   
                    */
                    getBluePrint: function(data) {
                        var APIData = {
                            Entity : data.Entity,
                            RecordID : data.RecordID,
                            action: "GET_BLUEPRINT_STATUS"
                        }
                        return getBluePrint(APIData);
                    },
                    /**
                    * @function updateBluePrint
                    * @description update blueprint details for particular record.
                    * @param {Object} config - Configuration Object.
                    * @param {String} config.Entity - SysRefName of the module.
                    * @param {String} config.RecordID - RecordID to associate the notes.
                    * @param {object} config.BlueprintData - blueprint data to update 
                    * @return {Promise} Resolved with data of record matching with RecordID 
                    * @memberof ZOHO.CRM.API
                    * @example
                   
                    */
                    updateBluePrint: function(data) {
                        var APIData = {
                            Entity : data.Entity,
                            RecordID : data.RecordID,
                            BlueprintData : data.BlueprintData,
                            action: "UPDATE_BLUEPRINT_STATUS"
                        }
                        return getBluePrint(APIData);
                    },
                    /**
                    *@function uploadFile
                    *@description upload the files in to zoho server and return appname and id
                    *@memberof ZOHO.CRM.API
                    *@params {object} config - upload file details
                    *@return {Promise} Resolved with data of file
                    *@example
                    *var file = $("#attachmentinput")
                    *var file = document.getElementById("attachmentinput").files[0];
                    *var fileType = file.type;
                    *var config = {
                    *    "CONTENT_TYPE": "multipart",
                    *    "PARTS": [{
                    *        "headers": {
                    *            "Content-Disposition": "file;"
                    *        },
                    *        "content": "__FILE__"
                    *    }],
                    *    "FILE": {
                    *        "fileParam": "content",
                    *        "file": file
                    *    }

                    *}
                    *
                    *
                    *ZOHO.CRM.API.uploadFile(config).then(function(data) {
                    *    console.log(data);
                    *})
                    *
                    *
                    * //prints
                    *
                    *{
                    *  "data": [
                    *    {
                    *      "code": "SUCCESS",
                    *      "details": {
                    *        "name": "desk.png",
                    *        "id": "b12bb1b005f171ac797b3773040438ba7da026eb056f272271d511e95581689b"
                    *      },
                    *      "message": "desk.png uploaded Succeessfully",
                    *      "status": "success"
                    *    }
                    *  ]
                    *} 
                    */
                    uploadFile: function(data)
                    {
                        return uploadFile(data);
                    },
                    /**
                    *@function getFile
                    *@memberof ZOHO.CRM.API
                    *@description get file from file id
                    *@params {object} config - file id 
                    *@return {Promise} Resolved with data of file binary string 
                    *@example
                    *var config = {
                    *    id:"b12bb1b005f171ac797b3773040438ba7da026eb056f272271d511e95581689b"
                    *}
                    *
                    *
                    *ZOHO.CRM.API.getFile(config);
                    */
                    getFile :function(data)
                    {
                        return getFile(data);
                    },
                    /**
                     * @function getAllRecords
                     * @description get list of all records in a module
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {String} [config.sort_order] - To sort records. allowed values {asc|desc}
                     * @param {String} [config.converted] - To get the list of converted records
                     * @param {String} [config.approved] - To get the list of approved records
                     * @param {String} [config.page] - To get the list of records from the respective pages
                     * @param {String} [config.per_page] - To get the list of records available per page
                     * @return {Promise} Resolved with data of record matching with RecordID 
                     * @memberof ZOHO.CRM.API
                     * @example
                    
                     */
                    getAllRecords: function(data) {
                        return getAllRecords(data);
                    },
                    /**
                     * @function updateRecord
                     * @description To update a record in a module 
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {list} config.Trigger - The trigger input can be "workflow", "approval" or "blueprint". If the trigger is not mentioned, the workflows, approvals and blueprints related to the API will get executed. Enter the trigger value as [] to not execute the workflows
                     * @param {String} config.APIData - Update Record Data.
                     * @return {Promise} Resolved with data of update Record Response 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * var config={
                           
                     */
                    updateRecord: function(data) {
                        var Entity = data.Entity;
                        var APIData = data.APIData;
                        APIData.trigger = data.Trigger;
                        return updateRecord(Entity, APIData);
                    },
                    /**
                     * @function deleteRecord
                     * @description To delete a record from a module
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.Entity - SysRefName of the module.
                     * @param {String} config.RecordID - RecordID to associate the notes.
                     * @return {Promise} Resolved with Response to update record 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * ZOHO.CRM.API.deleteRecord({Entity:"Leads",RecordID: "1000000049031"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * 
                     * //prints 
                     *{
                     *  "data": [
                     *    {
                     *      "code": "SUCCESS",
                     *      "details": {
                     *        "id": "3000000040015"
                     *      },
                     *      "message": "record deleted",
                     *      "status": "success"
                     *    }
                     *  ]
                     *}      
                     */
                    deleteRecord: function(data) {
                        var Entity = data.Entity;
                        var recordID = data.RecordID;
                        return deleteRecord(Entity, recordID);
                    },
                    /**
                     * @function searchRecord
                     * @description To retrieve the records that matches your search criteria 
                     * @param {object} config - Configuration Object
                     * @param {String} config.Entity - SysRefName of module
                     * @param {String} config.Type - Allowed values "email|phone|word|criteria"
                     * @param {String} config.Query - query String
                     * @param {boolean} config.delay - query String
                     * @param {String} page - Pagination - Page number
                     * @param {String} per_page - Pagination - per page limit
                     * @return {Promise} Resolved with search result 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * ZOHO.CRM.API.searchRecord({Entity:"Leads",Type:"phone",Query:"123456789",delay:false})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * @example
                     * ZOHO.CRM.API.searchRecord({Entity:"Leads",Type:"email",Query:"test@zoho.com"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * @example
                     * ZOHO.CRM.API.searchRecord({Entity:"Leads",Type:"word",Query:"ZohoCrop"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * @example
                     * ZOHO.CRM.API.searchRecord({Entity:"Leads",Type:"criteria",Query:"(Company:equals:Zoho)"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * @example
                     * ZOHO.CRM.API.searchRecord({Entity:"Leads",Type:"criteria",Query:"((Company:equals:Zoho)or(Company:equals:zylker))"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     */
                    searchRecord: function(data) {
                        var Entity = data.Entity;
                        var Type = data.Type;
                        var Query = data.Query;
                        var page = data.page;
                        var per_page = data.per_page;
                        var delay = data.delay;
                        return searchRecord(Entity, Type, Query, page, per_page,delay);
                    },
                    /**
                    * @function getAllActions
                    * @description We can view all the available actions that can be performed on a particular record.
                    * @param {object} config - Configuration Object
                    * @param {String} config.Entity - SysRefname of module
                    * @param {String} config.RecordID - id of the particular record.
                    * @return {Promise} Resolved List of actions be the specified module record.
                    * @memberof ZOHO.CRM.API
                    * @example
                    
                    *
                    */
                    getAllActions: function(data)
                    {
                        data.action = "GET_ALL_ACTIONS"
                        return getAllActions(data);
                    },
                    /**
                    * @function getApprovalRecords
                    * @description This method is called by the one who has to approve.If it is called by others, they will get 204 response.
                    * <br><br><b>"others_awaiting"</b> gives the list of all approvals pending regardless of who has to approve it. Usually, Super Admin and administrator will be able to use this API whereas standard user will still get a 204 empty response.<br><br>
                    * @param {object} config - configuration object
                    * @param {string} config.type - Allowed values "awaiting | others_awaiting"
                    * @return {Promise} Resolved List of records for waiting the approval.
                    * @memberof ZOHO.CRM.API
                    * @example
                    *
                    *Example 1
                    *
                    * ZOHO.CRM.API.getApprovalRecords()
                    * .then(function(data){
                    *     console.log(data)
                    * })
                    *
                    *It returns the pending approval records of the current user
                    *
                    *
                    *Example 2
                    * var config = {type:"others_awaiting"}
                    *
                    *
                    * ZOHO.CRM.API.getApprovalRecords(config)
                    * .then(function(data){
                    *     console.log(data)
                    * })
                    *
                    *It returns the pending approval records which should be approve by other user.
                    * //prints
                    *
                    *
                    *
                    *{
                    *  "data": [
                    *    {
                    *      "owner": {
                    *        "phone": null,
                    *        "name": "milestone2 ",
                    *        "mobile": null,
                    *        "id": "111155000000032023",
                    *        "email": "uk@zylker.com"
                    *      },
                    *      "initiated_time": "2018-07-16T10:16:54+05:30",
                    *      "module": "Leads",
                    *      "rule": {
                    *        "name": "Name",
                    *        "id": "111155000000036006"
                    *      },
                    *      "id": "111155000000036021",
                    *      "type": "approval",
                    *      "entity": {
                    *        "name": "uk",
                    *        "id": "111155000000036014"
                    *      },
                    *      "default_layout": true,
                    *      "waiting_for": {
                    *        "name": "uk ",
                    *        "id": "111155000000035012"
                    *      }
                    *    }
                    *  ],
                    *  "info": {
                    *    "per_page": 200,
                    *    "count": 1,
                    *    "page": 1,
                    *    "more_records": false
                    *  }
                    *}
                    *
                    */
                    getApprovalRecords: function(data)
                    {
                        var newdata = {};
                        if(data)
                        {
                            data.action = "GET_APPROVAL_RECORDS";
                        }
                        else
                        {
                            newdata.action = "GET_APPROVAL_RECORDS";
                            data = newdata;
                        }
                        return getAllActions(data);
                    },
                    /**
                    * @function getApprovalById
                    * @description To get details of the particular approval.
                    * @param {object} config - configuration object
                    * @param {string} config.id - id of the approval
                    * @return {Promise} Resolved details of the approval.
                    * @memberof ZOHO.CRM.API
                    * @example
                    *var config = {
                    *       id:"518440000000222786"
                    *}
                    *
                    *
                    *ZOHO.CRM.API.getApprovalById(config).then(function(d){
                    *   console.log(d);
                    *})
                    *
                    *
                    *
                    * //prints
                    *
                    *
                    *
                    *{
                    *  "data": [
                    *    {
                    *      "owner": {
                    *        "phone": null,
                    *        "name": "milestone2 ",
                    *        "mobile": null,
                    *        "id": "111155000000032023",
                    *        "history": [],
                    *        "email": "uk@zylker.com"
                    *      },
                    *      "initiated_time": "2018-07-16T10:16:54+05:30",
                    *      "criteria": [
                    *        {
                    *          "api_name": "Annual_Revenue",
                    *          "field_label": "Annual Revenue",
                    *          "value": "$1.00"
                    *        }
                    *      ],
                    *      "module": "Leads",
                    *      "rule": {
                    *        "name": "Name",
                    *        "id": "111155000000036006"
                    *      },
                    *      "id": "518440000000222786",
                    *      "type": "approval",
                    *      "entity": {
                    *        "name": "uk",
                    *        "id": "111155000000036014"
                    *      },
                    *      "default_layout": true,
                    *      "waiting_for": {
                    *        "name": "uk ",
                    *        "id": "111155000000035012"
                    *      }
                    *    }
                    *  ],
                    *  "info": {
                    *    "per_page": 200,
                    *    "count": 1,
                    *    "page": 1,
                    *    "more_records": false
                    *  }
                    *}
                    *
                    */
                    getApprovalById: function(data)
                    {
                        data.action = "GET_APPROVALBYID"
                        return getAllActions(data);
                    },
                    /**
                    * @function getApprovalsHistory
                    * @description View the history of records put up for approval
                    * @return {Promise} Resolved List of records for waiting the approval.
                    * @memberof ZOHO.CRM.API
                    * @example
                    *
                    *ZOHO.CRM.API.getApprovalsHistory().then(function(data){
                    *    console.log(data);
                    *});
                    *
                    *
                    * //prints
                    *
                    *
                    *
                    *{
                    *  "data": [
                    *    {
                    *      "audit_time": "2018-07-16T15:46:54+05:30",
                    *      "done_by": {
                    *        "name": "milestone2 ",
                    *        "id": "111155000000032023"
                    *      },
                    *      "module": "Leads",
                    *      "record": {
                    *        "name": "uk",
                    *        "id": "111155000000036014"
                    *      },
                    *      "related_module": null,
                    *      "action": "Submitted",
                    *      "rule": "111155000000036006",
                    *      "account": null,
                    *      "related_name": "milestone2 ",
                    *      "territory": null
                    *    }
                    *  ],
                    *  "info": {
                    *    "per_page": 200,
                    *    "count": 1,
                    *    "page": 1,
                    *    "more_records": false
                    *  }
                    *}
                    *
                    *
                    */
                    getApprovalsHistory: function()
                    {
                        var data = {};
                        data.action="GET_APPROVALS_HISTORY";
                        return getAllActions(data);
                    },
                    /**
                    * @function approveRecord
                    * @description approve the record
                    * @param {object} config - configuration object
                    * @param {string} config.Entity - SysRefName of module
                    * @param {string} config.RecordID - id of the record.
                    * @param {string} config.actionType - type of action Allowed values  "approve" | "delegate" | "resubmit" | "reject"
                    * @param {string} config.comments - comments (optional)
                    * @param {string} config.user - only for delegate
                    * @return {Promise} Resolved with the details of approval
                    * @memberof ZOHO.CRM.API
                    * @example
                    *
                    *
                    * var config = {
                    *   Entity:"Leads",
                    *   RecordID:"111155000000036014",
                    *   actionType:"approve"
                    *}
                    *
                    *
                    *
                    *ZOHO.CRM.API.approveRecord(config).then(function(data){
                    *    console.log(data);
                    *});
                    *
                    *
                    * //prints
                    *
                    *
                    *{
                    *  "code": "SUCCESS",
                    *  "details": {
                    *    "id": "111155000000036014"
                    *  },
                    *  "message": "Record approved successfully",
                    *  "status": "success"
                    *}
                    *
                    */
                    approveRecord: function(data)
                    {
                        data.action="UPDATE_APPROVAL";
                        return getAllActions(data);
                    },
                    /**
                     * @function getAllUsers
                     * @description To retrieve list of users in ZohoCRM 
                     * @param {object} config - Configuration Object
                     * @param {String} config.Type - Allowed values "AllUsers | ActiveUsers | DeactiveUsers | ConfirmedUsers | NotConfirmedUsers | DeletedUsers | ActiveConfirmedUsers | AdminUsers | ActiveConfirmedAdmins"
                     * @param {number} [config.page] - To get the list of users from the respective pages
                     * @param {number} [config.per_page] - To get the list of users available per page
                     * @return {Promise} Resolved List of users matching specified Type 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * ZOHO.CRM.API.getAllUsers({Type:"AllUsers"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * //prints
                     *{
                     *  "users": [
                     *    {
                     *      "confirm": true,
                     *      "full_name": "NareshTesting ",
                     *      "role": {
                     *        "name": "CEO",
                     *        "id": "3000000029719"
                     *      },
                     *      "territories": [],
                     *      "profile": {
                     *        "name": "Administrator",
                     *        "id": "3000000029725"
                     *      },
                     *      "last_name": null,
                     *      "alias": null,
                     *      "id": "3000000031045",
                     *      "first_name": "NareshTesting",
                     *      "email": "naresh.babu+dev2@zylker.com",
                     *      "zuid": "5073288",
                     *      "status": "active"
                     *    }
                     *  ],
                     *  "info": {
                     *    "per_page": 200,
                     *    "count": 1,
                     *    "page": 1,
                     *    "more_records": false
                     *  }
                     *}
                     */
                    getAllUsers: function(data) {
                        var Type = data.Type;
                        var page = data.page;
                        var per_page = data.per_page;
                        return user({ Type: Type, page: page, per_page: per_page });
                    },
                    /**
                     * @function getUser
                     * @description To retrieve list of users in ZohoCRM 
                     * @param {object} config - Configuration Object
                     * @param {String} config.ID - UserID 
                     * @return {Promise} Resolved user matching userID 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * ZOHO.CRM.API.getUser({ID:"3000000029719"})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * //prints
                     *{
                     *  "users": [
                     *    {
                     *      "country": null,
                     *      "role": {
                     *        "name": "CEO",
                     *        "id": "3000000029719"
                     *      },
                     *      "customize_info": {
                     *        "notes_desc": null,
                     *        "show_right_panel": null,
                     *        "bc_view": null,
                     *        "show_home": false,
                     *        "show_detail_view": true,
                     *        "unpin_recent_item": null
                     *      },
                     *      "city": null,
                     *      "signature": null,
                     *      "name_format": "Salutation,First Name,Last Name",
                     *      "language": "en_US",
                     *      "locale": "en_US",
                     *      "personal_account": true,
                     *      "ntc_notification_type": [
                     *        3000000020985,
                     *        3000000020988,
                     *        3000000020991,
                     *        3000000020994,
                     *        3000000020997,
                     *        3000000021012,
                     *        3000000021003,
                     *        3000000021006,
                     *        3000000021009,
                     *        3000000021078,
                     *        3000000021072,
                     *        3000000021075,
                     *        3000000021069,
                     *        3000000021081,
                     *        3000000021084,
                     *        3000000021087
                     *      ],
                     *      "default_tab_group": "0",
                     *      "street": null,
                     *      "alias": null,
                     *      "theme": {
                     *        "normal_tab": {
                     *          "font_color": "#FFFFFF",
                     *          "background": "#222222"
                     *        },
                     *        "selected_tab": {
                     *          "font_color": "#FFFFFF",
                     *          "background": "#222222"
                     *        },
                     *        "new_background": null,
                     *        "background": "#F3F0EB",
                     *        "screen": "fixed",
                     *        "type": "default"
                     *      },
                     *      "id": "3000000031045",
                     *      "state": null,
                     *      "country_locale": "en_US",
                     *      "fax": null,
                     *      "first_name": "NareshTesting",
                     *      "email": "naresh.babu+dev2@zylker.com",
                     *      "telephony_enabled": false,
                     *      "imap_status": false,
                     *      "zip": null,
                     *      "decimal_separator": "en_US",
                     *      "website": null,
                     *      "time_format": "hh:mm a",
                     *      "profile": {
                     *        "name": "Administrator",
                     *        "id": "3000000029725"
                     *      },
                     *      "mobile": null,
                     *      "last_name": null,
                     *      "time_zone": "Asia/Kolkata",
                     *      "zuid": "5073288",
                     *      "confirm": true,
                     *      "rtl_enabled": false,
                     *      "full_name": "NareshTesting ",
                     *      "ezuid": "6ca2127e9d60c217",
                     *      "territories": [],
                     *      "phone": null,
                     *      "dob": null,
                     *      "date_format": "MM/dd/yyyy",
                     *      "ntc_enabled": true,
                     *      "status": "active"
                     *    }
                     *  ]
                     *}
                     */
                    getUser: function(data) {
                        var ID = data.ID;
                        return user({ ID: ID });
                    },
                    /**
                     * @function getRelatedRecords
                     * @description To retrive related list records
                     * @param {object} config - Configuration Object
                     * @param {String} config.Entity - 	SysRefName of the module. 
                     * @param {String} config.RecordID - RecordID to associate the notes. 
                     * @param {String} config.RelatedListName - 	SysRefName of the relatedList. 
                     * @param {Number} [config.page] - To get the list of related records from the respective page.
                     * @param {Number} [config.per_page] - To get the list of related records available per page.
                     * @return {Promise} Resolved user matching userID 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * ZOHO.CRM.API.getRelatedRecords({Entity:"Leads",RecordID:"1000000030132",RelatedList:"Notes",page:1,per_page:200})
                     * .then(function(data){
                     *     console.log(data)
                     * })
                     * //prints
                     * 
                     *{
                     *  "data": [
                     *    {
                     *      "Owner": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "Modified_Time": "2017-12-22T03:58:20+05:30",
                     *      "$attachments": null,
                     *      "Created_Time": "2017-12-22T03:58:20+05:30",
                     *      "Parent_Id": {
                     *        "name": "Peterson",
                     *        "id": "3000000040011"
                     *      },
                     *      "$editable": true,
                     *      "$se_module": "Leads",
                     *      "Modified_By": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "$size": null,
                     *      "$voice_note": false,
                     *      "$status": null,
                     *      "id": "3000000040059",
                     *      "Created_By": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "Note_Title": null,
                     *      "Note_Content": "Notes2"
                     *    },
                     *    {
                     *      "Owner": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "Modified_Time": "2017-12-22T03:58:16+05:30",
                     *      "$attachments": null,
                     *      "Created_Time": "2017-12-22T03:58:16+05:30",
                     *      "Parent_Id": {
                     *        "name": "Peterson",
                     *        "id": "3000000040011"
                     *      },
                     *      "$editable": true,
                     *      "$se_module": "Leads",
                     *      "Modified_By": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "$size": null,
                     *      "$voice_note": false,
                     *      "$status": null,
                     *      "id": "3000000040055",
                     *      "Created_By": {
                     *        "name": "NareshTesting ",
                     *        "id": "3000000031045"
                     *      },
                     *      "Note_Title": null,
                     *      "Note_Content": "Notes1"
                     *    }
                     *  ],
                     *  "info": {
                     *    "per_page": 200,
                     *    "count": 2,
                     *    "page": 1,
                     *    "more_records": false
                     *  }
                     *}
                     */
                    getRelatedRecords: function(data) {
                        return getRelatedRecord(data);
                    },
                    /**
                     * @function updateRelatedRecords
                     * @description To update the relation between the records
                     * @param {object} config - Configuration Object
                     * @param {String} config.Entity - 	SysRefName of the module. 
                     * @param {String} config.RecordID - RecordID to associate the notes. 
                     * @param {String} config.RelatedListName - 	SysRefName of the relatedList. 
                     * @param {String} config.RelatedRecordID - 	Related Record ID
                     * @param {String} config.APIData - 	Data to be updated in the related record
                     * @return {Promise} Resolved user matching userID 
                     * @memberof ZOHO.CRM.API
                     * @example
                     *  var APIData = {
                     * 	Description:"Test description"
                     *  }
                     *  ZOHO.CRM.API.updateRelatedRecords({Entity:"Leads",RecordID:"1000000079113",RelatedList:"Campaigns",RelatedRecordID:"1000000080041",APIData:APIData})
                     *  .then(function(data){
                     *      console.log(data)
                     *  })
                     * //prints
                     *{
                     *  "data":[
                     *   {
                     *     "code": "SUCCESS",
                     *     "details": {
                     *       "id": 1000000080041
                     *     },
                     *     "message": "relation updated",
                     *     "status": "success"
                     *   }
                     * 	]
                     * }
                     */
                    updateRelatedRecords: function(data) {
                        var Entity = data.Entity;
                        var RecordID = data.RecordID;
                        var RelatedList = data.RelatedList;
                        var RelatedRecordID = data.RelatedRecordID;
                        var APIData = data.APIData;
                        return updateRelatedRecord(Entity, RecordID, RelatedList, RelatedRecordID, APIData);
                    },
                    /**
                     * @function delinkRelatedRecord
                     * @description To delink the relation between the records
                     * @param {object} config - Configuration Object
                     * @param {String} config.Entity - 	SysRefName of the module. 
                     * @param {String} config.RecordID - RecordID to associate the notes. 
                     * @param {String} config.RelatedListName - 	SysRefName of the relatedList. 
                     * @param {String} config.RelatedRecordID - 	Related Record ID
                     * @return {Promise} Resolved user matching userID 
                     * @memberof ZOHO.CRM.API
                     * @example
                     *  ZOHO.CRM.API.delinkRelatedRecord({Entity:"Leads",RecordID:"1000000079113",RelatedList:"Campaigns",RelatedRecordID:"1000000080041"})
                     *  .then(function(data){
                     *      console.log(data)
                     *  })
                     * //prints
                     *{
                     *  "data": [
                     *    {
                     *      "code": "SUCCESS",
                     *      "details": {
                     *        "id": "3000000040055"
                     *      },
                     *      "message": "record deleted",
                     *      "status": "success"
                     *    }
                     *  ]
                     *}
                     */
                    delinkRelatedRecord: function(data) {
                        var Entity = data.Entity;
                        var RecordID = data.RecordID;
                        var RelatedList = data.RelatedList;
                        var RelatedRecordID = data.RelatedRecordID;
                        return deleteRelatedRecord(Entity, RecordID, RelatedList, RelatedRecordID);
                    },
                    /**
                     * @function attachFile
                     * @description To delink the relation between the records
                     * @param {object} config - Configuration Object
                     * @param {String} config.Entity - 	SysRefName of the module. 
                     * @param {String} config.RecordID - RecordID to associate the notes.  
                     * @param {object} config.File - 	File Object
                     * @param {String} config.File.Name - 	File Name
                     * @param {object} config.File.Content - 	File Content
                     * @return {Promise} Resolved user Upload acknowledgement 
                     * @memberof ZOHO.CRM.API
                     * @example
                     * 
                     * ZOHO.CRM.API.attachFile({Entity:"Leads",RecordID:"1000000031092",File:{Name:"myFile.txt",Content:blob}}).then(function(data){
                     * 	console.log(data);
                     * });
                     * //prints
                     *{
                     *  "data": [
                     *    {
                     *      "code": "SUCCESS",
                     *      "details": {
                     *        "Modified_Time": "2017-12-20T14:22:30+05:30",
                     *        "Modified_By": {
                     *          "name": "NareshTesting",
                     *          "id": "1000000031157"
                     *        },
                     *        "Created_Time": "2017-12-20T14:22:30+05:30",
                     *        "id": "1000000044106",
                     *        "Created_By": {
                     *          "name": "NareshTesting",
                     *          "id": "1000000031157"
                     *        }
                     *      },
                     *      "message": "attachment uploaded successfully",
                     *      "status": "success"
                     *    }
                     *  ]
                     *}
                     * */
                    attachFile: function(data) {
                        var Entity = data.Entity;
                        var RecordID = data.RecordID;
                        var File = data.File;
                        var data = {
                            FileName: File.Name,
                            FileData: File.Content
                        }
                        return createRecord(Entity, data, RecordID, "ATTACHMENT");
                    },
                    /**
                     * @function getAllProfiles
                     * @memberof ZOHO.CRM.API
                     * @description To get all the profiles in the app
                     * @returns {Promise} Resolved with all the profiles present in the app
                     * @example
                     * ZOHO.CRM.API.getAllProfiles().then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     *  {
                     *    "profiles": [
                     *     {
                     *        "created_time": null,
                     *        "modified_time": null,
                     *        "name": "Administrator",
                     *        "modified_by": null,
                     *       "description": "This profile will have all the permissions. Users with Administrator profile will be able to view and manage all the data within the organization *. *        account by default.",
                     *        "id": "12000000029855",
                     *        "category": false,
                     *        "created_by": null
                     *      },
                     *      {
                     *        "created_time": null,
                     *        "modified_time": null,
                     *        "name": "Standard",
                     *        "modified_by": null,
                     *        "description": "This profile will have all the permissions except administrative privileges.",
                     *        "id": "12000000029858",
                     *        "category": false,
                     *        "created_by": null
                     *      },
                     *      {
                     *        "created_time": "2018-02-05T14:20:38+05:30",
                     *        "modified_time": "2018-02-05T17:44:58+05:30",
                     *        "name": "TestUser",
                     *        "modified_by": {
                     *          "name": "Arun ",
                     *          "id": "12000000032013"
                     *        },
                     *        "description": "TestUser API",
                     *        "id": "12000000033045",
                     *        "category": true,
                     *        "created_by": {
                     *          "name": "Arun ",
                     *          "id": "12000000032013"
                     *        }
                     *     }
                     *    ]
                     *  }
                     *
                     */
                    getAllProfiles: function(data) {

                        var category = "PROFILES";
                        var type = "GET_ALL_PROFILES";
                        return getAllProfiles(category, type)
                    },
                    /**
                     * @function getProfile
                     * @memberof ZOHO.CRM.API
                     * @description To get a particular profile's details with ProfileID as input
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.ID - ProfileID
                     * @returns {Promise} Resolved with the details of the profile for the given ProfileID
                     * @example
                     * ZOHO.CRM.API.getProfile({ID:"12000000029858"}).then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     * {
                     *	"profiles": [{
                     *		"created_time": null,
                     *		"modified_time": null,
                     *		"permissions_details": [{
                     *				"display_label": "Email Integration ( POP3 / IMAP )",
                     *				"module": null,
                     *				"name": "Crm_Implied_Zoho_Mail_Integ",
                     *				"id": "12000000030788",
                     *				"enabled": true
                     *			},
                     *			{
                     *				"display_label": "BCC Dropbox",
                     *				"module": null,
                     *				"name": "Crm_Implied_BCC_Dropbox",
                     *				"id": "12000000030752",
                     *				"enabled": true
                     *			},
                     *			{
                     *				"display_label": "Show Chat Bar",
                     *				"module": null,
                     *				"name": "Crm_Implied_Chat_Bar",
                     *				"id": "12000000030806",
                     *				"enabled": true
                     *			},
                     *			{
                     *				"display_label": null,
                     *				"module": null,
                     *				"name": "Crm_Implied_Social_Integration",
                     *				"id": "12000000030734",
                     *				"enabled": false
                     *			}
                     *		],
                     *		"name": "Standard",
                     *		"modified_by": null,
                     *		"description": "This profile will have all the permissions except administrative privileges.",
                     *		"id": "12000000029858",
                     *		"category": false,
                     *		"created_by": null,
                     *		"sections": [{
                     *			"name": "template",
                     *			"categories": [{
                     *					"display_label": "Email & Chat Settings",
                     *					"permissions_details": [
                     *						"12000000030788",
                     *						"12000000030752",
                     *						"12000000030806"
                     *					],
                     *					"name": "email_chat"
                     *				},
                     *				{
                     *					"display_label": "Manage Templates",
                     *					"permissions_details": [
                     *						"12000000029984",
                     *						"12000000029987",
                     *						"12000000030698"
                     *					],
                     *					"name": "template"
                     *				}
                     *			]
                     *		}]
                     *	}]
                     * }
                     *
                     */
                    getProfile: function(data) {

                        var category = "PROFILES";
                        var type = "GET_PROFILE";
                        var ID = data.ID;
                        return getProfile(category, type, ID);
                    },
                    /**
                     * @function updateProfile
                     * @memberof ZOHO.CRM.API
                     * @description To update permissions for the given ProfileID
                     * @param {Object} config - Configuration Object.
                     * @param {String} config.ID - ProfileID
                     * @param {Object} config.APIData - Permission Data (PermissionID : true | false)
                     * @returns {Promise} Resolved with a response message (Success or failure ) after updating the permissions
                     * @example
                     * var permissionData = {
                     *     "profiles": [
                     *		{
                     * 				"permissions_details": [
                     *				{
                     * 					"id": "12000000030827",
                     *					"enabled": false
                     *				},
                     *				{
                     *					"id": "12000000029879",
                     *					"enabled": true
                     * 				}
                     * 			]
                     *		}
                     *	]
                     *}
                     * ZOHO.CRM.API.updateProfile({ID:"12000000033045",APIData:permissionData}).then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     * {
                     *  "profiles": [
                     *    {
                     *      "code": "SUCCESS",
                     *      "details": {},
                     *      "message": "profile updated successfully",
                     *      "status": "success"
                     *    }
                     *  ]
                     * }
                     *
                     */
                    updateProfile: function(data) {

                        var category = "UPDATE";
                        var type = "PROFILE";
                        var ID = data.ID;
                        var APIData = data.APIData;
                        return updateProfile(category, type, ID, APIData);
                    },
                    /**
                     * @function getOrgVariable
                     * @memberof ZOHO.CRM.API
                     * @description get plugins configuration data
                     * @returns {Promise} Resolved with Plugin Configuration
                     * @example
                     * Example - 1:
                     * ZOHO.CRM.API.getOrgVariable("variableNamespace").then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     *{
                     *  "Success": {
                     *   "Content": "12345"
                     *  }
                     *}
                     *
                     *
                     *
                     *  Example - 2:
                     *
                     * var data = {apiKeys:["key1","key2","ke3"]};
                     * ZOHO.CRM.API.getOrgVariable(data).then(function(data){
                     *      console.log(data);
                     * });
                     *
                     *
                     *{
                     *"Success":
                     *{
                     *   "content": {
                     *      "apikey": {
                     *         "value": "BNMMNBVHJ"
                     *      },
                     *      "authtoken": {
                     *         "value": "IUYTRERTYUI"
                     *      },
                     *      "apiscret": {
                     *         "value": "848ksmduo389jd"
                     *      }
                     *   }
                     *}
                     *}
                     *
                     *
                     */
                    getOrgVariable: function(nameSpace) {
                        return config("VARIABLE", nameSpace);
                    },
                },
                /**
                 * @module ZOHO.CRM.UI
                 */
                UI: {
                    /**
                     * @namespace ZOHO.CRM.UI
                     */
                    /**
                     * @function Resize
                     * @description Resize Widget to the given dimensions
                     * @param {Object} dimensions - Dimension of Dialer.
                     * @param {Integer} dimensions.height - Height in px
                     * @param {Integer} dimensions.width - Width in px
                     * @returns {Promise} resolved with true | false
                     * @memberof ZOHO.CRM.UI
                     * @example
                     * ZOHO.CRM.UI.Resize({height:"200",width:"1000"}).then(function(data){
                     * 	console.log(data);
                     * });
                     * 
                     * //prints 
                     * True
                     *
                     */
                    Resize: function(data) {
                        var data = {
                            action: "RESIZE",
                            data: {
                                width: data.width,
                                height: data.height
                            }
                        };
                        return manipulateUI(data);
                    },
                    /**
                     * @namespace ZOHO.CRM.UI.Dialer
                     */
                    Dialer: {
                        /**
                         * @function maximize
                         * @description maximizes the CallCenter Window
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Dialer
                         */
                        maximize: function() {
                            var data = {
                                action: {
                                    telephony: "MAXIMIZE"
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function minimize
                         * @description minimize the CallCenter Window
                         * @returns {Promise}  resolved with true | false
                         * @memberof ZOHO.CRM.UI.Dialer
                         */
                        minimize: function() {
                            var data = {
                                action: {
                                    telephony: "MINIMIZE"
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function notify
                         * @description notify The user with an audible sound
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Dialer
                         */
                        notify: function() {
                            var data = {
                                action: {
                                    telephony: "NOTIFY"
                                }
                            };
                            return manipulateUI(data);
                        },
                    },
                    /**
                     * @namespace ZOHO.CRM.UI.Record
                     */
                    Record: {
                        /**
                         * @function open
                         * @description Open DetailPage of the specified Record
                         * @param {object} data - Configuration Object
                         * @param {String} data.Entity - 	SysRefName of the module. 
                         * @param {String} data.RecordID - RecordID to open  
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Record
                         * @example
                         * ZOHO.CRM.UI.Record.open({Entity:"Leads",RecordID:"1000000036062"})
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        open: function(data) {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    record: "OPEN"
                                },
                                data: {
                                    Entity: data.Entity,
                                    RecordID: data.RecordID,
                                    target:data.Target
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function edit
                         * @description open EditPage of the specified Record
                         * @param {object} data - Configuration Object
                         * @param {String} data.Entity - 	SysRefName of the module. 
                         * @param {String} data.RecordID - RecordID to open  
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Record
                         * @example
                         * ZOHO.CRM.UI.Record.edit({Entity:"Leads",RecordID:"1000000036062"})
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        edit: function(data) {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    record: "EDIT"
                                },
                                data: {
                                    Entity: data.Entity,
                                    RecordID: data.RecordID,
                                    target:data.Target
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function create
                         * @description Open CreatePage of the specified Record
                         * @param {object} data - Configuration Object
                         * @param {String} data.Entity - 	SysRefName of the module.   
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Record
                         * @example
                         * ZOHO.CRM.UI.Record.create({Entity:"Leads"})
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        create: function(data) {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    record: "CREATE"
                                },
                                data: {
                                    Entity: data.Entity,
                                    RecordID: data.RecordID,
                                    target:data.Target
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function populate
                         * @description Populate the given data in the entity form
                         * @param {object} RecordData 
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Record
                         * @example
                         * ZOHO.CRM.UI.Record.populate({Annual_Revenue:"500",Description:"Populating test data",Phone:"85663655785"})
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        populate: function(recordData) {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    record: "POPULATE"
                                },
                                data: recordData
                            };
                            return manipulateUI(data);
                        }
                    },
                    /**
                     * @namespace ZOHO.CRM.UI.Popup
                     */
                    Popup: {
                        /**
                         * @function close
                         * @description Close Widget Popup 
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Popup
                         * @example
                         * ZOHO.CRM.UI.Popup.close()
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        close: function() {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    popup: "CLOSE"
                                }
                            };
                            return manipulateUI(data);
                        },
                        /**
                         * @function closeReload
                         * @description Close Widget Popup and reload the View
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Popup
                         * @example
                         * ZOHO.CRM.UI.Popup.closeReload()
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        closeReload: function() {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                    popup: "CLOSE_RELOAD"
                                }
                            };
                            return manipulateUI(data);
                        },
                        refreshWidget(){
                            isInitTriggered = false
                            window.location.assign("https://127.0.0.1:5000/app/teste.html")
                        }
                    },
                    /**
                     * @namespace ZOHO.CRM.UI.Widget
                     */
                    Widget: {
                        /**
                         * @function open
                         * @description open a WebTab Widget with custom onLoad Data 
                         * @returns {Promise} resolved with true | false
                         * @memberof ZOHO.CRM.UI.Widget
                         * @example
                         * var message = {
                         * 		arg1:"Argument 1",
                         * 		arg2:"Argument 2",
                         * 		arg3Nested:{
                         * 				subArg1:"SubArgument 1",
                         * 				subArg2:"SubArgument 2",
                         * 				subArg3:"SubArgument 3",
                         * 			}
                         * }
                         * 
                         * ZOHO.CRM.UI.Widget.open({Entity:"WebTab1_Widget",Message:message})
                         * .then(function(data){
                         *     console.log(data)
                         * })
                         */
                        open: function(data) {
                            /*
                             * fetch TabName from sysrefName 
                             */
                            var data = {
                                action: {
                                	webTab: "OPEN"
                                },
                                data : data
                            };
                            return manipulateUI(data);
                        },
                    }

                },
                /**
                 * @namespace ZOHO.CRM.HTTP
                 */
                HTTP: {
                    /**
                     * @function get
                     * @description Invoke  HTTP get
                     * @returns {Promise} resolved with response of the initiated request
                     * @memberof ZOHO.CRM.HTTP
                     * @param {Object} request - Request Object
                     * @param {Object} request.params - Request Params
                     * @param {Object} request.headers - Request Headers
                     * @example

                     */
                    get: function(data) {
                        return remoteCall(HTTPRequest.GET, data);
                    },
                    /**
                     * @function post
                     * @description Invoke HTTP post
                     * @returns {Promise} resolved with response of the initiated request
                     * @memberof ZOHO.CRM.HTTP
                     * @param {Object} request - Request Object
                     * @param {Object} request.params - Request Params
                     * @param {Object} request.headers - Request Headers
                     * @param {Object} request.body - Request Body
                     * @example
                     */
                    post: function(data) {
                        return remoteCall(HTTPRequest.POST, data);
                    },
                    /**
                     * @function put
                     * @description Invoke HTTP put
                     * @returns {Promise} resolved with response of the initiated request
                     * @memberof ZOHO.CRM.HTTP
                     * @param {Object} request - Request Object
                     * @param {Object} request.params - Request Params
                     * @param {Object} request.headers - Request Headers
                     * @param {Object} request.body - Request Body
                     * @example
                     */
                    put: function(data) {
                        return remoteCall(HTTPRequest.PUT, data);
                    },
                    /**
                     * @function patch
                     * @description Invoke HTTP patch
                     * @returns {Promise} resolved with response of the initiated request
                     * @memberof ZOHO.CRM.HTTP
                     * @param {Object} request - Request Object
                     * @param {Object} request.params - Request Params
                     * @param {Object} request.headers - Request Headers
                     * @param {Object} request.body - Request Body
                     * @example
              
                     */
                    patch: function(data) {
                        return remoteCall(HTTPRequest.PATCH, data);
                    },
                    /**
                     * @function delete
                     * @description Invoke HTTP delete
                     * @returns {Promise} resolved with response of the initiated request
                     * @memberof ZOHO.CRM.HTTP
                     * @param {Object} request - Request Object
                     * @param {Object} request.params - Request Params
                     * @param {Object} request.headers - Request Headers
                     * @param {Object} request.body - Request Body
                     * @example                  
                     */
                    delete: function(data) {
                        return remoteCall(HTTPRequest.DELETE, data);
                    }
                },
                /**
                 * @namespace ZOHO.CRM.CONNECTOR
                 */
                CONNECTOR: {
                    /**
                     * @function invokeAPI
                     * @description Invokes Connector API 
                     * @returns {Promise} resolved with response of the Connector API
                     * @memberof ZOHO.CRM.CONNECTOR
                     * @param {String} nameSpace - NameSpace of Connector API to invoke
                     * @param {Object} data - Connector API Data
                     * @param {Object} data.VARIABLES - Dynamic Data represented by placeholders in connectorAPI
                     * @param {Object} data.CONTENT_TYPE - ContentType - multipart for multipart request
                     * @param {Array} data.PARTS - For multipart request provide parts config here
                     * @param {Object} data.FILE - To include a file in your multipart request 
                     * @example
                   
                     * @example
                     * @example
                    

                     */
                    invokeAPI: function(nameSpace, data) {
                        return remoteCall(nameSpace, data, "CONNECTOR_API");
                    },
                     /**
                     * @function authorize
                     * @description Prompts the Connector Authorize window  
                     * @returns {Promise} resolved with true on successful Authorization 
                     * @memberof ZOHO.CRM.CONNECTOR
                     * @param {String} nameSpace - NameSpace of Connector to authorize
                     * @example
                     * var connectorName = "zoho.authorize";
                     * ZOHO.CRM.CONNECTOR.authorize(connectorName);
                     *
                     */
                    authorize: function(nameSpace) {
                        return remoteCall(nameSpace, {}, "CONNECTOR_AUTHORIZE");
                    },
                    /*
                   
					 */
                },
                /**
                 * @namespace ZOHO.CRM.CONNECTION
                 */
                CONNECTION: {
                    /**
                     * @function invoke
                     * @description Invoke a Connection
                     * @returns {Promise} resolved with response of the connection made
                     * @memberof ZOHO.CRM.CONNECTION
                     * @param {String} conn_name - Connection Name
                     * @param {Object} req_data - Request Data
                     * @example
                   
                     */
                    invoke:function(conn_name, req_data){
                    var request = {};
                    var reqObj = {};
                    reqObj.url = req_data.url;
                    reqObj.method = req_data.method;
                    reqObj.param_type = req_data.param_type;
                    reqObj.parameters = JSON.stringify(req_data.parameters);
                    reqObj.headers = JSON.stringify(req_data.headers);
                    request.data = reqObj;
                    var data = {
                    category : "CRM_CONNECTION",//no i18n
                    connectionName:conn_name,
                    data : request
                    };
                    return newRequestPromise(data);
                    }
                },
                /**
                 * @namespace ZOHO.CRM.WIZARD
                 */
                WIZARD: {
                    /**
                     * @function post
                     * @description Send data to wizard
                     * @returns {Promise} resolved when the data is set to the record in wizard
                     * @memberof ZOHO.CRM.WIZARD
                     * @param {Object} record_data - Field data to be set to the record in wizard
                     * @example
                     * var record_data ={
                     *      "field_api_name1":"field_value",
                     *      "field_api_name2":"field_value"
                     * };
                     * ZOHO.CRM.WIZARD.post(record_data);
                     */
                  post: function(data) {
                    var data = {
                      category : "CRM_WIZARD",  //no i18n
                      data : JSON.stringify(data)
                    };
                    return newRequestPromise(data);
                  }
                },
                /**
                 * @namespace ZOHO.CRM.BLUEPRINT
                 */
                BLUEPRINT: {
                    /**
                     * @function proceed
                     * @description perform blueprint transition to move to next state.
                     * @returns {Promise} resolved when blueprint moved to next state
                     * @memberof ZOHO.CRM.BLUEPRINT
                     * @example
                     * ZOHO.CRM.BLUEPRINT.proceed();
                     */
                  proceed: function() {
                    var data = {
                      category : "CRM_BLUEPRINT"   //no i18n
                    };
                    return newRequestPromise(data);
                  }
                }
            };
        })()
    }
})();