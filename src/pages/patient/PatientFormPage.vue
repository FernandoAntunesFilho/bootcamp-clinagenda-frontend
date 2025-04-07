<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DefaultTemplate } from '@/template'
import { mdiCancel, mdiPlusCircle } from '@mdi/js'
import type { PatientForm } from '@/interfaces/patient'
import request from '@/engine/httpClient'
import { useRoute } from 'vue-router'
import { PageMode } from '@/enum'
import { useToastStore } from '@/stores'
import router from '@/router'

const toastStore = useToastStore()
const route = useRoute()

const isLoadingForm = ref<boolean>(false)

const id = route.params.id
const pageMode = id ? PageMode.PAGE_UPDATE : PageMode.PAGE_INSERT

const form = ref<PatientForm>({
  name: '',
  documentNumber: '',
  phoneNumber: '',
  bithDate: '',
  statusId: ''
})

const pageTitle = computed(() => {
  return pageMode === PageMode.PAGE_UPDATE ? 'Editar paciente' : 'Cadastrar novo paciente'
})

const submitForm = async () => {
  isLoadingForm.value = true
  const response = await request<PatientForm, null>({
    method: pageMode == PageMode.PAGE_INSERT ? 'POST' : 'PUT',
    endpoint: pageMode == PageMode.PAGE_INSERT ? 'patient/insert' : `patient/update/${id}`,
    body: form.value
  })

  if (response.isError) return

  toastStore.setToast({
    type: 'success',
    text: `Paciente ${pageMode == PageMode.PAGE_INSERT ? 'criado' : 'alterado'} com sucesso!`
  })

  router.push({ name: 'patient-list' })

  isLoadingForm.value = false
}

const loadForm = async () => {
  if (pageMode === PageMode.PAGE_INSERT) return

  isLoadingForm.value = true
  const specialtyFormResponse = await request<undefined, PatientForm>({
    method: 'GET',
    endpoint: `patient/listById/${id}`
  })

  if (specialtyFormResponse?.isError) return

  form.value = specialtyFormResponse.data
  isLoadingForm.value = false
}

onMounted(() => {
  loadForm()
})
</script>

<template>
  <default-template>
    <template #title>
      {{ pageTitle }}
    </template>

    <template #action>
      <v-btn :prepend-icon="mdiCancel" :to="{ name: 'patient-list' }"> Cancelar </v-btn>
      <v-btn color="primary" :prepend-icon="mdiPlusCircle" @click.prevent="submitForm">
        Salvar
      </v-btn>
    </template>

    <v-form :disabled="isLoadingForm" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="6">
          <v-text-field v-model.trim="form.name" label="Nome" hide-details />
        </v-col>
        <v-col cols="2">
          <v-text-field v-model.trim="form.documentNumber" label="CPF" hide-details />
        </v-col>
      </v-row>
    </v-form>
  </default-template>
</template>
