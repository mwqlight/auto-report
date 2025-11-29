<template>
  <div class="not-found-view">
    <div class="error-container">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">抱歉，您访问的页面不存在或已被移除。</p>
      <div class="error-actions">
        <button @click="goHome" class="home-btn">返回首页</button>
        <button @click="goBack" class="back-btn">返回上页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-cosmic);
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: var(--space-8);
}

.error-code {
  font-size: 8rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-4);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-title {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.error-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-8);
  line-height: var(--line-height-relaxed);
}

.error-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.home-btn, .back-btn {
  padding: var(--space-4) var(--space-8);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.home-btn {
  background: var(--gradient-primary);
  color: white;
}

.home-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.back-btn {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.back-btn:hover {
  background: var(--color-bg-tertiary);
}
</style>