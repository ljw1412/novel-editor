<script setup lang="ts" name="CharacterRelationships">
//@ts-nocheck
import { onMounted, ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useEditorStore, useProjectStore } from '/@/stores'
import { select, Selection } from 'd3-selection'
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from 'd3-force'
import { drag as D3Drag } from 'd3-drag'
import { only } from '/@/utils/object'

const { getLocalUrl } = useProjectStore()

const wrapEl = ref<SVGElement>()
const svgWidth = ref(0)
const svgHeight = ref(0)
useResizeObserver(wrapEl, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  svgWidth.value = width
  svgHeight.value = height
})

const characterList = useEditorStore().character.list
const links: { source: string; target: string; [K: string]: any }[] = []
const nodes: Record<string, any> = {}
const characterIds = characterList.map((item) => item.id)
characterList.forEach((character) => {
  nodes[character.id] = only(character, 'id avatar title timepoint')

  character.relations.forEach((item) => {
    console.log(item.target, characterIds.includes(item.target))

    if (!item.target || !characterIds.includes(item.target)) return
    links.push({
      source: character.id,
      target: item.target,
      type: 1,
      relation: item.relation
    })
  })
})

//! https://blog.csdn.net/qq_39408204/article/details/103799835
function draw() {
  const svg = select('#character-relationships')
    .attr('viewBox', [-400, -400, 800, 800])
    .style('width', '100%')
    .style('height', '100%')

  console.log(links, nodes)

  const forceNodes = forceManyBody().strength(() => -4000)
  // console.log(forceNodes)

  const forceLinks = forceLink(links)
    .id((d) => d.id)
    .strength(() => 0.1)
  // console.log(forceLinks)

  function ticked() {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
    edges_text
      .attr('x', (d) => (d.source.x + d.target.x) / 2)
      .attr('y', (d) => (d.target.y + d.source.y) / 2)
    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    text.attr('x', (d) => d.x).attr('y', (d) => d.y)
    image.attr('transform', (d) => `translate(${d.x},${d.y})`)
  }

  function drag(simulation: any) {
    return D3Drag()
      .on('start', (event: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event: any) => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('end', (event: any) => {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      })
  }

  const simulation = forceSimulation(Object.values(nodes))
    .force('link', forceLinks)
    .force('charge', forceNodes)
    .force('x', forceX())
    .force('y', forceY())
    .on('tick', ticked)
  console.log('simulation', simulation)

  const marker = svg
    .append('marker')
    //.attr("id", function(d) { return d; })
    .attr('id', 'arrow')
    //.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
    .attr('markerUnits', 'userSpaceOnUse')
    .attr('viewBox', '0 -5 10 10') //坐标系的区域
    .attr('refX', 59) //箭头坐标
    .attr('refY', 0)
    .attr('markerWidth', 8) //标识的大小
    .attr('markerHeight', 8)
    .attr('orient', 'auto') //绘制方向，可设定为：auto（自动确认方向）和 角度值
    .attr('stroke-width', 2) //箭头宽度
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5') //箭头的路径
    .attr('fill', '#999') //箭头颜色

  const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('marker-end', function (d) {
      return 'url(#arrow)'
    })

  const node = svg
    .append('g')
    .selectAll('circle')
    .data(simulation.nodes()) //表示使用force.nodes数据
    .join('circle')
    .style('fill', (node) => {
      // var link = links[node.index]

      // if (link) {
      //   if (link.type == '1') {
      //     return '#C03939'
      //   } else if (link.type == '3') {
      //     return '#5095FF'
      //   } else if (link.source.name.length <= 4) {
      //     return '#CD994C'
      //   } else {
      //     return '#1943AC'
      //   }
      return '#CD994C'
    })
    .style('stroke', (node) => {
      // var color //圆圈线条的颜色
      // var link = links[node.index]
      // if (link) {
      //   console.log(link.rela)
      //   if (link.type == '1') {
      //     //p2p
      //     return (color = '#C03939')
      //   } else if (link.type == '3') {
      //     return (color = '#5095FF')
      //   } else if (link.source.name.length <= 4) {
      //     //人
      //     return (color = '#CD994C')
      //   } else {
      //     return (color = '#1943AC')
      //   }
      // }
      return '#CD994C'
    })
    .attr('r', 30)
    .call(drag(simulation))

  const text = svg
    .append('g')
    .attr('text-anchor', 'middle')
    .attr('fill', (node) => 'var(--app-color-text)')
    .selectAll('text')
    .data(simulation.nodes())
    .join('text')
    .attr('dy', 48)
    .style('pointer-events', 'none')
  text
    .append('tspan')
    .attr('style', 'font-size: 16px;')
    .text((d) => d.title)

  const image = svg
    .append('g')
    .selectAll('image')
    .data(simulation.nodes().filter((node) => node.avatar))
    .join('g')
    .attr('clip-path', 'url(#clip)')

  image
    .append('image')
    .attr('xlink:href', (node) => getLocalUrl(node.avatar))
    .attr('width', 60)
    .attr('height', 60)
    .attr('transform', 'translate(-30,-30)')
    .style('pointer-events', 'none')

  const edges_text = svg
    .append('g')
    .selectAll('.edgelabel')
    .data(links)
    .join('text')
    .attr('fill', (node) => 'var(--app-color-text)')
    .attr('class', 'edgelabel')
    .attr('id', (node, i) => 'edgepath' + i)
    .attr('dx', -14)
    .attr('dy', 14)
    .style('pointer-events', 'none')
    .text((node) => node.relation)
}
onMounted(() => {
  draw()
})
</script>

<template>
  <div ref="wrapEl" class="character-relationships w-full h-full overflow-hide">
    <svg
      id="character-relationships"
      xmlns="https://www.w3.org/2000/svg"
      xmlns:xlink="https://www.w3.org/1999/xlink"
      class="select-none"
    >
      <defs>
        <clipPath id="clip">
          <rect x="-30" y="-30" width="60" height="60" rx="30" />
        </clipPath>
      </defs>
    </svg>
  </div>
</template>

<style lang="scss"></style>
