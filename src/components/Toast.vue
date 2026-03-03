<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<ToastProps>(), {
  duration: 3000
})

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, props.duration)
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', `toast-${type}`]" @click="emit('close')">
      <div class="toast-icon">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  min-width: 320px;
  max-width: 90vw;
  cursor: pointer;
}

.toast-success {
  border-left: 4px solid #22c55e;
}

.toast-error {
  border-left: 4px solid #dc2626;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  color: #22c55e;
}

.toast-error .toast-icon {
  color: #dc2626;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>