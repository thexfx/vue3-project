<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createIdempotencyKey, getStoredUser, transfer } from '@/api/bank'

const router = useRouter()
const loading = ref(true)
const targetAccountNo = ref('')
const amount = ref('')
const remark = ref('')
const submitting = ref(false)
const success = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  success.value = ''

  const storedUser = getStoredUser()
  if (!storedUser) {
    error.value = '登录状态已失效，请重新登录'
    return
  }

  const amountValue = Number(amount.value)
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    error.value = '请输入有效金额'
    return
  }

  if (!targetAccountNo.value.trim()) {
    error.value = '请输入目标账号'
    return
  }

  submitting.value = true
  try {
    const response = await transfer(
      {
        sourceAccountId: storedUser.accountId,
        targetAccountNo: targetAccountNo.value.trim(),
        amount: amountValue,
        remark: remark.value || undefined,
      },
      createIdempotencyKey('transfer'),
    )

    if (response.success && response.data) {
      success.value = `${response.message}，流水号：${response.data.businessNo}`
      targetAccountNo.value = ''
      amount.value = ''
      remark.value = ''
      setTimeout(() => router.push('/home'), 1000)
    } else {
      error.value = response.message || '转账失败'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const storedUser = getStoredUser()
  if (!storedUser) {
    router.push('/')
    return
  }
  loading.value = false
})
</script>

<template>
  <div class="transfer-container">
    <header class="header">
      <button @click="router.push('/home')" class="back-btn">返回</button>
      <h1 class="page-title">转账</h1>
      <div class="spacer"></div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="info-card">
        <form class="form" @submit.prevent="handleSubmit">
          <label class="form-item">
            <span>目标账号</span>
            <input v-model="targetAccountNo" type="text" placeholder="请输入收款账号" />
          </label>
          <label class="form-item">
            <span>金额</span>
            <input v-model="amount" type="number" min="0.01" step="0.01" placeholder="请输入转账金额" />
          </label>
          <label class="form-item">
            <span>备注</span>
            <input v-model="remark" type="text" maxlength="50" placeholder="可选，最多50字" />
          </label>

          <p v-if="error" class="message error">{{ error }}</p>
          <p v-if="success" class="message success">{{ success }}</p>

          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '处理中...' : '确认转账' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.transfer-container {
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
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.loading {
  text-align: center;
  color: #64748b;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
  font-size: 14px;
}

.form-item input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

.message {
  margin: 0;
  font-size: 14px;
}

.message.error {
  color: #dc2626;
}

.message.success {
  color: #16a34a;
}

.submit-btn {
  border: none;
  border-radius: 10px;
  background: #0891b2;
  color: white;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
