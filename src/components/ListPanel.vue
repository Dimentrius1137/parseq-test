<template>
	<div
		class="edit-panel"
	>
		<div class="edit-panel__header">
			<div class="edit-panel__name-editor">
				<p>Список {{ selectedList?.name }}</p>
				<input
					v-model="updatedListName"
					type="text"
				>
				<div>Мутации: </div>
			</div>
			
			<div class="edit-panel__buttons">
				<BaseButton
					:btn-width="150"
					btn-text="Добавить мутацию"
					@click="emit('addMutations', true)"
				/>
				<BaseButton
					:btn-width="170"
					btn-text="Сохранить"
					@click="updateList"
				/>
				<BaseButton
					btn-text="Удалить"
					@click="removeList"
				/>
				<BaseButton
					:btn-width="170"
					btn-text="Удалить мутации(ю)"
					@click="removeMutations"
				/>
			</div>
		</div>
		
		<ul class="mutations-list">
			<!-- в разных списках могут быть одни и теже мутации, что бы избежать дублирования ключей, для key поставлен index-->
			<li
				v-for="mutation, idx in updatedMutations"
				:key="idx"
				class="mutations-list__item"
			>
				<label
					:for="mutation"
					@change="toggleToChecked"
				>
					<input
						:id="mutation"
						type="checkbox"
						:checked="selectedMutations.includes(mutation)"
					>
					{{ mutation }}
				</label>
			</li>
		</ul>
	</div>
</template>
<script setup lang="ts">
    import { PropType, ref, watch } from 'vue';
    import { ListType } from '@/utils/types/list'
    import api from '@/api/instance';
    import BaseButton from '@/components/shared/BaseButton.vue';
    const selectedMutations = ref<string[]>([]);
    const props = defineProps({
        selectedList: {
            type: Object as PropType<ListType>,
            required: false
        }
    })
    const emit = defineEmits(['removeList', 'addMutations', 'listSaved']);
    
    function toggleToChecked(e: Event){
        const checkedValue = e.target as HTMLInputElement
        if(checkedValue.checked){
            selectedMutations.value.push(checkedValue.id);
        }
        else{
            const removedElement = selectedMutations.value.indexOf(checkedValue.id);
            selectedMutations.value.splice(removedElement, 1);
        }
    }

    const updatedListName = ref<string>('');
    const updatedMutations = ref<string[]>([]);

    //для начального значения при mounted
    updatedListName.value = props.selectedList?.name as string;
    props.selectedList?.mutations.forEach((el) => updatedMutations.value.push(el));

    watch(() => props.selectedList, () => {
        updatedListName.value = props.selectedList?.name as string;
        updatedMutations.value.splice(0);
        props.selectedList?.mutations.forEach((el) => updatedMutations.value.push(el));
    }, { deep: true})

    async function removeMutations(){
        updatedMutations.value = updatedMutations.value.filter((el) => !selectedMutations.value.includes(el));
        selectedMutations.value.splice(0);
        try{
            await api.patch(`lists/${props.selectedList?.name}/mutations`, updatedMutations.value);
            emit('listSaved')
        }
        catch(e){
            console.log(e)
        }
     
    }

    async function removeList(){
        try{
            await api.delete(`lists/${props.selectedList?.name}`);
            emit('removeList');
        }
        catch(e){
            console.log(e);
        }

    }

    async function updateList(){
        const selectedMutationName = props.selectedList?.name
        //несколько запросов делается для сохранения мутаций в списке при изменении названия, алгоритм действия: выбранный список удаляется из бд (delete) -> создаётся список с обновлённым названием (post) -> в созданный список добавляются мутации из удалённого (patch) 
        if(updatedListName.value !== selectedMutationName){
            try{
                await api.delete(`lists/${selectedMutationName}`);
                await api.post(`lists/create?name=${updatedListName.value}`)
                await api.patch(`lists/${updatedListName.value}/mutations`, updatedMutations.value)
            }
            catch(e){
                console.log(e);
            }
        }   
        else{
            //если пользователь просто добавляет или удаляет мутации, вызывается только patch для обновления  мутаций в выбранном списке
            try{
                await api.patch(`lists/${selectedMutationName}/mutations`, updatedMutations.value)
            }
            catch(e){
                console.log(e)
            }
        }
        emit('listSaved');
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
        padding: 0.5rem;
        height: 120px;
        display: flex;
        justify-content: space-between;
        gap: 1rem
    }
    &__name-editor{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        input{
            width: 150px;
			height: 35px;
			border: 1px solid #ccc;
			border-radius: 5px;
        }
    }
    &__buttons{
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, auto);
        grid-template-rows: repeat(2, auto);
        gap: 0.5rem;
        justify-content: end;
        align-items: center;

    }
  }
  .mutations-list{
    list-style: none;
    overflow: auto;
    height: calc(100% - 120px);
    border-top: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    &__item{
        padding-left: 1rem;
        align-content: center;
        text-align: start;
        min-height: 50px;
        border-bottom: 1px solid #ccc;
        word-wrap: break-word;
        label{
            display: flex;
            gap: 1rem;
            align-items: center;
        }

    }
  }
</style>