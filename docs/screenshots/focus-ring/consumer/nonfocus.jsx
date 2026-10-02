import React from 'react';
import {Canvas,Node,Connection,Edge} from '@hollis-labs/kit-workflow/canvas';
import {Position} from '@xyflow/react';
const nodeTypes={probe:()=> <Node handles={{target:true,source:true}}>Selected node</Node>};
export function NonFocus(){return <div className="h-64 w-full"><Canvas nodes={[{id:'a',type:'probe',position:{x:0,y:0},data:{},selected:true},{id:'b',position:{x:440,y:0},data:{label:'Destination'},selected:true}]} edges={[{id:'ab',source:'a',target:'b',selected:true}]} nodeTypes={nodeTypes} background={false} fitView>
<svg aria-label="Workflow connection probes"><Connection fromX={0} fromY={0} toX={50} toY={50} connectionStatus="valid"/><Edge.Temporary id="temporary" source="a" target="b" sourceX={0} sourceY={20} targetX={100} targetY={20} sourcePosition={Position.Right} targetPosition={Position.Left}/></svg>
<div className="react-flow__selection" data-nonfocus="selection-marquee"/>
</Canvas></div>}
