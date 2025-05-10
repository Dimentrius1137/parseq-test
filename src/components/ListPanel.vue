<template>
	<div
		v-if="selectedList"
		class="edit-panel"
	>
		<div class="edit-panel__header">
			<p>Список {{ selectedList.name }}</p>
			<BaseButton
				btn-text="Удалить"
				@click="removeList"
			/>
			<BaseButton
				:btn-width="150"
				btn-text="Добавить мутацию"
				@click="emit('updateList', true)"
			/>
			<input type="text">
			<BaseButton
				btn-text="Сохранить"
			/>
			<div>Мутации: </div>
		</div>
		
		<ul class="mutations-list">
			<li
				v-for="mutation in selectedList.mutations"
				:key="mutation"
				class="mutations-list__item"
			>
				{{ mutation }}
			</li>
		</ul>
	</div>
</template>
<script setup lang="ts">
    import { PropType } from 'vue';
    import { ListType } from '@/utils/types/types'
    import api from '@/api/instance';
    import BaseButton from '@/components/shared/BaseButton.vue';

    const props = defineProps({
        selectedList: {
            type: Object as PropType<ListType | null>,
            required: false
        }
    })
    const emit = defineEmits(['removeList', 'updateList']);
    
    async function removeList(){
        await api.delete(`lists/${props.selectedList?.name}`);
        emit('removeList');
    }
</script>

<style scoped lang="scss">
 .edit-panel{
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 1rem;
    margin-bottom: 1rem;
    overflow: hidden;
    &__header{
        height: 100px;
    }
  }
  .mutations-list{
    list-style: none;
    overflow: auto;
    height: 100%;
    border-top: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    &__item{
        min-height: 50px;
        border-bottom: 1px solid #ccc;
        word-wrap: break-word;
    }
  }
</style>