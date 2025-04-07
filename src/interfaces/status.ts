export interface IStatus {
  id: string
  name: string
}

export type GetStatusListRequest = {
  itemsPerPage: number
  page: number
}

export type GetStatusListResponse = {
  total: number
  items: IStatus[]
}

export type StatusForm = {
  name: IStatus['name']
}
