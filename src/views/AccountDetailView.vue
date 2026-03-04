<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { clearStoredUser, getAccount, getStoredUser, type AccountV2 } from '@/api/bank'

const router = useRouter()
const account = ref<AccountV2 | null>(null)
const loading = ref(true)
const error = ref('')

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: account.value?.currencyCode ?? 'CNY',
  }).format(balance)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'status-active',
    FROZEN: 'status-frozen',
    CLOSED: 'status-closed',
  }
  return map[status] ?? ''
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: '正常',
    FROZEN: '冻结',
    CLOSED: '已关闭',
  }
  return map[status] ?? status
}

onMounted(async () => {
  const storedUser = getStoredUser()
  if (!storedUser) {
    clearStoredUser()
    router.push('/')
    return
  }

  try {
    const response = await getAccount(storedUser.accountId)
    if (response.success && response.data) {
      account.value = response.data
    } else {
      error.value = response.message || '账户详情加载失败'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="account-detail-container">
    <header class="header">
      <button @click="router.push('/home')" class="back-btn">返回</button>
      <h1 class="page-title">账户详情</h1>
      <div class="spacer"></div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else-if="account">
        <div class="info-card">
          <div class="card-header">
            <h2>基础信息</h2>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">账户ID</span>
              <span class="value">{{ account.accountId }}</span>
            </div>
            <div class="info-item">
              <span class="label">账号</span>
              <span class="value">{{ account.accountNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">账户类型</span>
              <span class="value">{{ account.accountType }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态</span>
              <span :class="['value', 'status', getStatusClass(account.status)]">
                {{ getStatusText(account.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">可用余额</span>
              <span class="value amount">{{ formatBalance(account.availableBalance) }}</span>
            </div>
            <div class="info-item">
              <span class="label">账面余额</span>
              <span class="value amount">{{ formatBalance(account.ledgerBalance) }}</span>
            </div>
            <div class="info-item">
              <span class="label">币种</span>
              <span class="value">{{ account.currencyCode }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户编号</span>
              <span class="value">{{ account.customerNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">开户时间</span>
              <span class="value">{{ formatDate(account.openedAt) }}</span>
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
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.spacer {
  width: 60px;
}

.main-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px;
}

.loading,
.error {
  padding: 24px;
  text-align: center;
}

.error {
  color: #b91c1c;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.label {
  color: #64748b;
  font-size: 14px;
}

.value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.value.amount {
  color: #1e3a8a;
  font-weight: 700;
}

.value.status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.value.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.value.status-frozen {
  background: #fef3c7;
  color: #d97706;
}

.value.status-closed {
  background: #fee2e2;
  color: #dc2626;
}
</style>
