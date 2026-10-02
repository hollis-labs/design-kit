import { Matrix } from './matrix'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '../../src/index.ts'
import { GalleryView } from '../../../kit-dashboard/demo/views/gallery.tsx'
import { AccountAccessFixture } from '../../../kit-account/demo/access.tsx'
import { HistoryBrowserFixture } from '../../../kit-chat/demo/history.tsx'
const params = new URLSearchParams(location.search)
const mode = (params.get('surface') ?? 'matrix') as keyof typeof views
document.documentElement.dataset.theme = params.get('theme') ?? 'sysop-p4-white'
document.documentElement.dataset.mode = params.get('mode') ?? 'dark'
await import(['matrixDashboard','gallery'].includes(mode) ? './dashboard.css' : './contract.css')
const views = { matrix: <Matrix/>, matrixDashboard: <Matrix/>, gallery: <GalleryView/>, accountAccess: <AccountAccessFixture/>, chatHistory: <HistoryBrowserFixture/> }
createRoot(document.getElementById('root')!).render(<TooltipProvider>{views[mode]}</TooltipProvider>)
