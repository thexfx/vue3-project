<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  clearStoredUser,
  getAccount,
  getEntries,
  getStoredUser,
  type AccountV2,
  type TransactionEntry,
} from '@/api/bank'

const router = useRouter()

const username = ref('')
const account = ref<AccountV2 | null>(null)
const transactions = ref<TransactionEntry[]>([])
const loading = ref(true)
const error = ref('')

function maskAccountNumber(accountNo: string): string {
  if (!accountNo || accountNo.length < 8) {
    return accountNo
  }
  return `${accountNo.slice(0, 4)} **** **** ${accountNo.slice(-4)}`
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: account.value?.currencyCode ?? 'CNY',
  }).format(balance)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    DEPOSIT: '存入',
    WITHDRAW: '取款',
    TRANSFER: '转账',
  }
  return map[type] ?? type
}

function getTypeClass(type: string): string {
  const map: Record<string, string> = {
    DEPOSIT: 'type-deposit',
    WITHDRAW: 'type-withdraw',
    TRANSFER: 'type-transfer',
  }
  return map[type] ?? ''
}

function transactionDescription(entry: TransactionEntry): string {
  if (entry.remark && entry.remark.trim()) {
    return entry.remark
  }
  if (entry.counterpartyAccountNo) {
    return `对手方: ${entry.counterpartyAccountNo}`
  }
  return '账务分录'
}

function openTransactionDetail(entry: TransactionEntry): void {
  router.push({
    path: '/transactions',
    query: {
      entryId: String(entry.entryId),
      txId: String(entry.transactionId),
    },
  })
}

function handleLogout(): void {
  clearStoredUser()
  router.push('/')
}

onMounted(async () => {
  const storedUser = getStoredUser()
  if (!storedUser) {
    router.push('/')
    return
  }

  username.value = storedUser.username

  try {
    const [accountRes, entriesRes] = await Promise.all([
      getAccount(storedUser.accountId),
      getEntries(storedUser.accountId, 5),
    ])

    if (!accountRes.success || !accountRes.data) {
      error.value = accountRes.message || '账户信息加载失败'
      return
    }

    account.value = accountRes.data

    if (entriesRes.success && entriesRes.data) {
      transactions.value = entriesRes.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-container">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <header class="header">
      <div class="header-left">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        <span class="bank-name">小飞侠银行</span>
      </div>
      <div class="header-right">
        <span class="username">{{ username }}</span>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else-if="account">
        <div class="account-card" @click="router.push('/account')">
          <div class="card-row">
            <span class="card-label">账号</span>
            <span class="card-value">{{ maskAccountNumber(account.accountNo) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">可用余额</span>
            <span class="card-amount">{{ formatBalance(account.availableBalance) }}</span>
          </div>
          <div class="card-row muted">
            <span class="card-label">账面余额</span>
            <span class="card-value">{{ formatBalance(account.ledgerBalance) }}</span>
          </div>
        </div>

        <div class="actions-row">
          <button class="action-btn" @click="router.push('/deposit')">存款</button>
          <button class="action-btn" @click="router.push('/withdraw')">取款</button>
          <button class="action-btn" @click="router.push('/transfer')">转账</button>
        </div>

        <div class="transactions-section">
          <h2 class="section-title">最近分录</h2>
          <div v-if="transactions.length === 0" class="empty">暂无交易记录</div>
          <button
            v-for="entry in transactions"
            :key="entry.entryId"
            class="transaction-item"
            @click="openTransactionDetail(entry)"
          >
            <div class="tx-left">
              <span class="tx-type" :class="getTypeClass(entry.txType)">
                {{ getTypeLabel(entry.txType) }}
              </span>
              <span class="tx-desc">{{ transactionDescription(entry) }}</span>
            </div>
            <div class="tx-right">
              <span class="tx-amount" :class="entry.direction === 'CREDIT' ? 'positive' : 'negative'">
                {{ entry.direction === 'CREDIT' ? '+' : '-' }}{{ formatBalance(entry.amount) }}
              </span>
              <span class="tx-date">{{ formatDate(entry.createdAt) }}</span>
            </div>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f0f9ff 100%);
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  position: relative;
}

.bg-decoration {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(8, 145, 178, 0.12) 0%, transparent 70%);
  top: -150px;
  right: -150px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
  bottom: -100px;
  left: -100px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(8, 145, 178, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.bank-name {
  font-size: 18px;
  font-weight: 700;
  color: #164e63;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  background: rgba(8, 145, 178, 0.08);
  border-radius: 8px;
}

.logout-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.main-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.loading,
.error,
.empty {
  padding: 24px;
  text-align: center;
  color: #64748b;
}

.error {
  color: #b91c1c;
}

.account-card {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  color: white;
  cursor: pointer;
}

.card-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-row.muted {
  opacity: 0.8;
  margin-bottom: 0;
}

.card-label {
  font-size: 13px;
}

.card-value {
  font-size: 14px;
  font-weight: 500;
}

.card-amount {
  font-size: 28px;
  font-weight: 700;
}

.actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #164e63;
  font-weight: 600;
  cursor: pointer;
}

.transactions-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 600;
}

.transaction-item {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.transaction-item:last-child {
  border-bottom: none;
}

.tx-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-type {
  font-size: 14px;
  font-weight: 600;
}

.tx-type.type-deposit {
  color: #16a34a;
}

.tx-type.type-withdraw {
  color: #dc2626;
}

.tx-type.type-transfer {
  color: #2563eb;
}

.tx-desc {
  color: #64748b;
  font-size: 12px;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tx-amount {
  font-size: 14px;
  font-weight: 600;
}

.tx-amount.positive {
  color: #16a34a;
}

.tx-amount.negative {
  color: #dc2626;
}

.tx-date {
  color: #94a3b8;
  font-size: 12px;
}
</style>
