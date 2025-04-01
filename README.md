// src/services/README.md - API服务实现参考

# API服务实现参考

本文档概述了RSS聚合器和AI摘要系统需要实现的所有API服务函数。每个服务函数对应后端应创建的特定端点。所有接口只使用GET和POST方法。

## 模板服务

```javascript
// src/services/template.js

/**
 * 获取所有模板
 * 
 * 入参:
 * - params: {
 *     keyword?: string      // 搜索关键词
 *     type?: number         // 模板类型
 *     status?: number       // 状态(0: 禁用, 1: 启用)
 *     page?: number         // 页码，默认1
 *     per_page?: number     // 每页数量，默认10
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     list: [
 *       {
 *         id: number,
 *         name: string,
 *         description: string,
 *         type: number,
 *         param_count: number,
 *         source_count: number,
 *         status: number,
 *         created_at: string,
 *         updated_at: string
 *       }
 *     ],
 *     total: number,
 *     page: number,
 *     per_page: number
 *   }
 * }
 */
export async function fetchTemplates(params = {}) {
  return request('/api/v1/templates', {
    method: 'GET',
    params
  });
}

/**
 * 获取模板详情
 * 
 * 入参:
 * - id: number             // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     type: number,
 *     script: string,
 *     parameters: Array<{
 *       name: string,
 *       description: string,
 *       required: boolean
 *     }>,
 *     status: number,
 *     created_at: string,
 *     updated_at: string
 *   }
 * }
 */
export async function fetchTemplateDetail(id) {
  return request(`/api/v1/templates/detail`, {
    method: 'GET',
    params: { id }
  });
}

/**
 * 创建新模板
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     description: string,
 *     type: number,
 *     script: string,
 *     parameters: Array<{
 *       name: string,
 *       description: string,
 *       required: boolean
 *     }>,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createTemplate(data) {
  return request('/api/v1/templates/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新现有模板
 * 
 * 入参:
 * - data: {
 *     id: number,          // 模板ID
 *     name: string,
 *     description: string,
 *     type: number,
 *     script: string,
 *     parameters: Array<{
 *       name: string,
 *       description: string,
 *       required: boolean
 *     }>,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function updateTemplate(id, data) {
  return request(`/api/v1/templates/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 更新模板状态
 * 
 * 入参:
 * - data: {
 *     template_id: number, // 模板ID
 *     status: number       // 状态(0: 禁用, 1: 启用)
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateTemplateStatus(data) {
  return request('/api/v1/templates/update_status', {
    method: 'POST',
    data
  });
}

/**
 * 获取模板脚本
 * 
 * 入参:
 * - id: number             // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number,
 *     name: string,
 *     script: string
 *   }
 * }
 */
export async function fetchTemplateScript(id) {
  return request(`/api/v1/templates/script`, {
    method: 'GET',
    params: { id }
  });
}

/**
 * 更新模板脚本
 * 
 * 入参:
 * - data: {
 *     id: number,         // 模板ID
 *     script: string      // 脚本内容
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateTemplateScript(id, data) {
  return request(`/api/v1/templates/update_script`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 测试模板脚本
 * 
 * 入参:
 * - formData: FormData     // 包含script, file和parameters字段的FormData
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     html_content: string,
 *     text_content: string,
 *     execution_time: number,
 *     memory_usage: number
 *   }
 * }
 */
export async function testTemplateScript(formData) {
  return request('/api/v1/templates/test_script', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取模板使用情况数据
 * 
 * 入参:
 * - id: number             // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     sources: Array<{
 *       id: number,
 *       name: string,
 *       url: string,
 *       status: number,
 *       created_at: string
 *     }>,
 *     stats: {
 *       source_count: number,
 *       article_count: number,
 *       success_rate: number,
 *       avg_processing_time: number
 *     }
 *   }
 * }
 */
export async function fetchTemplateUsage(id) {
  return request(`/api/v1/templates/usage`, {
    method: 'GET',
    params: { id }
  });
}
```

## 推荐服务

```javascript
// src/services/recommendation.js

/**
 * 获取推荐规则
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       factor: string,
 *       condition_type: string,
 *       condition: object,
 *       condition_expression: string,
 *       priority: number,
 *       weight: number,
 *       is_default: number,
 *       is_active: number,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
 */
export async function fetchRecommendationRules() {
  return request('/api/v1/recommendation/rules', {
    method: 'GET'
  });
}

/**
 * 创建推荐规则
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     description: string,
 *     factor: string,
 *     condition_type: string,
 *     condition?: object,
 *     condition_expression?: string,
 *     priority: number,
 *     weight: number,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createRecommendationRule(data) {
  return request('/api/v1/recommendation/rules/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新推荐规则
 * 
 * 入参:
 * - data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     factor: string,
 *     condition_type: string,
 *     condition?: object,
 *     condition_expression?: string,
 *     priority: number,
 *     weight: number,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateRecommendationRule(id, data) {
  return request(`/api/v1/recommendation/rules/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 删除推荐规则
 * 
 * 入参:
 * - id: number             // 规则ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function deleteRecommendationRule(id) {
  return request(`/api/v1/recommendation/rules/delete`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 重新排序推荐规则
 * 
 * 入参:
 * - data: {
 *     rules: Array<{
 *       id: number,
 *       priority: number
 *     }>
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function reorderRecommendationRules(data) {
  return request('/api/v1/recommendation/rules/reorder', {
    method: 'POST',
    data
  });
}

/**
 * 获取内容列表进行调整
 * 
 * 入参:
 * - params: {
 *     keyword?: string,     // 搜索关键词
 *     category?: number,    // 分类ID
 *     source?: number,      // 来源ID
 *     min_score?: number,   // 最小分数
 *     max_score?: number,   // 最大分数
 *     start_date?: string,  // 开始日期
 *     end_date?: string,    // 结束日期
 *     adjustment_type?: string, // 调整类型(all, adjusted, pinned, locked)
 *     page?: number,        // 页码，默认1
 *     per_page?: number     // 每页数量，默认10
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     items: [
 *       {
 *         id: number,
 *         title: string,
 *         content: string,
 *         source_id: number,
 *         source_name: string,
 *         category_id: number,
 *         category_name: string,
 *         original_score: number,
 *         score_adjustment: number,
 *         final_score: number,
 *         is_pinned: number,
 *         is_locked: number,
 *         published_date: string,
 *         created_at: string
 *       }
 *     ],
 *     total: number,
 *     page: number,
 *     per_page: number
 *   }
 * }
 */
export async function fetchContentList(params = {}) {
  return request('/api/v1/recommendation/content', {
    method: 'GET',
    params
  });
}

/**
 * 调整内容分数
 * 
 * 入参:
 * - data: {
 *     id: number,          // 内容ID
 *     score_adjustment: number // 分数调整
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     final_score: number
 *   }
 * }
 */
export async function adjustContentScore(id, data) {
  return request(`/api/v1/recommendation/content/adjust_score`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 固定内容
 * 
 * 入参:
 * - id: number            // 内容ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function pinContent(id) {
  return request(`/api/v1/recommendation/content/pin`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 取消固定内容
 * 
 * 入参:
 * - id: number            // 内容ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function unpinContent(id) {
  return request(`/api/v1/recommendation/content/unpin`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 锁定内容
 * 
 * 入参:
 * - id: number            // 内容ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function lockContent(id) {
  return request(`/api/v1/recommendation/content/lock`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 解锁内容
 * 
 * 入参:
 * - id: number           // 内容ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function unlockContent(id) {
  return request(`/api/v1/recommendation/content/unlock`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 批量调整内容
 * 
 * 入参:
 * - data: {
 *     content_ids: Array<number>, // 内容ID数组
 *     adjustment_type: string,    // 调整类型(score, pin, lock)
 *     adjustment_value: number|boolean // 调整值
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     success_count: number
 *   }
 * }
 */
export async function bulkAdjustContent(data) {
  return request('/api/v1/recommendation/content/bulk_adjust', {
    method: 'POST',
    data
  });
}
```

## AI服务

```javascript
// src/services/ai.js

/**
 * 获取AI模型
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       provider: string,
 *       model_key: string,
 *       api_endpoint: string,
 *       supports_streaming: number,
 *       max_tokens: number,
 *       temperature: number,
 *       top_p: number,
 *       system_prompt: string,
 *       description: string,
 *       status: number,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
 */
export async function fetchAIModels() {
  return request('/api/v1/ai/models', {
    method: 'GET'
  });
}

/**
 * 创建AI模型
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     provider: string,
 *     model_key: string,
 *     api_endpoint: string,
 *     api_key: string,
 *     supports_streaming: number,
 *     max_tokens: number,
 *     temperature: number,
 *     top_p: number,
 *     system_prompt: string,
 *     description: string,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createAIModel(data) {
  return request('/api/v1/ai/models/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新AI模型
 * 
 * 入参:
 * - data: {
 *     id: number,
 *     name: string,
 *     provider: string,
 *     model_key: string,
 *     api_endpoint: string,
 *     api_key?: string,     // 如果不更改可选
 *     supports_streaming: number,
 *     max_tokens: number,
 *     temperature: number,
 *     top_p: number,
 *     system_prompt: string,
 *     description: string,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateAIModel(id, data) {
  return request(`/api/v1/ai/models/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 删除AI模型
 * 
 * 入参:
 * - id: number           // 模型ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function deleteAIModel(id) {
  return request(`/api/v1/ai/models/delete`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 获取内容类型
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       model_id: number,
 *       model_name: string,
 *       summarization_strategy: string,
 *       max_summary_length: number,
 *       include_images: number,
 *       include_links: number,
 *       custom_prompt: string
 *     }
 *   ]
 * }
 */
export async function fetchContentTypes() {
  return request('/api/v1/ai/content-types', {
    method: 'GET'
  });
}

/**
 * 更新内容类型模型映射
 * 
 * 入参:
 * - data: {
 *     content_type_id: number,
 *     model_id: number,
 *     summarization_strategy: string,
 *     max_summary_length: number,
 *     include_images: number,
 *     include_links: number,
 *     custom_prompt: string
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateContentTypeModelMapping(id, data) {
  return request(`/api/v1/ai/content-types/update_mapping`, {
    method: 'POST',
    data: { content_type_id: id, ...data }
  });
}

/**
 * 获取摘要模板
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       content_type_id: number,
 *       content_type_name: string,
 *       template_content: string,
 *       css_styles: string,
 *       show_original_link: number,
 *       show_created_time: number,
 *       show_content_type: number,
 *       is_default: number,
 *       status: number,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
 */
export async function fetchSummaryTemplates() {
  return request('/api/v1/ai/templates', {
    method: 'GET'
  });
}

/**
 * 创建摘要模板
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     description: string,
 *     content_type_id: number,
 *     template_content: string,
 *     css_styles: string,
 *     show_original_link: number,
 *     show_created_time: number,
 *     show_content_type: number,
 *     is_default: number,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createSummaryTemplate(data) {
  return request('/api/v1/ai/templates/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新摘要模板
 * 
 * 入参:
 * - data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     content_type_id: number,
 *     template_content: string,
 *     css_styles: string,
 *     show_original_link: number,
 *     show_created_time: number,
 *     show_content_type: number,
 *     is_default: number,
 *     status: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateSummaryTemplate(id, data) {
  return request(`/api/v1/ai/templates/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 删除摘要模板
 * 
 * 入参:
 * - id: number          // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function deleteSummaryTemplate(id) {
  return request(`/api/v1/ai/templates/delete`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 测试摘要模板
 * 
 * 入参:
 * - id: number          // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     rendered_content: string,
 *     sample_data: {
 *       title: string,
 *       summary: string,
 *       source: string,
 *       url: string,
 *       created_at: string
 *     }
 *   }
 * }
 */
export async function testSummaryTemplate(id) {
  return request(`/api/v1/ai/templates/test`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 获取用户反馈
 * 
 * 入参:
 * - templateId: number   // 模板ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     overview: {
 *       total_summaries: number,
 *       positive_feedback: number,
 *       negative_feedback: number,
 *       average_rating: number
 *     },
 *     details: [
 *       {
 *         id: number,
 *         user_id: number,
 *         rating: number,
 *         comment: string,
 *         created_at: string
 *       }
 *     ]
 *   }
 * }
 */
export async function fetchUserFeedback(templateId) {
  return request(`/api/v1/ai/feedback`, {
    method: 'GET',
    params: { template_id: templateId }
  });
}

/**
 * 获取反馈分析数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string,  // 开始日期
 *     end_date?: string,    // 结束日期
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     summary: {
 *       total_feedback: number,
 *       positive_count: number,
 *       negative_count: number,
 *       neutral_count: number,
 *       average_rating: number
 *     },
 *     by_template: Array<{
 *       template_id: number,
 *       template_name: string,
 *       feedback_count: number,
 *       average_rating: number
 *     }>,
 *     by_date: Array<{
 *       date: string,
 *       total_count: number,
 *       positive_count: number,
 *       negative_count: number,
 *       neutral_count: number
 *     }>,
 *     common_terms: {
 *       positive: Array<{term: string, count: number}>,
 *       negative: Array<{term: string, count: number}>
 *     },
 *     improvements: Array<{
 *       title: string,
 *       description: string,
 *       priority: string
 *     }>
 *   }
 * }
 */
export async function fetchFeedbackAnalytics(params = {}) {
  return request('/api/v1/ai/feedback/analytics', {
    method: 'GET',
    params
  });
}
/**
 * 获取反馈详情
 * 
 * 入参:
 * - params: {
 *     page?: number,        // 页码，默认1
 *     per_page?: number,    // 每页数量，默认10
 *     start_date?: string,  // 开始日期
 *     end_date?: string,    // 结束日期
 *     keyword?: string,     // 关键词搜索
 *     template_id?: number, // 模板ID
 *     rating?: number,      // 评分
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     items: [
 *       {
 *         id: number,
 *         user_id: number,
 *         template_id: number,
 *         template_name: string,
 *         content_type_name: string,
 *         article_id: number,
 *         rating: number,
 *         sentiment: string,
 *         comment: string,
 *         created_at: string
 *       }
 *     ],
 *     total: number,
 *     page: number,
 *     per_page: number
 *   }
 * }
 */
export async function fetchFeedbackDetails(params = {}) {
  return request('/api/v1/ai/feedback/details', {
    method: 'GET',
    params
  });
}

/**
 * 导出反馈数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string,  // 开始日期
 *     end_date?: string,    // 结束日期
 *     template_id?: number, // 模板ID
 *   }
 * 
 * 出参:
 * Blob对象（文件下载）
 */
export async function exportFeedbackData(params = {}) {
  return request('/api/v1/ai/feedback/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  });
}
```

## 任务服务

```javascript
// src/services/tasks.js

/**
 * 获取计划任务
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       task_type: string,
 *       group_id: number,
 *       group_name: string,
 *       frequency: string,
 *       run_at: string,
 *       weekdays: string,
 *       day_of_month: string,
 *       sources: string,
 *       status: string,
 *       is_running: number,
 *       last_run: string,
 *       next_run: string,
 *       is_active: number,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
 */
export async function fetchScheduledTasks() {
  return request('/api/v1/tasks/scheduled', {
    method: 'GET'
  });
}

/**
 * 创建计划任务
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     description: string,
 *     task_type: string,
 *     group_id: number,
 *     frequency: string,
 *     run_at: string,
 *     weekdays: string,
 *     day_of_month: string,
 *     sources: string,
 *     parameters: string,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createScheduledTask(data) {
  return request('/api/v1/tasks/scheduled/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新计划任务
 * 
 * 入参:
 * - data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     task_type: string,
 *     group_id: number,
 *     frequency: string,
 *     run_at: string,
 *     weekdays: string,
 *     day_of_month: string,
 *     sources: string,
 *     parameters: string,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateScheduledTask(id, data) {
  return request(`/api/v1/tasks/scheduled/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 删除计划任务
 * 
 * 入参:
 * - id: number          // 任务ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function deleteScheduledTask(id) {
  return request(`/api/v1/tasks/scheduled/delete`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 手动运行任务
 * 
 * 入参:
 * - id: number          // 任务ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     execution_id: number
 *   }
 * }
 */
export async function runTaskManually(id) {
  return request(`/api/v1/tasks/scheduled/run`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 获取任务组
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       task_count: number
 *     }
 *   ]
 * }
 */
export async function fetchTaskGroups() {
  return request('/api/v1/tasks/groups', {
    method: 'GET'
  });
}

/**
 * 获取任务历史
 * 
 * 入参:
 * - params: {
 *     task_id: number,     // 任务ID
 *     page?: number,       // 页码，默认1
 *     per_page?: number    // 每页数量，默认10
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       task_id: number,
 *       task_name: string,
 *       start_time: string,
 *       end_time: string,
 *       status: string,
 *       items_processed: number,
 *       error: string
 *     }
 *   ]
 * }
 */
export async function fetchTaskHistory(taskId) {
  return request(`/api/v1/tasks/history`, {
    method: 'GET',
    params: { task_id: taskId }
  });
}

/**
 * 获取任务统计数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     task_type?: string   // 任务类型
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     overall: {
 *       total_tasks: number,
 *       active_tasks: number,
 *       successful_tasks: number,
 *       failed_tasks: number,
 *       success_rate: number,
 *       avg_duration: number
 *     },
 *     by_date: Array<{
 *       date: string,
 *       total_count: number,
 *       success_count: number,
 *       failed_count: number
 *     }>,
 *     by_type: Array<{
 *       task_type: string,
 *       total_count: number,
 *       success_count: number,
 *       failed_count: number
 *     }>
 *   }
 * }
 */
export async function fetchTasksStats(params = {}) {
  return request('/api/v1/tasks/stats', {
    method: 'GET',
    params
  });
}

/**
 * 获取活跃运行任务
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       task_id: number,
 *       task_name: string,
 *       task_type: string,
 *       start_time: string,
 *       progress: number,
 *       items_processed: number,
 *       total_items: number
 *     }
 *   ]
 * }
 */
export async function fetchActiveRuns() {
  return request('/api/v1/tasks/runs/active', {
    method: 'GET'
  });
}

/**
 * 获取最近任务
 * 
 * 入参:
 * - params: {
 *     limit?: number,      // 限制数量，默认10
 *     task_type?: string   // 任务类型
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       task_id: number,
 *       task_name: string,
 *       task_type: string,
 *       start_time: string,
 *       end_time: string,
 *       status: string,
 *       duration: number,
 *       items_processed: number,
 *       error: string
 *     }
 *   ]
 * }
 */
export async function fetchRecentTasks(params = {}) {
  return request('/api/v1/tasks/recent', {
    method: 'GET',
    params
  });
}

/**
 * 获取任务性能数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     task_type?: string   // 任务类型
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     task_durations: Array<{
 *       task_type: string,
 *       avg_duration: number,
 *       max_duration: number,
 *       executions: number,
 *       success_rate: number,
 *       items_processed: number
 *     }>,
 *     hourly_distribution: Array<{
 *       hour: number,
 *       count: number
 *     }>,
 *     items_processed: Array<{
 *       task_type: string,
 *       count: number
 *     }>
 *   }
 * }
 */
export async function fetchTasksPerformance(params = {}) {
  return request('/api/v1/tasks/performance', {
    method: 'GET',
    params
  });
}

/**
 * 导出任务报告
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     task_type?: string   // 任务类型
 *   }
 * 
 * 出参:
 * Blob对象（文件下载）
 */
export async function exportTasksReport(params = {}) {
  return request('/api/v1/tasks/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  });
}
```

## 统计服务

```javascript
// src/services/statistics.js

/**
 * 获取爬取统计数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     category_id?: number // 分类ID
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     overall: {
 *       total_crawls: number,
 *       success_rate: number,
 *       articles_crawled: number,
 *       avg_crawl_time: number,
 *       success_count: number,
 *       failed_count: number
 *     },
 *     by_date: Array<{
 *       date: string,
 *       total_count: number,
 *       success_count: number,
 *       failed_count: number,
 *       articles_count: number
 *     }>,
 *     by_source: Array<{
 *       source_id: number,
 *       source_name: string,
 *       count: number,
 *       success_rate: number,
 *       avg_time: number,
 *       articles_count: number
 *     }>,
 *     by_content_type: Array<{
 *       content_type_id: number,
 *       content_type_name: string,
 *       count: number,
 *       success_rate: number,
 *       avg_time: number,
 *       articles_count: number
 *     }>
 *   }
 * }
 */
export async function fetchCrawlStats(params = {}) {
  return request('/api/v1/statistics/crawl', {
    method: 'GET',
    params
  });
}

/**
 * 获取订阅统计数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     category_id?: number // 分类ID
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     overall: {
 *       total_subscriptions: number,
 *       active_subscriptions: number,
 *       new_subscriptions: number,
 *       churn_rate: number
 *     },
 *     by_date: Array<{
 *       date: string,
 *       total_count: number,
 *       new_count: number,
 *       canceled_count: number
 *     }>,
 *     by_source: Array<{
 *       source_id: number,
 *       source_name: string,
 *       count: number,
 *       active_percentage: number,
 *       new_count: number,
 *       trend: number
 *     }>,
 *     by_category: Array<{
 *       category_id: number,
 *       category_name: string,
 *       count: number,
 *       growth_rate: number,
 *       active_percentage: number,
 *       churn_rate: number
 *     }>
 *   }
 * }
 */
export async function fetchSubscriptionStats(params = {}) {
  return request('/api/v1/statistics/subscriptions', {
    method: 'GET',
    params
  });
}

/**
 * 获取源统计数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     category_id?: number // 分类ID
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     overall: {
 *       total_sources: number,
 *       active_sources: number,
 *       avg_articles_per_day: number,
 *       avg_quality_score: number
 *     },
 *     by_date: Array<{
 *       date: string,
 *       active_sources: number,
 *       articles_count: number,
 *       avg_quality_score: number
 *     }>,
 *     by_category: Array<{
 *       category_id: number,
 *       category_name: string,
 *       count: number,
 *       articles_count: number,
 *       avg_quality_score: number
 *     }>,
 *     source_rankings: Array<{
 *       source_id: number,
 *       source_name: string,
 *       category_id: number,
 *       category_name: string,
 *       activity_score: number,
 *       quality_score: number,
 *       articles_per_day: number,
 *       subscriber_count: number,
 *       status: string,
 *       last_update: string
 *     }>
 *   }
 * }
 */
export async function fetchSourceStats(params = {}) {
  return request('/api/v1/statistics/sources', {
    method: 'GET',
    params
  });
}

/**
 * 导出统计数据
 * 
 * 入参:
 * - params: {
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     category_id?: number, // 分类ID
 *     tab?: string         // 导出的标签页(crawl, subscriptions, sources)
 *   }
 * 
 * 出参:
 * Blob对象（文件下载）
 */
export async function exportStatisticsData(params = {}) {
  return request('/api/v1/statistics/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  });
}
```

## 系统服务

```javascript
// src/services/system.js

/**
 * 获取系统日志
 * 
 * 入参:
 * - params: {
 *     keyword?: string,     // 搜索关键词
 *     level?: string,       // 日志级别(error, warning, info, debug)
 *     start_date?: string,  // 开始日期时间
 *     end_date?: string,    // 结束日期时间
 *     component?: string,   // 组件名称
 *     page?: number,        // 页码，默认1
 *     per_page?: number     // 每页数量，默认20
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       level: string,
 *       component: string,
 *       message: string,
 *       request_id: string,
 *       source_ip: string,
 *       username: string,
 *       user_agent: string,
 *       stack_trace: string,
 *       additional_data: object,
 *       timestamp: string
 *     }
 *   ]
 * }
 */
export async function fetchSystemLogs(params = {}) {
  return request('/api/v1/system/logs', {
    method: 'GET',
    params
  });
}

/**
 * 导出日志
 * 
 * 入参:
 * - params: {
 *     keyword?: string,     // 搜索关键词
 *     level?: string,       // 日志级别
 *     start_date?: string,  // 开始日期时间
 *     end_date?: string,    // 结束日期时间
 *     component?: string    // 组件名称
 *   }
 * 
 * 出参:
 * Blob对象（文件下载）
 */
export async function exportLogs(params = {}) {
  return request('/api/v1/system/logs/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取告警规则
 * 
 * 入参:
 * - 无
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       condition_type: string,
 *       log_level: string,
 *       keyword: string,
 *       component: string,
 *       threshold: number,
 *       time_window: number,
 *       notification_channels: string,
 *       email_addresses: string,
 *       phone_numbers: string,
 *       webhook_url: string,
 *       is_active: number,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
 */
export async function fetchAlertRules() {
  return request('/api/v1/system/alerts/rules', {
    method: 'GET'
  });
}

/**
 * 创建告警规则
 * 
 * 入参:
 * - data: {
 *     name: string,
 *     description: string,
 *     condition_type: string,
 *     log_level: string,
 *     keyword: string,
 *     component: string,
 *     threshold: number,
 *     time_window: number,
 *     notification_channels: string,
 *     email_addresses: string,
 *     phone_numbers: string,
 *     webhook_url: string,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     id: number
 *   }
 * }
 */
export async function createAlertRule(data) {
  return request('/api/v1/system/alerts/rules/create', {
    method: 'POST',
    data
  });
}

/**
 * 更新告警规则
 * 
 * 入参:
 * - data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     condition_type: string,
 *     log_level: string,
 *     keyword: string,
 *     component: string,
 *     threshold: number,
 *     time_window: number,
 *     notification_channels: string,
 *     email_addresses: string,
 *     phone_numbers: string,
 *     webhook_url: string,
 *     is_active: number
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function updateAlertRule(id, data) {
  return request(`/api/v1/system/alerts/rules/update`, {
    method: 'POST',
    data: { id, ...data }
  });
}

/**
 * 删除告警规则
 * 
 * 入参:
 * - id: number            // 规则ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: null
 * }
 */
export async function deleteAlertRule(id) {
  return request(`/api/v1/system/alerts/rules/delete`, {
    method: 'POST',
    data: { id }
  });
}

/**
 * 获取告警历史
 * 
 * 入参:
 * - params: {
 *     page?: number,       // 页码，默认1
 *     per_page?: number,   // 每页数量，默认10
 *     start_date?: string, // 开始日期
 *     end_date?: string,   // 结束日期
 *     status?: string      // 状态(sent, failed, pending)
 *   }
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: [
 *     {
 *       id: number,
 *       rule_id: number,
 *       rule_name: string,
 *       level: string,
 *       message: string,
 *       content: string,
 *       recipients: string,
 *       triggered_at: string,
 *       status: string,
 *       error_message: string
 *     }
 *   ]
 * }
 */
export async function fetchAlertHistory(params = {}) {
  return request('/api/v1/system/alerts/history', {
    method: 'GET',
    params
  });
}

/**
 * 测试告警规则
 * 
 * 入参:
 * - id: number            // 规则ID
 * 
 * 出参:
 * {
 *   code: 200,
 *   message: "OK",
 *   data: {
 *     success: boolean,
 *     message: string,
 *     matches: Array<{
 *       id: number,
 *       level: string,
 *       message: string,
 *       timestamp: string
 *     }>,
 *     notification: {
 *       subject: string,
 *       recipients: string,
 *       body: string
 *     }
 *   }
 * }
 */
export async function testAlertRule(id) {
  return request(`/api/v1/system/alerts/rules/test`, {
    method: 'POST',
    data: { id }
  });
}
```

## 实现注意事项

1. 所有API端点应返回一致的响应格式：

   ```json
   {
     "code": 200,       // HTTP状态码
     "message": "OK",   // 响应消息
     "data": {}         // 响应数据
   }
   ```

2. 错误响应应遵循相同的格式，并使用适当的状态码和错误消息。

3. 对于返回分页数据的端点，在响应中包含分页元数据：

   ```json
   {
     "code": 200,
     "message": "OK",
     "data": {
       "list": [],      // 项目数组
       "total": 0,      // 总项目数
       "page": 1,       // 当前页码
       "per_page": 10   // 每页项目数
     }
   }
   ```

4. 认证和授权应由后端中间件处理。

5. 对于文件上传（如`testTemplateScript`），使用multipart/form-data并确保正确处理文件。

6. 对于文件下载（如`exportLogs`），设置适当的Content-Disposition头，以便浏览器下载文件。
