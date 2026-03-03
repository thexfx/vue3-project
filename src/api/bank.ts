const API_BASE = 'http://localhost:10010/api'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface BankUser {
  id: number
  username: string
  accountNumber: string
  accountType: string
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED'
  balance: number
  idCard: string
  openDate: string
  createdAt: string
  updatedAt: string
}

export interface BankTransaction {
  id: number
  userId: number
  accountNumber: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
  amount: number
  description: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  failureReason?: string
  counterparty?: string
  createdAt: string
}

export interface TransactionListItem {
  id: number
  userId: number
  type: string
  amount: number
  description: string
  createdAt: string
}

export interface TransferRequest {
  sourceUserId: number
  targetAccountNumber: string
  amount: number
  remark?: string
  passwordHash: string
}

export interface DepositRequest {
  userId: number
  amount: number
  remark?: string
  passwordHash: string
}

export interface WithdrawRequest {
  userId: number
  amount: number
  remark?: string
  passwordHash: string
}

export async function login(username: string, password: string): Promise<ApiResponse<BankUser>> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return response.json()
}

export async function getAccountDetail(userId: number): Promise<ApiResponse<BankUser>> {
  const response = await fetch(`${API_BASE}/account/detail?userId=${userId}`)
  return response.json()
}

export async function deposit(request: DepositRequest): Promise<ApiResponse<{ transactionId: number; newBalance: number }>> {
  const response = await fetch(`${API_BASE}/account/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function withdraw(request: WithdrawRequest): Promise<ApiResponse<{ transactionId: number; newBalance: number }>> {
  const response = await fetch(`${API_BASE}/account/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return response.json()
}

export async function getTransactionDetail(transactionId: number): Promise<ApiResponse<BankTransaction>> {
  const response = await fetch(`${API_BASE}/transaction/detail?transactionId=${transactionId}`)
  return response.json()
}

export async function getTransactions(userId: number, limit = 10): Promise<ApiResponse<TransactionListItem[]>> {
  const response = await fetch(`${API_BASE}/transaction/list?userId=${userId}&limit=${limit}`)
  return response.json()
}

export async function executeTransfer(request: TransferRequest): Promise<ApiResponse<{ transactionId: number; newBalance: number }>> {
  const response = await fetch(`${API_BASE}/transfer/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return response.json()
}

export function getStoredUser(): BankUser | null {
  const stored = localStorage.getItem('bank_user')
  return stored ? JSON.parse(stored) : null
}

export function clearStoredUser(): void {
  localStorage.removeItem('bank_user')
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}