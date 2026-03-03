<script setup lang="ts">
import { ref } from 'vue'

interface DetailItem {
  label: string
  value: string
}

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  details?: DetailItem[]
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const loading = ref(false)

function handleConfirm() {
  loading.value = true
  emit('confirm')
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="handleCancel">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
          <div v-if="details && details.length > 0" class="modal-details">
            <div v-for="(detail, index) in details" :key="index" class="detail-item">
              <span class="detail-label">{{ detail.label }}：</span>
              <span class="detail-value">{{ detail.value }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="btn btn-confirm" :disabled="loading" @click="handleConfirm">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '处理中...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

.modal-message {
  margin: 0 0 16px;
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  color: #1e293b;
  font-weight: 600;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-confirm {
  background: #1e3a8a;
  border: 1px solid #1e3a8a;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #172554;
  border-color: #172554;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>