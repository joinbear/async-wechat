
class Approval {
  constructor(wechat, appName) {
    this.wechat = wechat;
    this.appName = appName;
    this.handleGetRequest = this.handleGetRequest.bind(this);
    this.handlePostRequest = this.handlePostRequest.bind(this);
    // full request url is made of wxHost + requestMethod + methodParams + token
    this.requestMethods = {
      corpDet: 'corp/getopenapprovaldata', // 根据编号获取应用自定义详情
      approvalinfo: 'oa/getapprovalinfo', //  批量获取审批单号
      approvaldetail: 'oa/getapprovaldetail', // 获取审批申请详情
      applyevent: 'oa/applyevent', // 提交审批申请
      templatedetail: 'oa/gettemplatedetail', // 提交审批申请
    }
  }
  /**
   * @param {*} params
   * 
   * {
      "creator_userid": "WangXiaoMing",
      "template_id": "3Tka1eD6v6JfzhDMqPd3aMkFdxqtJMc2ZRioeFXkaaa",
      "use_template_approver":0,
      "approver": [
          {
              "attr": 2,
              "userid": ["WuJunJie","WangXiaoMing"]
          },
          {
              "attr": 1,
              "userid": ["LiuXiaoGang"]
          }
      ],
      "notifyer":[ "WuJunJie","WangXiaoMing" ],
      "notify_type" : 1,
      "apply_data": {
          "contents": [
                  {
                      "control": "Text",
                      "id": "Text-15111111111",
                      "value": {
                          "text": "文本填写的内容"
                      }
                  }
              ]
      },
      "summary_list": [
          {
              "summary_info": [{
                  "text": "摘要第1行",
                  "lang": "zh_CN"
              }]
          },
          {
              "summary_info": [{
                  "text": "摘要第2行",
                  "lang": "zh_CN"
              }]
          },
          {
              "summary_info": [{
                  "text": "摘要第3行",
                  "lang": "zh_CN"
              }]
          }
        ]
    }
    参数	必须	说明
    access_token	是	调用接口凭证。必须使用审批应用或企业内自建应用的secret获取，获取方式参考：文档-获取access_token
    creator_userid	是	申请人userid，此审批申请将以此员工身份提交，申请人需在应用可见范围内
    template_id	是	模板id。可在“获取审批申请详情”、“审批状态变化回调通知”中获得，也可在审批模板的模板编辑页面链接中获得。暂不支持通过接口提交[打卡补卡][调班]模板审批单。
    use_template_approver	是	审批人模式：0-通过接口指定审批人、抄送人（此时approver、notifyer等参数可用）; 1-使用此模板在管理后台设置的审批流程，支持条件审批。默认为0
    approver	是	审批流程信息，用于指定审批申请的审批流程，支持单人审批、多人会签、多人或签，可能有多个审批节点，仅use_template_approver为0时生效。
    └ userid	是	审批节点审批人userid列表，若为多人会签、多人或签，需填写每个人的userid
    └ attr	是	节点审批方式：1-或签；2-会签，仅在节点为多人审批时有效
    notifyer	否	抄送人节点userid列表，仅use_template_approver为0时生效。
    notify_type	否	抄送方式：1-提单时抄送（默认值）； 2-单据通过后抄送；3-提单和单据通过后抄送。仅use_template_approver为0时生效。
    apply_data	是	审批申请数据，可定义审批申请中各个控件的值，其中必填项必须有值，选填项可为空，数据结构同“获取审批申请详情”接口返回值中同名参数“apply_data”
    └ contents	是	审批申请详情，由多个表单控件及其内容组成，其中包含需要对控件赋值的信息
    └ └ control	是	控件类型：Text-文本；Textarea-多行文本；Number-数字；Money-金额；Date-日期/日期+时间；Selector-单选/多选；；Contact-成员/部门；Tips-说明文字；File-附件；Table-明细；
    └ └ id	是	控件id：控件的唯一id，可通过“获取审批模板详情”接口获取
    └ └ value	是	控件值 ，需在此为申请人在各个控件中填写内容不同控件有不同的赋值参数，具体说明详见附录。模板配置的控件属性为必填时，对应value值需要有值。
    summary_list	是	摘要信息，用于显示在审批通知卡片、审批列表的摘要信息，最多3行
    └ summary_info	是	摘要行信息，用于定义某一行摘要显示的内容
    └ └ text	是	摘要行显示文字，用于记录列表和消息通知的显示，不要超过20个字符
    └ └ lang	是	摘要行显示语言
    接口频率限制 600次/分钟
    当模板的控件为必填属性时，表单中对应的控件必须有值。
   */
  async applyevent(params) {
    return await this.handlePostRequest('applyevent', params);
  }
  /**
   * @param {*} params
   * {
      "sp_no" : 201909270001
   * }
   */
  async getapprovaldetail(params) {
    return await this.handlePostRequest('approvaldetail', params);
  }
  /**
   * 
   * @param {*} params 
   *  {
        "thirdNo": "201806010001"
      }
   */
  async getopenapprovaldata(params) {
    return await this.handlePostRequest('corpDet', params);
  }
  /**
   * @param {*} params
   *  {
        "template_id" : "ZLqk8pcsAoXZ1eYa6vpAgfX28MPdYU3ayMaSPHaaa"
      }
   */
  async gettemplatedetail(params) {
    return await this.handlePostRequest('templatedetail', params);
  }
  /**
   * 
   * @param {*} params 
   * demo:
   * {
      "starttime" : "1569546000",
      "endtime" : "1569718800",
      "cursor" : 0 ,
      "size" : 100 ,
      "filters" : [
          {
              "key": "template_id",
              "value": "ZLqk8pcsAoaXZ1eY56vpAgfX28MPdYU3ayMaSPHaaa"
          },
          {
              "key" : "creator",
              "value" : "WuJunJie"
          },
          {
              "key" : "department",
              "value" : "1688852032415111"
          },
          {
              "key" : "sp_status",
              "value" : "1"
          }
        ]
      }
      参数	必须	说明
      access_token	是	调用接口凭证。必须使用审批应用或企业内自建应用的secret获取，获取方式参考：文档-获取access_token
      starttime	是	审批单提交的时间范围，开始时间，UNix时间戳
      endtime	是	审批单提交的时间范围，结束时间，Unix时间戳
      cursor	是	分页查询游标，默认为0，后续使用返回的next_cursor进行分页拉取
      size	是	一次请求拉取审批单数量，默认值为100，上限值为100
      filters	否	筛选条件，可对批量拉取的审批申请设置约束条件，支持设置多个条件
      └ key	否	筛选类型，包括：
      template_id - 模板类型/模板id；
      creator - 申请人；
      department - 审批单提单者所在部门；
      sp_status - 审批状态。
      注意:
      仅“部门”支持同时配置多个筛选条件。
      不同类型的筛选条件之间为“与”的关系，同类型筛选条件之间为“或”的关系
      └ value	否	筛选值，对应为：template_id-模板id；creator-申请人userid ；department-所在部门id；sp_status-审批单状态（1-审批中；2-已通过；3-已驳回；4-已撤销；6-通过后撤销；7-已删除；10-已支付）
      1 接口频率限制 600次/分钟
      2 请求的参数endtime需要大于startime， 起始时间跨度不能超过31天；
   */
  async getapprovalinfo(params) {
    return await this.handlePostRequest('approvalinfo', params);
  }
	/**
	 * [handleGetRequest get方式获取信息]
	 * @param  {[type]} method [请求接口]
	 * @param  {[type]} param  [请求query参数]
	 * @return {[type]}        [description]
	 */
  async handleGetRequest(method, param = '') {
    const { requestMethods, appName, wechat } = this;
    return await wechat.handleGetRequest(appName, requestMethods[method] + param);
  }
	/**
	 * [handlePostRequest post发送数据]
	 * @param  {[type]} method   [请求接口]
	 * @param  {[type]} postData [需要post的数据]
	 * @return {[type]}          [description]
	 */
  async handlePostRequest(method, postData) {
    const { requestMethods, appName, wechat } = this;
    return await wechat.handlePostRequest(appName, requestMethods[method], postData);
  }
}

module.exports = function (appName) {
  return new Approval(this, appName);
};