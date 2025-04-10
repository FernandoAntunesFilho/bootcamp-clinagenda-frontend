import type { IDoctor } from './doctor'
import type { IPatient } from './patient'
import type { ISpecialty } from './specialty'
import type { IStatus } from './status'

export interface IAppointment {
  id: number
  patient: IPatient
  doctor: IDoctor
  specialty: ISpecialty
  appointmentDate: string
}

export type GetAppointmentListRequest = {
  itemsPerPage: number
  page: number
  patientName: IPatient['name']
  doctorName: IDoctor['name']
  specialtyId: ISpecialty['id'] | null
}

export type GetAppointmentListResponse = {
  total: number
  items: IAppointment[]
}

export type AppointmentForm = {
  name: IAppointment['patient']
  statusId: IStatus['id'] | null
  specialty: ISpecialty['id'][]
}
