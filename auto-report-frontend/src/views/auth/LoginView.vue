<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>Stardust BI</h1>
        <p>智能数据分析平台</p>
      </div>
      
      <div class="login-form">
        <h2>用户登录</h2>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
        
        <div class="login-tips">
          <p>提示：当前为演示版本，任意用户名密码均可登录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  try {
    // 模拟登录过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 存储token
    localStorage.setItem('token', 'demo-token')
    
    // 跳转到首页
    router.push('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-cosmic);
}

.login-container {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.login-header h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.login-form h2 {
  text-align: center;
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
  font-size: var(--font-size-xl);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-group label {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
}

.form-group input {
  width: 100%;
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.login-btn {
  width: 100%;
  padding: var(--space-4);
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-tips {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  text-align: center;
}

.login-tips p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>