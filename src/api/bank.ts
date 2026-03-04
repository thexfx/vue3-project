const API_BASE = 'http://localhost:10010/api'

interface RawApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
  error?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
}

export interface LoginData {
  userId: number
  accountId: number
  username: string
  accountNumber: string
  accountType: string
  balance: number
}

export interface StoredUser {
  id: number
  userId: number
  accountId: number
  username: string
  accountNumber: string
  accountType: string
}

export interface AccountV2 {
  accountId: number
  accountNo: string
  customerId: number
  customerNo: string | null
  accountType: string
  currencyCode: string
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED' | string
  availableBalance: number
  ledgerBalance: number
  openedAt: string
}

export interface TransactionEntry {
  entryId: number
  transactionId: number
  businessNo: string | null
  txType: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | string
  direction: 'DEBIT' | 'CREDIT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  counterpartyAccountNo: string | null
  remark: string | null
  createdAt: string
}

export interface PostingResponse {
  businessNo: string
  transactionId: number
  accountId: number
  balanceBefore: number
  balanceAfter: number
}

interface AmountRequest {
  amount: number
  remark?: string
}

interface TransferRequest {
  sourceAccountId: number
  targetAccountNo: string
  amount: number
  remark?: string
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, init)
    const payload = (await response.json()) as RawApiResponse<T>
    const success = payload.success === true
    const message = payload.message ?? payload.error ?? (success ? '操作成功' : '操作失败')
    return {
      success,
      message,
      data: payload.data ?? null,
    }
  } catch {
    return {
      success: false,
      message: '网络错误，请稍后重试',
      data: null,
    }
  }
}

function jsonHeaders(idempotencyKey?: string): HeadersInit {
  if (!idempotencyKey) {
    return { 'Content-Type': 'application/json' }
  }

  return {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
  }
}

export async function login(username: string, password: string): Promise<ApiResponse<LoginData>> {
  return requestJson<LoginData>('/auth/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ username, password }),
  })
}

export async function getAccount(accountId: number): Promise<ApiResponse<AccountV2>> {
  return requestJson<AccountV2>(`/v2/accounts/${accountId}`)
}

export async function getAccountByNo(accountNo: string): Promise<ApiResponse<AccountV2>> {
  return requestJson<AccountV2>(`/v2/accounts/by-account-no/${encodeURIComponent(accountNo)}`)
}

export async function getEntries(
  accountId: number,
  limit = 20,
): Promise<ApiResponse<TransactionEntry[]>> {
  return requestJson<TransactionEntry[]>(`/v2/accounts/${accountId}/entries?limit=${limit}`)
}

export async function deposit(
  accountId: number,
  request: AmountRequest,
  idempotencyKey?: string,
): Promise<ApiResponse<PostingResponse>> {
  return requestJson<PostingResponse>(`/v2/accounts/${accountId}/deposits`, {
    method: 'POST',
    headers: jsonHeaders(idempotencyKey),
    body: JSON.stringify(request),
  })
}

export async function withdraw(
  accountId: number,
  request: AmountRequest,
  idempotencyKey?: string,
): Promise<ApiResponse<PostingResponse>> {
  return requestJson<PostingResponse>(`/v2/accounts/${accountId}/withdrawals`, {
    method: 'POST',
    headers: jsonHeaders(idempotencyKey),
    body: JSON.stringify(request),
  })
}

export async function transfer(
  request: TransferRequest,
  idempotencyKey?: string,
): Promise<ApiResponse<PostingResponse>> {
  return requestJson<PostingResponse>('/v2/transfers', {
    method: 'POST',
    headers: jsonHeaders(idempotencyKey),
    body: JSON.stringify(request),
  })
}

export function createIdempotencyKey(prefix = 'ledger'): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2)

  return `${prefix}-${Date.now()}-${randomPart}`
}

export function saveStoredUser(payload: LoginData): StoredUser {
  const user: StoredUser = {
    id: payload.userId,
    userId: payload.userId,
    accountId: payload.accountId,
    username: payload.username,
    accountNumber: payload.accountNumber,
    accountType: payload.accountType,
  }
  localStorage.setItem('bank_user', JSON.stringify(user))
  return user
}

export function getStoredUser(): StoredUser | null {
  const stored = localStorage.getItem('bank_user')
  if (!stored || stored === 'undefined' || stored === 'null') {
    return null
  }

  try {
    const parsed = JSON.parse(stored) as Partial<StoredUser> & {
      id?: number | string
      userId?: number | string
      accountId?: number | string
    }

    const userIdRaw = parsed.userId ?? parsed.id
    const normalizedUserId =
      typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw)

    const normalizedAccountId =
      typeof parsed.accountId === 'number' ? parsed.accountId : Number(parsed.accountId)

    if (!Number.isFinite(normalizedUserId) || !Number.isFinite(normalizedAccountId)) {
      return null
    }

    return {
      id: normalizedUserId,
      userId: normalizedUserId,
      accountId: normalizedAccountId,
      username: String(parsed.username ?? ''),
      accountNumber: String(parsed.accountNumber ?? ''),
      accountType: String(parsed.accountType ?? ''),
    }
  } catch {
    return null
  }
}

export function clearStoredUser(): void {
  localStorage.removeItem('bank_user')
}
