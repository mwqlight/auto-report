import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import DatasetApi from '@/api/dataset'
import type { Dataset, DatasetCreateRequest, DatasetUpdateRequest, DatasetQueryParams } from '@/types/dataset'

/**
 * 数据集Store
 */
export const useDatasetStore = defineStore('dataset', () => {
  // 状态
  const datasets = ref<Dataset[]>([])
  const currentDataset = ref<Dataset | null>(null)
  const loading = ref(false)
  const totalCount = ref(0)
  const datasetTypes = ref<Array<{ value: string; label: string; description: string }>>([])

  // 计算属性
  const activeDatasets = computed(() => 
    datasets.value.filter(dataset => dataset.status === 'active')
  )

  const errorDatasets = computed(() => 
    datasets.value.filter(dataset => dataset.status === 'error')
  )

  const publicDatasets = computed(() => 
    datasets.value.filter(dataset => dataset.isPublic)
  )

  const datasetStats = computed(() => ({
    total: datasets.value.length,
    active: activeDatasets.value.length,
    error: errorDatasets.value.length,
    public: publicDatasets.value.length
  }))

  // Actions
  
  /**
   * 获取数据集列表
   */
  const fetchDatasets = async (params?: DatasetQueryParams) => {
    loading.value = true
    try {
      const response = await DatasetApi.getDatasets(params)
      datasets.value = response.items
      totalCount.value = response.total
      return response
    } catch (error) {
      console.error('获取数据集列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取数据集详情
   */
  const fetchDataset = async (id: string) => {
    try {
      const dataset = await DatasetApi.getDataset(id)
      currentDataset.value = dataset
      return dataset
    } catch (error) {
      console.error('获取数据集详情失败:', error)
      throw error
    }
  }

  /**
   * 创建数据集
   */
  const createDataset = async (data: DatasetCreateRequest) => {
    try {
      const dataset = await DatasetApi.createDataset(data)
      datasets.value.unshift(dataset)
      totalCount.value += 1
      return dataset
    } catch (error) {
      console.error('创建数据集失败:', error)
      throw error
    }
  }

  /**
   * 更新数据集
   */
  const updateDataset = async (id: string, data: DatasetUpdateRequest) => {
    try {
      const dataset = await DatasetApi.updateDataset(id, data)
      const index = datasets.value.findIndex(d => d.id === id)
      if (index !== -1) {
        datasets.value[index] = dataset
      }
      if (currentDataset.value?.id === id) {
        currentDataset.value = dataset
      }
      return dataset
    } catch (error) {
      console.error('更新数据集失败:', error)
      throw error
    }
  }

  /**
   * 删除数据集
   */
  const deleteDataset = async (id: string) => {
    try {
      await DatasetApi.deleteDataset(id)
      datasets.value = datasets.value.filter(dataset => dataset.id !== id)
      totalCount.value -= 1
      if (currentDataset.value?.id === id) {
        currentDataset.value = null
      }
    } catch (error) {
      console.error('删除数据集失败:', error)
      throw error
    }
  }

  /**
   * 批量删除数据集
   */
  const batchDeleteDatasets = async (ids: string[]) => {
    try {
      await DatasetApi.batchDeleteDatasets(ids)
      datasets.value = datasets.value.filter(dataset => !ids.includes(dataset.id))
      totalCount.value -= ids.length
      if (currentDataset.value && ids.includes(currentDataset.value.id)) {
        currentDataset.value = null
      }
    } catch (error) {
      console.error('批量删除数据集失败:', error)
      throw error
    }
  }

  /**
   * 复制数据集
   */
  const copyDataset = async (id: string, name: string) => {
    try {
      const dataset = await DatasetApi.copyDataset(id, name)
      datasets.value.unshift(dataset)
      totalCount.value += 1
      return dataset
    } catch (error) {
      console.error('复制数据集失败:', error)
      throw error
    }
  }

  /**
   * 刷新数据集
   */
  const refreshDataset = async (id: string) => {
    try {
      const dataset = await DatasetApi.refreshDataset(id)
      const index = datasets.value.findIndex(d => d.id === id)
      if (index !== -1) {
        datasets.value[index] = dataset
      }
      if (currentDataset.value?.id === id) {
        currentDataset.value = dataset
      }
      return dataset
    } catch (error) {
      console.error('刷新数据集失败:', error)
      throw error
    }
  }

  /**
   * 获取数据集类型
   */
  const fetchDatasetTypes = async () => {
    try {
      datasetTypes.value = await DatasetApi.getDatasetTypes()
      return datasetTypes.value
    } catch (error) {
      console.error('获取数据集类型失败:', error)
      throw error
    }
  }

  /**
   * 验证数据集名称
   */
  const validateDatasetName = async (name: string) => {
    try {
      return await DatasetApi.validateDatasetName(name)
    } catch (error) {
      console.error('验证数据集名称失败:', error)
      throw error
    }
  }

  /**
   * 导入数据集
   */
  const importDataset = async (data: {
    name: string
    description?: string
    file: File
    dataSourceId?: string
  }) => {
    try {
      const dataset = await DatasetApi.importDataset(data)
      datasets.value.unshift(dataset)
      totalCount.value += 1
      return dataset
    } catch (error) {
      console.error('导入数据集失败:', error)
      throw error
    }
  }

  /**
   * 导出数据集
   */
  const exportDataset = async (id: string, format: 'csv' | 'excel' | 'json' = 'csv') => {
    try {
      const blob = await DatasetApi.exportDataset(id, format)
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置文件名
      const dataset = datasets.value.find(d => d.id === id)
      const fileName = dataset ? `${dataset.name}.${format}` : `dataset.${format}`
      link.download = fileName
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return blob
    } catch (error) {
      console.error('导出数据集失败:', error)
      throw error
    }
  }

  /**
   * 预览数据集数据
   */
  const previewDataset = async (id: string, limit: number = 100) => {
    try {
      return await DatasetApi.previewDataset(id, limit)
    } catch (error) {
      console.error('预览数据集失败:', error)
      throw error
    }
  }

  /**
   * 执行SQL查询
   */
  const executeSql = async (id: string, sql: string) => {
    try {
      return await DatasetApi.executeSql(id, sql)
    } catch (error) {
      console.error('执行SQL查询失败:', error)
      throw error
    }
  }

  /**
   * 清除当前数据集
   */
  const clearCurrentDataset = () => {
    currentDataset.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    datasets.value = []
    currentDataset.value = null
    loading.value = false
    totalCount.value = 0
    datasetTypes.value = []
  }

  return {
    // 状态
    datasets,
    currentDataset,
    loading,
    totalCount,
    datasetTypes,
    
    // 计算属性
    activeDatasets,
    errorDatasets,
    publicDatasets,
    datasetStats,
    
    // Actions
    fetchDatasets,
    fetchDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    batchDeleteDatasets,
    copyDataset,
    refreshDataset,
    fetchDatasetTypes,
    validateDatasetName,
    importDataset,
    exportDataset,
    previewDataset,
    executeSql,
    clearCurrentDataset,
    reset
  }
})