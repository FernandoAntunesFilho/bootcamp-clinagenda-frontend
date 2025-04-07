<script setup lang="ts">
import { ref } from 'vue'
import { DefaultTemplate } from '@/template'
import { mdiPlusCircle, mdiTrashCan, mdiFileEdit } from '@mdi/js'
import type { IPatient, GetPatientListRequest, GetPatientListResponse } from '@/interfaces/patient'
import request from '@/engine/httpClient'
import { useToastStore } from '@/stores'

const toastStore = useToastStore()
const isLoadingList = ref<boolean>(false)
const filterName = ref<GetPatientListRequest['name']>('')
const filterCpf = ref<GetPatientListRequest['documentNumber']>('')
const filterStatus = ref<GetPatientListRequest['statusId']>('')
const itemsPerPage = ref<number>(10)
const total = ref<number>(0)
const page = ref<number>(1)
const items = ref<IPatient[]>([])

const headers = [
  {
    title: 'ID',
    key: 'id',
    sortable: false,
    width: 0,
    cellProps: { class: 'text-no-wrap' }
  },
  { title: 'Nome', key: 'name', sortable: false },
  { title: 'CPF', key: 'documentNumber', sortable: false },
  { title: 'Telefone', key: 'phoneNumber', sortable: false },
  { title: 'Data Nascimento', key: 'birthDate', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
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
  isLoadingList.value = true
  const { isError, data } = await request<GetPatientListRequest, GetPatientListResponse>({
    method: 'GET',
    endpoint: 'patient/list',
    body: {
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      name: filterName.value,
      documentNumber: filterCpf.value,
      statusId: filterStatus.value
    }
  })

  if (isError) return

  items.value = data.items
  total.value = data.total
  isLoadingList.value = false
}

const deleteListItem = async (item: IPatient) => {
  const shouldDelete = confirm(`Deseja mesmo deletar ${item.name}?`)

  if (!shouldDelete) return

  const response = await request<null, null>({
    method: 'DELETE',
    endpoint: `patient/delete/${item.id}`
  })

  if (response.isError) return

  toastStore.setToast({
    type: 'success',
    text: 'Paciente deletado com sucesso!'
  })

  loadDataTable()
}
</script>

<template>
  <default-template>
    <template #title> Lista de pacientes </template>

    <template #action>
      <v-btn color="primary" :prepend-icon="mdiPlusCircle" :to="{ name: 'patient-insert' }">
        Adicionar paciente
      </v-btn>
    </template>

    <template #default>
      <v-sheet class="pa-4 mb-4">
        <v-form @submit.prevent="loadDataTable">
          <v-row>
            <v-col>
              <v-text-field v-model.trim="filterName" label="Nome" hide-details />
            </v-col>
            <v-col>
              <v-text-field v-model.trim="filterCpf" label="CPF" hide-details />
            </v-col>
            <v-col>
              <v-text-field v-model.trim="filterStatus" label="Status" hide-details />
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
        <template #[`item.status`]="{ item }"> {{ item.status.id }} </template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip text="Editar especialidade" location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="mdiFileEdit"
                size="small"
                color="error"
                class="mr-2"
                :to="{ name: 'specialty-update', params: { id: item.id } }"
              />
            </template>
          </v-tooltip>

          <v-tooltip text="Deletar especialidade" location="left">
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
        </template>
      </v-data-table-server>
    </template>
  </default-template>
</template>
