import { select } from 'd3-selection'
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum
} from 'd3-force'
import { drag as D3Drag } from 'd3-drag'
import { useProjectStore } from '/@/stores'

type NodeDatum = SimulationNodeDatum & { [K: string]: any }

export default function draw(
  nodes: Record<string, NodeDatum>,
  links: SimulationLinkDatum<NodeDatum>[]
) {
  const { getLocalUrl } = useProjectStore()

  const svg = select('#character-relationships')
    // .attr('viewBox', [-400, -400, 800, 800])
    .style('width', '100%')
    .style('height', '100%')

  // console.log(links, nodes)

  // 节点的引力
  const forceNodes = forceManyBody().strength(() => -4000)
  // console.log(forceNodes)

  const forceLinks = forceLink<NodeDatum, SimulationLinkDatum<NodeDatum>>(links)
    .id((d) => d.id)
    .strength(() => 0.1)
  // console.log(forceLinks)

  // 每帧运动处理
  function ticked() {
    link
      .attr('x1', (d: NodeDatum) => d.source.x)
      .attr('y1', (d: NodeDatum) => {
        if (d.type === 1) return d.source.y + 20
        if (d.type === 2) return d.source.y - 20
        return d.source.y
      })
      .attr('x2', (d: NodeDatum) => d.target.x)
      .attr('y2', (d: NodeDatum) => {
        if (d.type === 1) return d.target.y + 20
        if (d.type === 2) return d.target.y - 20
        return d.target.y
      })

    edges_text
      .attr('x', (d: NodeDatum) => {
        return (d.source.x + d.target.x) / 2
      })
      .attr('y', (d: NodeDatum) => {
        if (d.type === 1) return (d.target.y + d.source.y + 40) / 2
        if (d.type === 2) return (d.target.y + d.source.y - 40) / 2
        return (d.target.y + d.source.y) / 2
      })
    // .attr('style', (d) => {
    //   const angle =
    //     (Math.atan2(d.source.y - d.target.y, d.source.x - d.target.x) * 180) /
    //     Math.PI
    //   return `transform: rotate(${angle}deg);transform-origin: center;transform-box: fill-box;`
    // })

    node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)

    text.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)

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

  // 热力图模拟
  const simulation = forceSimulation<NodeDatum>(Object.values(nodes))
    .force('link', forceLinks)
    .force('charge', forceNodes)
    .force('x', forceX())
    .force('y', forceY())
    .on('tick', ticked)
  // console.log('simulation', simulation)

  // 连接线
  const link = svg
    .append('g')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', ({ type }: NodeDatum) => {
      if (type === 1) return 'orange'
      if (type === 2) return 'green'
      return '#999'
    })
    .attr('marker-end', function ({ type }: NodeDatum) {
      if (type === 1) return 'url(#arrow-orange)'
      if (type === 2) return 'url(#arrow-green)'
      return 'url(#arrow)'
    })

  // 节点
  const node = svg
    .append('g')
    .selectAll('circle')
    .data(simulation.nodes()) //表示使用force.nodes数据
    .join('circle')
    .attr('class', 'character-node')
    .style('fill', (node) => {
      return '#CD994C'
    })
    .style('stroke', (node) => {
      return '#CD994C'
    })
    .attr('r', 30)
    .call(drag(simulation) as any)

  // 人物名称
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

  // 人物头像
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

  // 连接线上的文字
  const edges_text = svg
    .append('g')
    .selectAll('.edgelabel')
    .data(links)
    .join('text')
    .attr('fill', ({ type }: NodeDatum) => {
      if (type === 1) return 'orange'
      if (type === 2) return 'green'
      return 'var(--app-color-text)'
    })
    .attr('class', 'edgelabel')
    .attr('id', (node, i) => 'edgepath' + i)
    .attr('dx', (node: NodeDatum) => `-${node.relation.length / 2}em`)
    .attr('dy', '0.5em')
    .style('pointer-events', 'none')
    .text((node: NodeDatum) => node.relation)
}
