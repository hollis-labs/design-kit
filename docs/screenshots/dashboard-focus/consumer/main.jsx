import React from 'react';
import {createRoot} from 'react-dom/client';
import {Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from '@hollis-labs/design-components';
import {DataTable} from '@hollis-labs/kit-dashboard/data';
import {DiagnosticPanel} from '@hollis-labs/kit-observe';
import './style.css';
const themes=['p4-white','p1-green-phosphor','p3-amber-phosphor','hi-contrast'];
const theme=new URLSearchParams(location.search).get('theme');
document.documentElement.dataset.theme=themes.includes(theme)?theme:themes[0];
document.documentElement.dataset.mode='dark';
createRoot(document.getElementById('root')).render(<main className="bg-panel text-text p-6 flex flex-col gap-6 h-screen overflow-auto">
<h1 className="text-heading font-semibold">Dashboard keyboard focus and sorting</h1>
<div className="flex flex-wrap gap-4"><Button variant="outline">Refresh</Button><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Inspect</DropdownMenuItem><DropdownMenuItem>Export</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
<DiagnosticPanel label="Diagnostics" schema={{type:'object'}} data={{status:'ok'}} validation={{state:'valid'}} observation={{phase:'error', observedAt:'2026-10-02T12:00:00Z', nowMs:Date.parse('2026-10-02T12:00:01Z'), staleAfterMs:60000, error:'Fixture refresh failed', onRetry:()=>{}}} />
<DataTable items={[{id:'api',name:'API',state:'Healthy'},{id:'worker',name:'Worker',state:'Idle'}]} getRowId={row=>row.id} columns={[{key:'name',header:'Service',width:'fill',sortValue:row=>row.name,cell:row=>row.name},{key:'state',header:'Status',sortValue:row=>row.state,cell:row=>row.state}]} />
</main>);
