<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DefaultTemplate } from '@/template'
import { mdiCancel, mdiPlusCircle } from '@mdi/js'
import type { DoctorForm } from '@/interfaces/doctor'
import type { IStatus, GetStatusListResponse } from '@/interfaces/status'
import request from '@/engine/httpClient'
import { useRoute } from 'vue-router'
import { PageMode } from '@/enum'
import { useToastStore } from '@/stores'
import router from '@/router'
import type {
  GetSpecialtyListRequest,
  GetSpecialtyListResponse,
  ISpecialty
} from '@/interfaces/specialty'

const toastStore = useToastStore()
const route = useRoute()

const isLoadingForm = ref<boolean>(false)

const id = route.params.id
const pageMode = id ? PageMode.PAGE_UPDATE : PageMode.PAGE_INSERT

const form = ref<DoctorForm>({
  name: '',
  statusId: null,
  specialty: []
})
const statusItems = ref<IStatus[]>([])
const specialtyItems = ref<ISpecialty[]>([])

const pageTitle = computed(() => {
  return pageMode === PageMode.PAGE_UPDATE ? 'Editar doutor' : 'Cadastrar novo doutor'
})

const submitForm = async () => {
  isLoadingForm.value = true

  const body = form.value

  const response = await request<DoctorForm, null>({
    method: pageMode == PageMode.PAGE_INSERT ? 'POST' : 'PUT',
    endpoint: pageMode == PageMode.PAGE_INSERT ? 'doctor/insert' : `doctor/update/${id}`,
    body
  })

  if (response.isError) return

  toastStore.setToast({
    type: 'success',
    text: `Doutor ${pageMode == PageMode.PAGE_INSERT ? 'criado' : 'alterado'} com sucesso!`
  })

  router.push({ name: 'doctor-list' })
  isLoadingForm.value = false
}

const loadForm = async () => {
  isLoadingForm.value = true

  const statusRequest = request<undefined, GetStatusListResponse>({
    method: 'GET',
    endpoint: 'status/list'
  })

  const requests: Promise<any>[] = [statusRequest]

  const specialtyRequest = request<GetSpecialtyListRequest, GetSpecialtyListResponse>({
    method: 'GET',
    endpoint: 'specialty/list',
    body: {
      itemsPerPage: 99999,
      page: 1,
      name: ''
    }
  })

  requests.push(specialtyRequest)

  if (pageMode === PageMode.PAGE_UPDATE) {
    const doctorFormRequest = request<undefined, DoctorForm>({
      method: 'GET',
      endpoint: `doctor/listById/${id}`
    })

    requests.push(doctorFormRequest)
  }

  const [statusResponse, specialtyResponse, doctorFormResponse] = await Promise.all(requests)

  if (statusResponse.isError || specialtyResponse.isError || doctorFormResponse?.isError) return

  statusItems.value = statusResponse.data.items
  specialtyItems.value = specialtyResponse.data.items

  if (pageMode === PageMode.PAGE_UPDATE) {
    form.value = {
      ...doctorFormResponse.data,
      statusId: doctorFormResponse.data.status.id,
      specialty: doctorFormResponse.data.specialty.map((item: { id: number }) => item.id)
    }
  }

  isLoadingForm.value = false
}

onMounted(() => {
  loadForm()
})
</script>

<template>
  <DefaultTemplate>
    <template #title>
      {{ pageTitle }}
    </template>

    <template #action>
      <v-btn :prepend-icon="mdiCancel" :to="{ name: 'doctor-list' }"> Cancelar </v-btn>
      <v-btn color="primary" :prepend-icon="mdiPlusCircle" @click.prevent="submitForm">
        Salvar
      </v-btn>
    </template>

    <v-form :disabled="isLoadingForm" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="4">
          <v-text-field v-model.trim="form.name" label="Nome" hide-details />
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="form.statusId"
            label="Status"
            :loading="isLoadingForm"
            :items="statusItems"
            item-value="id"
            item-title="name"
            clearable
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <p>Especialidades</p>
          <v-checkbox
            v-for="specialty in specialtyItems"
            :key="specialty.id"
            v-model="form.specialty"
            :label="specialty.name"
            :value="specialty.id"
          />
        </v-col>
      </v-row>
    </v-form>
  </DefaultTemplate>
</template>
