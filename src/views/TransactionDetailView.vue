<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEntries, getStoredUser, type TransactionEntry } from '@/api/bank'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const detail = ref<TransactionEntry | null>(null)

function formatBalance(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function getDirectionLabel(direction: string): string {
  return direction === 'CREDIT' ? '贷方入账' : '借方出账'
}

onMounted(async () => {
  const storedUser = getStoredUser()
  if (!storedUser) {
    router.push('/')
    return
  }

  const entryId = Number(route.query.entryId)
  const transactionId = Number(route.query.txId)

  try {
    const response = await getEntries(storedUser.accountId, 100)
    if (!response.success || !response.data) {
      error.value = response.message || '分录详情加载失败'
      return
    }

    if (Number.isFinite(entryId)) {
      detail.value = response.data.find((item) => item.entryId === entryId) ?? null
    }

    if (!detail.value && Number.isFinite(transactionId)) {
      detail.value = response.data.find((item) => item.transactionId === transactionId) ?? null
    }

    if (!detail.value) {
      error.value = '未找到对应交易分录'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="transaction-detail-container">
    <header class="header">
      <button @click="router.push('/home')" class="back-btn">返回</button>
      <h1 class="page-title">交易详情</h1>
      <div class="spacer"></div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="detail" class="info-card">
        <div class="row">
          <span>分录ID</span>
          <strong>{{ detail.entryId }}</strong>
        </div>
        <div class="row">
          <span>交易ID</span>
          <strong>{{ detail.transactionId }}</strong>
        </div>
        <div class="row">
          <span>业务流水号</span>
          <strong>{{ detail.businessNo || '-' }}</strong>
        </div>
        <div class="row">
          <span>交易类型</span>
          <strong>{{ detail.txType }}</strong>
        </div>
        <div class="row">
          <span>借贷方向</span>
          <strong>{{ getDirectionLabel(detail.direction) }}</strong>
        </div>
        <div class="row">
          <span>交易金额</span>
          <strong>{{ formatBalance(detail.amount) }}</strong>
        </div>
        <div class="row">
          <span>交易前余额</span>
          <strong>{{ formatBalance(detail.balanceBefore) }}</strong>
        </div>
        <div class="row">
          <span>交易后余额</span>
          <strong>{{ formatBalance(detail.balanceAfter) }}</strong>
        </div>
        <div class="row">
          <span>对手方账号</span>
          <strong>{{ detail.counterpartyAccountNo || '-' }}</strong>
        </div>
        <div class="row">
          <span>备注</span>
          <strong>{{ detail.remark || '-' }}</strong>
        </div>
        <div class="row">
          <span>分录时间</span>
          <strong>{{ formatDate(detail.createdAt) }}</strong>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.transaction-detail-container {
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
  text-align: center;
  padding: 24px;
}

.error {
  color: #b91c1c;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.row:last-child {
  border-bottom: none;
}

.row span {
  color: #64748b;
}

.row strong {
  color: #1e293b;
  text-align: right;
}
</style>
