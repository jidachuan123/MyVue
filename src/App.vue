<script setup>
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Spring Cloud 用户管理系统</h1>
      <p class="subtitle">Eureka + Feign 微服务架构</p>
      <nav class="nav-links">
        <router-link to="/" active-class="active">商品列表</router-link>
        <router-link to="/report" active-class="active">盘点报表</router-link>
        <router-link to="/external" active-class="active">外部对接</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.app-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}
.app-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}
.app-header h1 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.subtitle {
  font-size: 0.95rem;
  opacity: 0.75;
  margin-top: 8px;
}
.nav-links {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
.nav-links a {
  color: #fff;
  text-decoration: none;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background .2s;
  font-size: 14px;
}
.nav-links a:hover,
.nav-links a.active {
  background: rgba(255,255,255,0.2);
}
</style>
