import { createAction } from 'redux-actions'

export const enableFilter = createAction('enable filter')
export const disableFilter = createAction('disable filter')
export const setFiltersFromUrl = createAction('set filters from url')
export const setRegion = createAction('set region')
export const setRegionFromUrl = createAction('set region from url')
