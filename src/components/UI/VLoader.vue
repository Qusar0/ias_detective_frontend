<template>
  <div class="loader-overlay">
    <div class="loader-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(242, 237, 243, 0.7);
  backdrop-filter: blur(2px);
}

.loader-ring {
  display: inline-block;
  position: relative;
  width: 56px;
  height: 56px;
}

.loader-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 46px;
  height: 46px;
  margin: 5px;
  border: 4px solid transparent;
  border-top-color: #2f4050;
  border-radius: 50%;
  animation: loader-spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loader-ring div:nth-child(1) { animation-delay: -0.3s; }
.loader-ring div:nth-child(2) { animation-delay: -0.2s; }
.loader-ring div:nth-child(3) { animation-delay: -0.1s; }

@keyframes loader-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
