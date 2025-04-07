import type { IStatus } from './status'

export interface IPatient {
  id: number
  name: string
  phoneNumber: string
  documentNumber: string
  bithDate: string
  status: IStatus
}

export type GetPatientListRequest = {
  itemsPerPage: number
  page: number
  name: IPatient['name']
  documentNumber: IPatient['documentNumber']
  statusId: string
}

export type GetPatientListResponse = {
  total: number
  items: IPatient[]
}

export type PatientForm = {
  name: IPatient['name']
  documentNumber: IPatient['documentNumber']
  phoneNumber: IPatient['phoneNumber']
  bithDate: IPatient['bithDate']
  statusId: string
}
