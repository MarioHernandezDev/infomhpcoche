<script setup lang="ts">
defineProps<{
  glp?: number | null
  gasolina?: number | null
}>()
</script>

<template>
  <div class="relative mx-auto w-full max-w-md pb-14">
    <div class="relative aspect-[10/7]">
      <div class="absolute inset-x-10 top-1/4 h-1/2 rounded-full bg-red-600/30 blur-3xl" />

      <!-- Arcos tipo HUD con marcas -->
      <svg
        viewBox="0 0 400 280"
        class="absolute inset-0 size-full"
        fill="none"
      >
        <g
          stroke="#ef4444"
          stroke-linecap="round"
        >
          <path
            d="M 105 30 A 175 175 0 0 0 105 250"
            stroke-width="1.5"
            opacity=".7"
          />
          <path
            d="M 295 30 A 175 175 0 0 1 295 250"
            stroke-width="1.5"
            opacity=".7"
          />
          <path
            d="M 92 38 A 190 190 0 0 0 92 242"
            stroke-width="7"
            stroke-dasharray="1.5 7"
            opacity=".4"
          />
          <path
            d="M 308 38 A 190 190 0 0 1 308 242"
            stroke-width="7"
            stroke-dasharray="1.5 7"
            opacity=".4"
          />
        </g>
        <g
          fill="#ef4444"
          style="filter: drop-shadow(0 0 5px #ef4444)"
        >
          <circle
            cx="40"
            cy="140"
            r="3.5"
          />
          <circle
            cx="360"
            cy="140"
            r="3.5"
          />
        </g>
        <!-- suelo -->
        <ellipse
          cx="200"
          cy="228"
          rx="150"
          ry="11"
          fill="#ef4444"
          opacity=".18"
        />
        <ellipse
          cx="200"
          cy="228"
          rx="110"
          ry="5"
          fill="#000"
          opacity=".6"
        />
      </svg>

      <img
        src="/img/captur.webp"
        alt="Renault Captur rojo"
        width="1100"
        height="553"
        class="absolute inset-x-[11%] top-[22%] w-[78%] select-none drop-shadow-[0_18px_30px_rgba(220,38,38,.35)]"
        draggable="false"
      >
    </div>

    <div class="absolute inset-x-0 bottom-0 flex justify-between px-2">
      <div class="space-y-1">
        <p class="hud-label">
          GLP
        </p>
        <p class="font-num text-2xl font-medium text-white/90">
          {{ glp ? num(glp, 3) : '—' }} <span class="text-xs text-white/40">€/L</span>
        </p>
      </div>
      <div class="space-y-1 text-right">
        <p class="hud-label">
          Gasolina
        </p>
        <p class="font-num text-2xl font-medium text-white/90">
          {{ gasolina ? num(gasolina, 3) : '—' }} <span class="text-xs text-white/40">€/L</span>
        </p>
      </div>
    </div>
  </div>
</template>
