<template>
  <section class="panel">
    <span class="corner c-tl"></span>
    <span class="corner c-tr"></span>
    <span class="corner c-bl"></span>
    <span class="corner c-br"></span>

    <header class="panel-hd">
      <h3 class="panel-title">{{ title }}</h3>
      <span v-if="sub" class="panel-sub">{{ sub }}</span>
      <div class="panel-extra">
        <slot name="extra" />
      </div>
    </header>

    <div class="panel-bd" :class="{ 'panel-bd--tight': tight }">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * 大屏「块」容器：标题栏 + 四角高亮 + 内容插槽
 *
 * 用法：
 *   <PanelBox class="a-trend" title="销售趋势" sub="近 7 天 · 万元">
 *     <template #extra>...</template>
 *     <TrendChart :data="..." />
 *   </PanelBox>
 */
defineProps({
  title: { type: String, required: true },
  sub: { type: String, default: '' },
  // 表格类区块用紧凑内边距，图表类默认
  tight: { type: Boolean, default: false }
})
</script>
