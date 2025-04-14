<template>
    <div
        class="flex ssss parent-prompt"
        style="
        width: 50%;
        position: relative;
        height: 30px;
    "
    >
        <div
            class="prohibited_sites"
            @click.stop
            v-show="item.modal"
        >
            <p
                v-for="site in item.list"
                :key="site"
            >
                <span>{{ site }}</span>
                <i
                    class="fa-solid fa-xmark"
                    @click="removeSite(site)"
                ></i>
            </p>
            <p v-if="item.list.length == 0">
                <span>{{ item.empty_list_text }}</span>
            </p>
        </div>
        <i
            class="fa-solid fa-angle-down"
            :class="{ active: item.modal }"
            @click.stop="toggleItemList(item.name)"
        ></i>
        <label class="upload-text-file parent-prompt-hover">
            <input
                type="file"
                style="display: none;"
                accept="text/plain"
                @input="uploadFile"
            >
            <i class="fa-solid fa-file-arrow-up"></i>
            <small class="prompt-hover">
              Формат файла: одно ключевое слово / фраза на строке без знаков препинания.
            </small>
        </label>
        <input
            v-model="item.input"
            style="margin-right: 0; border-radius: 3px 0 0 3px;height: 100%;"
            type="text"
            :placeholder="item.placeholder"
            @keydown.enter="addItem"
        />
        <small class="prompt with-upload">{{ prompt == '' ? item.prompt : prompt }}</small>
        <button
            class="add-item"
            style="
            font-size: 13px;
            background: #f1f4f9;
            border: none;
            height: 30px;
            padding: 0 10px;
            background: #1ab394;
            color: white;
            border-radius: 3px;
            margin-bottom: 15px;
            border-radius: 0 3px 3px 0;
            cursor: pointer;
        "
            :disabled="hasSpaceOrСomma(item.input)"
            :class="{ 'btn-gray-bg': hasSpaceOrСomma(item.input), }"
            @click="addItem"
        >
            Добавить
        </button>
    </div>
</template>

<script>
import { toggleItemList } from '../use/index'

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        prompt: {
            type: String,
            required: false,
            default: ''
        }
    },
    setup() {
        return {
            toggleItemList
        }
    },
    methods: {
        addItem() {
            if (
                this.item.input &&
                this.item.list.find((key) => key == this.item.input) == undefined
            )
                this.item.list.push(this.item.input);
            this.item.input = "";
            this.item.modal = true;
        },
        uploadFile(event) {
            let file = event.target.files[0];

            let reader = new FileReader();
            reader.readAsText(file);

            reader.onload = () => {
                if (reader.result) this.item.list = reader.result.trim().split(/\r?\n/).map(_item => _item.trim());
                this.item.modal = true
            };

            reader.onerror = function () {
                console.log(reader.error);
            };

            event.target.value = "";
        },
        hasSpaceOrСomma(text) {
            return text.includes(" ") || text.includes(",");
        },
        removeSite(key) {
            this.item.list = this.item.list.filter(
                (temp_key) => temp_key != key
            );
            if (this.item.list.length == 0)
                this.item.modal = false;
        },
    },
}

</script>

<style scoped>

.ssss:not(.ssss:last-child) {
    margin-right: 10px;
}
.ssss .fa-angle-down {
    position: absolute;
    right: calc(77.46px);
    height: 30px;
    width: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: .2s;
}
.ssss .fa-angle-down.active {
    transform: rotateX(180deg);
}

.ssss:hover .with-upload {
    left: 25px;
}

.ssss:hover .upload-text-file i {
    width: 17px;
    margin-right: 8px;
}

/* ================================= */


.prohibited_sites::-webkit-scrollbar {
    width: 7px;
    margin-left: 2px;
}

.prohibited_sites::-webkit-scrollbar-track {
    margin-left: 2px;
    background-color: transparent;
}

.prohibited_sites::-webkit-scrollbar-thumb {
    /*background-color: #eaeaea;*/
    background-color: rgb(170, 227, 255);
    border-radius: 5px;
}

.prohibited_sites::-webkit-scrollbar-thumb:hover {
    /*background-color: #d7d7d7;*/
    background-color: rgb(109, 166, 221);
}

.prohibited_sites {
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 7px;
    overflow: hidden;
    overflow-y: scroll;
    max-height: 200px;
    background: white;
    border: 1px solid #dadde1;
    border-radius: 3px;
}

.prohibited_sites p:not(.prohibited_sites p:last-child) {
    border-bottom: 1px solid #dadde1;
}

.prohibited_sites p {
    cursor: pointer;
    height: 30px !important;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.prohibited_sites p i {
    color: #ed5565;
}

/* ============================= */


.upload-text-file {
    display: flex;
    align-items: center;
    justify-content: center;
}
.upload-text-file i {
    font-size: 20px;
    color: #404f5d;
    cursor: pointer;
    overflow: hidden;
    transition: .15s;
    width: 0;
}

/* ======================================= */


.parent-prompt-hover {
    position: relative;
}

.parent-prompt-hover:hover ~ .prompt.with-upload {
    opacity: 0 !important;
}
.parent-prompt-hover i:hover + .prompt-hover {
    opacity: 1;
    z-index: 2;
}
.parent-prompt-hover i:not(.parent-prompt-hover i:hover) + .prompt-hover {
    opacity: 0;
    display: none;
}


/* ============================================ */



.prompt-hover,
.prompt {
    position: absolute;
    bottom: calc(100% + 7px);
    left: 0;
    font-size: 13px;
    background: #404f5d;
    color: white;
    padding: 6px;
    border-radius: 6px;
    transition: 0.15s;
    opacity: 0;
}
.prompt-hover {
    left: -15px;
    white-space: nowrap;
}

.prompt-hover::after,
.prompt::after {
    content: "▶";
    position: absolute;
    top: 100%;
    left: 20px;
    color: #404f5d;
    height: 9px;
    transform: rotate(90deg);
}
.parent-prompt input:focus + .prompt {
    opacity: 1;
    z-index: 2;
}
.parent-prompt input:not(.parent-prompt input:focus) + .prompt {
    opacity: 0;
    display: none;
}

/* ========================================== */


.btn-gray-bg {
    background: #cccccc !important;
    cursor: default !important;
}


/* ======================= */


.add-item {
    background: rgb(26, 179, 148);
    font-size: 13px;
    border: none;
    height: 30px;
    transition: 0.15s;
}

button.add-item:hover {
    background: rgb(22, 144, 119) !important;
}

.confirm-model_body .add-item.cancel {
    color: white;
    padding: 0 8px;
    margin-left: auto;
    height: 25px;
    border-radius: 4px;
    background: #b2b2b2;
}
.confirm-model_body .add-item.cancel:hover {
    background: #838383 !important;
}
.confirm-model_body .add-item.confirm {
    color: white;
    padding: 0 8px;
    margin-left: 6px;
    height: 25px;
    border-radius: 4px;
}

</style>