<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerEnterprise, type EnterpriseRegisterData } from '@/api/bank'

const router = useRouter()

const enterpriseName = ref('')
const creditCode = ref('')
const username = ref('')
const password = ref('')
const fullName = ref('')
const idType = ref('NATIONAL_ID')
const idNumber = ref('')
const mobile = ref('')
const email = ref('')
const accountMode = ref<'OPEN_NEW' | 'LINK_EXISTING'>('OPEN_NEW')
const accountNo = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')
const result = ref<EnterpriseRegisterData | null>(null)

const canSubmit = computed(() => {
  const basicValid =
    enterpriseName.value.trim().length > 1
    && /^[0-9A-Z]{18}$/.test(creditCode.value.trim().toUpperCase())
    && username.value.trim().length > 0
    && password.value.trim().length >= 6
    && fullName.value.trim().length > 0
    && idNumber.value.trim().length > 0
    && idNumber.value.trim().length <= 128
    && /^1\d{10}$/.test(mobile.value.trim())

  if (!basicValid) {
    return false
  }

  if (accountMode.value === 'LINK_EXISTING') {
    return /^\d{19}$/.test(accountNo.value.trim())
  }

  return true
})

async function handleRegister() {
  error.value = ''
  success.value = ''
  result.value = null

  if (!canSubmit.value) {
    error.value = '请检查输入项：证件号码最多128位，手机号11位，绑定模式需19位账号'
    return
  }

  loading.value = true
  try {
    const response = await registerEnterprise({
      enterpriseName: enterpriseName.value.trim(),
      creditCode: creditCode.value.trim().toUpperCase(),
      username: username.value.trim(),
      password: password.value,
      fullName: fullName.value.trim(),
      idType: idType.value.trim().toUpperCase(),
      idNumber: idNumber.value.trim(),
      mobile: mobile.value.trim(),
      email: email.value.trim() || undefined,
      accountMode: accountMode.value,
      accountNo: accountMode.value === 'LINK_EXISTING' ? accountNo.value.trim() : undefined,
    })

    if (!response.success || !response.data) {
      error.value = response.message || '注册失败，请稍后重试'
      return
    }

    result.value = response.data
    success.value = response.message || '企业注册成功'
  } catch {
    error.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <h1>企业网银注册</h1>
      <p class="desc">企业入驻 + 管理员创建 + 账户处理（新开户或绑定已有）</p>

      <form class="form" @submit.prevent="handleRegister">
        <h2 class="section">企业信息</h2>
        <label>
          企业名称
          <input v-model="enterpriseName" type="text" placeholder="例如：上海示例科技有限公司" />
        </label>
        <label>
          统一社会信用代码
          <input
            v-model="creditCode"
            type="text"
            maxlength="18"
            placeholder="18位数字或大写字母"
            style="text-transform: uppercase"
          />
        </label>

        <h2 class="section">管理员信息</h2>
        <label>
          登录用户名
          <input v-model="username" type="text" placeholder="全局唯一" />
        </label>
        <label>
          登录密码
          <input v-model="password" type="password" placeholder="至少 6 位" />
        </label>
        <label>
          姓名
          <input v-model="fullName" type="text" placeholder="管理员真实姓名" />
        </label>
        <label>
          证件类型
          <select v-model="idType">
            <option value="NATIONAL_ID">NATIONAL_ID</option>
            <option value="PASSPORT">PASSPORT</option>
            <option value="LICENSE">LICENSE</option>
          </select>
        </label>
        <label>
          证件号码
          <input v-model="idNumber" type="text" maxlength="128" placeholder="用于customers建档（最多128位）" />
        </label>
        <label>
          手机号
          <input v-model="mobile" type="text" maxlength="11" placeholder="11位手机号" />
        </label>
        <label>
          邮箱（可选）
          <input v-model="email" type="email" placeholder="name@example.com" />
        </label>

        <h2 class="section">账户处理</h2>
        <div class="mode-group">
          <label class="radio-item">
            <input v-model="accountMode" type="radio" value="OPEN_NEW" />
            <span>新开账户（系统生成19位账号）</span>
          </label>
          <label class="radio-item">
            <input v-model="accountMode" type="radio" value="LINK_EXISTING" />
            <span>绑定已有账户</span>
          </label>
        </div>
        <label v-if="accountMode === 'LINK_EXISTING'">
          银行账号
          <input v-model="accountNo" type="text" maxlength="19" placeholder="请输入19位账号" />
        </label>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <button type="submit" :disabled="loading || !canSubmit">
          {{ loading ? '提交中...' : '提交注册' }}
        </button>
      </form>

      <div v-if="result" class="result">
        <h2>注册结果</h2>
        <p>企业ID：{{ result.entId }}</p>
        <p>管理员：{{ result.adminUsername }} ({{ result.adminRole }})</p>
        <p>客户号：{{ result.customerNo }}</p>
        <p>账号：{{ result.accountNo }}（ID: {{ result.accountId }}）</p>
        <p>模式：{{ result.accountMode }}</p>
      </div>

      <div class="actions">
        <button type="button" class="secondary" @click="router.push('/')">返回登录</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 15% 20%, rgba(236, 253, 245, 0.8) 0, transparent 32%),
    radial-gradient(circle at 85% 15%, rgba(224, 242, 254, 0.9) 0, transparent 35%),
    linear-gradient(140deg, #f8fafc 0%, #f0fdf4 40%, #ecfeff 100%);
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 760px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 14px 34px rgba(2, 132, 199, 0.08);
}

h1 {
  margin: 0;
  color: #0f172a;
}

.desc {
  margin: 8px 0 20px;
  color: #475569;
}

.section {
  grid-column: 1 / -1;
  margin: 10px 0 0;
  font-size: 16px;
  color: #0f172a;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
}

input,
select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

input:focus,
select:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

.mode-group {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

.radio-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.error,
.success {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 13px;
}

.error {
  color: #dc2626;
}

.success {
  color: #047857;
}

button {
  grid-column: 1 / -1;
  border: none;
  border-radius: 10px;
  padding: 11px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(90deg, #0284c7 0%, #10b981 100%);
  color: #fff;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 18px;
  border-top: 1px dashed #cbd5e1;
  padding-top: 14px;
  color: #0f172a;
}

.result h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.result p {
  margin: 4px 0;
}

.actions {
  margin-top: 14px;
}

.secondary {
  background: #f1f5f9;
  color: #0f172a;
}

@media (max-width: 760px) {
  .register-card {
    padding: 20px;
    border-radius: 16px;
  }

  .form {
    grid-template-columns: 1fr;
  }
}
</style>
