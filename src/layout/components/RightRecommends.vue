<template>
  <aside class="w-[280px] flex-shrink-0 hidden xl:block">
    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 class="font-bold text-gray-800 mb-4">微博热搜</h3>
      <ul class="space-y-3">
        <li v-for="i in 5" :key="i" class="flex items-center justify-between text-sm cursor-pointer group">
          <div class="flex items-center gap-2">
            <span :class="i <= 3 ? 'text-orange-500' : 'text-gray-400'" class="font-bold w-4">{{ i }}</span>
            <span class="text-gray-700 group-hover:text-orange-500 truncate max-w-[160px]">这是一个热门的话题示例 {{ i }}</span>
          </div>
          <span class="text-gray-400 text-xs">hot</span>
        </li>
      </ul>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm p-4">
      <h3 class="font-bold text-gray-800 mb-4">可能感兴趣的人</h3>
      <div class="space-y-4">
          <div v-for="j in 3" :key="j" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-gray-800 truncate">推荐用户 {{ j }}</div>
              <div class="text-xs text-gray-500 truncate">知名博主</div>
            </div>
            <button class="text-orange-500 border border-orange-500 rounded-full px-3 py-1 text-xs hover:bg-orange-50 flex-shrink-0">+ 关注</button>
          </div>
      </div>
    </div>
  </aside>
</template>
