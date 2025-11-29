import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

// 响应数据类型定义
interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId()
    
    // 添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { data, config } = response
    
    // 处理文件下载等特殊响应
    if (config.responseType === 'blob') {
      return response
    }
    
    // 统一处理业务响应
    if (data.code === 200) {
      return data.data
    }
    
    // 业务错误处理
    handleBusinessError(data.code, data.message)
    return Promise.reject(new Error(data.message || '业务错误'))
  },
  (error) => {
    // 网络错误处理
    handleNetworkError(error)
    return Promise.reject(error)
  }
)

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 处理业务错误
 */
function handleBusinessError(code: number, message: string): void {
  const errorMap: Record<number, string> = {
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    503: '服务不可用'
  }
  
  const defaultMessage = errorMap[code] || message || '未知错误'
  
  switch (code) {
    case 401:
      // 未授权，清除token并跳转到登录页
      const userStore = useUserStore()
      userStore.logout()
      ElMessage.error(defaultMessage)
      // TODO: 跳转到登录页
      break
      
    case 403:
      ElMessage.warning(defaultMessage)
      break
      
    case 404:
      ElMessage.warning(defaultMessage)
      break
      
    case 500:
      ElMessage.error(defaultMessage)
      break
      
    default:
      // 业务错误码处理 (10000-19999)
      if (code >= 10000 && code < 20000) {
        ElMessage.warning(message || '操作失败')
      } else {
        ElMessage.error(defaultMessage)
      }
      break
  }
}

/**
 * 处理网络错误
 */
function handleNetworkError(error: any): void {
  if (axios.isCancel(error)) {
    console.log('请求被取消:', error.message)
    return
  }
  
  if (!error.response) {
    // 网络错误
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('网络异常，请稍后重试')
    }
    return
  }
  
  const status = error.response.status
  const message = error.response.data?.message || error.message
  
  handleBusinessError(status, message)
}

/**
 * 通用请求方法
 */
export default async function<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await request(config)
    return response
  } catch (error) {
    // 错误已经在拦截器中处理过，这里直接reject
    throw error
  }
}

/**
 * GET请求
 */
export async function get<T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return request({
    url,
    method: 'GET',
    params,
    ...config
  })
}

/**
 * POST请求
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return request({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT请求
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return request({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE请求
 */
export async function del<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return request({
    url,
    method: 'DELETE',
    ...config
  })
}

/**
 * 文件上传
 */
export async function upload<T = any>(
  url: string,
  file: File,
  data?: any,
  onProgress?: (progress: number) => void
): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
  }
  
  return request({
    url,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

/**
 * 文件下载
 */
export async function download(
  url: string,
  filename?: string,
  params?: any
): Promise<void> {
  try {
    const response = await request({
      url,
      method: 'GET',
      params,
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    // 获取文件名
    const contentDisposition = response.headers['content-disposition']
    let finalFilename = filename
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (filenameMatch) {
        finalFilename = decodeURIComponent(filenameMatch[1])
      }
    }
    
    link.download = finalFilename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
  } catch (error) {
    console.error('文件下载失败:', error)
    throw error
  }
}

/**
 * 取消请求的令牌
 */
export class RequestCanceler {
  private cancelTokenSource = axios.CancelToken.source()
  
  cancel(message?: string): void {
    this.cancelTokenSource.cancel(message)
  }
  
  get token() {
    return this.cancelTokenSource.token
  }
}

/**
 * 创建带取消功能的请求
 */
export function createCancelableRequest() {
  const canceler = new RequestCanceler()
  
  const wrappedRequest = async function<T = any>(config: AxiosRequestConfig): Promise<T> {
    return request({
      ...config,
      cancelToken: canceler.token
    })
  }
  
  return {
    request: wrappedRequest,
    cancel: (message?: string) => canceler.cancel(message)
  }
}

// 导出axios实例以便特殊需求使用
export { request as axiosInstance }