<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DefaultTemplate } from '@/template'
import { mdiPlusCircle, mdiSquareEditOutline, mdiTrashCan } from '@mdi/js'
import type { GetDoctorListRequest } from '@/interfaces/doctor'
import request from '@/engine/httpClient'
import { useToastStore } from '@/stores'
import type {
  GetSpecialtyListRequest,
  GetSpecialtyListResponse,
  ISpecialty
} from '@/interfaces/specialty'
import type { GetPatientListRequest } from '@/interfaces/patient'
import type {
  GetAppointmentListRequest,
  GetAppointmentListResponse,
  IAppointment
} from '@/interfaces/appointment'

const toastStore = useToastStore()

const isLoadingList = ref<boolean>(false)
const isLoadingFilter = ref<boolean>(false)

const filterDoctorName = ref<GetDoctorListRequest['name']>('')
const filterPatientName = ref<GetPatientListRequest['name']>('')
const filterSpecialtyId = ref<GetDoctorListRequest['specialtyId']>(null)

const itemsPerPage = ref<number>(10)
const total = ref<number>(0)
const page = ref<number>(1)
const items = ref<IAppointment[]>([])
const specialtyItems = ref<ISpecialty[]>([])

const headers = [
  {
    title: 'ID',
    key: 'id',
    sortable: false,
    width: 0,
    cellProps: { class: 'text-no-wrap' }
  },
  { title: 'Paciente', key: 'patient', sortable: false },
  { title: 'CPF', key: 'documentNumber', sortable: false },
  { title: 'Doutor', key: 'doctor', sortable: false },
  { title: 'Especialidade', key: 'specialty', sortable: false },
  { title: 'Horario da Consulta', key: 'appointmentDate', sortable: false },
  {
    title: 'Ações',
    key: 'actions',
    sortable: false,
    width: 0,
    cellProps: { class: 'text-no-wrap' }
  }
]

const handleDataTableUpdate = async ({ page: tablePage, itemsPerPage: tableItemsPerPage }: any) => {
  page.value = tablePage
  itemsPerPage.value = tableItemsPerPage
  loadDataTable()
}

const loadDataTable = async () => {
  try {
    isLoadingList.value = true
    const { isError, data } = await request<GetAppointmentListRequest, GetAppointmentListResponse>({
      method: 'GET',
      endpoint: 'appointment/list',
      body: {
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        doctorName: filterDoctorName.value,
        patientName: filterPatientName.value,
        specialtyId: filterSpecialtyId.value
      }
    })

    if (isError) return

    items.value = data.items
    total.value = data.total
    isLoadingList.value = false
  } catch (e) {
    console.error('Erro ao buscar item da lista', e)
  }
}

const loadFilters = async () => {
  isLoadingFilter.value = true

  try {
    const specialtyResponse = await request<GetSpecialtyListRequest, GetSpecialtyListResponse>({
      method: 'GET',
      endpoint: 'specialty/list',
      body: {
        itemsPerPage: 99999,
        page: 1,
        name: ''
      }
    })

    if (specialtyResponse.isError) return

    specialtyItems.value = specialtyResponse.data.items
  } catch (e) {
    console.error('Erro ao buscar items do filtro', e)
  }

  isLoadingFilter.value = false
}

const deleteListItem = async (item: IAppointment) => {
  const shouldDelete = confirm(
    `Deseja mesmo deletar o agendamento do paciente ${item.patient.name}?`
  )

  if (!shouldDelete) return

  try {
    const response = await request<null, null>({
      method: 'DELETE',
      endpoint: `appointment/delete/${item.id}`
    })

    if (response.isError) return

    toastStore.setToast({
      type: 'success',
      text: 'Agendamento deletado com sucesso!'
    })

    loadDataTable()
  } catch (e) {
    console.error('Falha ao deletar item da lista', e)
  }
}

onMounted(() => {
  loadFilters()
})
</script>

<template>
  <DefaultTemplate>
    <template #title> Lista de doutores </template>

    <template #action>
      <v-btn color="primary" :prepend-icon="mdiPlusCircle" :to="{ name: 'appointment-insert' }">
        Adicionar agendamento
      </v-btn>
    </template>

    <template #default>
      <v-sheet class="pa-4 mb-4">
        <v-form @submit.prevent="loadDataTable">
          <v-row>
            <v-col>
              <v-text-field v-model.trim="filterDoctorName" label="Doutor" hide-details />
            </v-col>
            <v-col>
              <v-text-field v-model.trim="filterPatientName" label="Paciente" hide-details />
            </v-col>
            <v-col>
              <v-select
                v-model="filterSpecialtyId"
                label="Especialidades"
                :loading="isLoadingFilter"
                :items="specialtyItems"
                item-value="id"
                item-title="name"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="auto" class="d-flex align-center">
              <v-btn color="primary" type="submit">Filtrar</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-sheet>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items-length="total"
        :items="items"
        :loading="isLoadingList"
        item-value="id"
        @update:options="handleDataTableUpdate"
      >
        <template #[`item.patient`]="{ item }"> {{ item.patient.name }} </template>
        <template #[`item.documentNumber`]="{ item }"> {{ item.patient.documentNumber }} </template>
        <template #[`item.doctor`]="{ item }"> {{ item.doctor.name }} </template>
        <template #[`item.specialty`]="{ item }"> {{ item.specialty.name }} </template>
        <template #[`item.appointmentDate`]="{ item }"> {{ item.appointmentDate }} </template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip text="Deletar agendamento" location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="mdiTrashCan"
                size="small"
                color="error"
                class="mr-2"
                @click="deleteListItem(item)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Editar agendamento" location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="mdiSquareEditOutline"
                size="small"
                color="primary"
                :to="{ name: 'appointment-update', params: { id: item.id } }"
              />
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </template>
  </DefaultTemplate>
</template>
