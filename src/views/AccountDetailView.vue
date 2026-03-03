<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAccountDetail, getStoredUser, type BankUser } from '@/api/bank'

const router = useRouter()
const user = ref<BankUser | null>(null)
const loading = ref(true)

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(balance)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    'ACTIVE': 'status-active',
    'FROZEN': 'status-frozen',
    'CLOSED': 'status-closed'
  }
  return map[status] || ''
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    'ACTIVE': '正常',
    'FROZEN': '冻结',
    'CLOSED': '已关闭'
  }
  return map[status] || status
}

onMounted(async () => {
  const storedUser = getStoredUser()
  if (!storedUser) {
    router.push('/')
    return
  }
  
  try {
    const response = await getAccountDetail(storedUser.id)
    if (response.success && response.data) {
      user.value = response.data
    }
  } catch (e) {
    console.error('Failed to load account detail', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="account-detail-container">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
    
    <header class="header">
      <button @click="router.push('/home')" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        返回
      </button>
      <h1 class="page-title">账户详情</h1>
      <div class="spacer"></div>
    </header>
    
    <main class="main-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <template v-else-if="user">
        <div class="info-card">
          <div class="card-header">
            <h2>基本信息</h2>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">账号</span>
              <span class="value">{{ user.accountNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">账户类型</span>
              <span class="value">{{ user.accountType === 'SAVING' ? '储蓄账户' : user.accountType }}</span>
            </div>
            <div class="info-item">
              <span class="label">账户状态</span>
              <span :class="['value', 'status', getStatusClass(user.status)]">
                {{ getStatusText(user.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">余额</span>
              <span class="value amount">{{ formatBalance(user.balance) }}</span>
            </div>
            <div class="info-item">
              <span class="label">开户日期</span>
              <span class="value">{{ formatDate(user.openDate) }}</span>
            </div>
            <div class="info-item">
              <span class="label">身份证号</span>
              <span class="value">{{ user.idCard }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.account-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f0f9ff 100%);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.bg-decoration {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(30, 58, 138, 0.1) 0%, transparent 70%);
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
  bottom: -50px;
  left: -50px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.spacer {
  width: 80px;
}

.main-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.info-item .value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.info-item .value.amount {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a8a;
}

.info-item .value.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.info-item .value.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.info-item .value.status-frozen {
  background: #fef3c7;
  color: #d97706;
}

.info-item .value.status-closed {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 640px) {
  .header {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .info-card {
    padding: 20px;
    border-radius: 16px;
  }
}
</style>