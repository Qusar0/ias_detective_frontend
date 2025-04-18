<template>
    <div class="nav-pagination">
        <div class="hovered-angle">
            <i
                class="fa-solid fa-angles-left first-page icon-w-0"
                @click="set_selected_page(1)"
            ></i>
            <i
                class="fa fa-angle-left first-page border-radius-0"
                @click="set_selected_page(selected_page == 1 ? 1 : selected_page - 1)"
            ></i>
        </div>
        <span
            v-for="page in pagination"
            :key="page"
            :class="{ active: page == selected_page, }"
            @click="set_selected_page(page)"
            >
          {{ page }}
        </span>
        <div class="hovered-angle">
            <i
                class="fa fa-angle-right second-page border-radius-0"
                @click="set_selected_page(selected_page == getPaginationCount ? getPaginationCount : selected_page + 1)"
            ></i>
            <i
                class="fa-solid fa-angles-right second-page icon-w-0"
                :title="`Последняя страница: ${getPaginationCount.push_space()}`"
                @click="set_selected_page(getPaginationCount)"
            ></i>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        selected_page: {
            type: Number,
            required: true,
        },
        general_count: {
            type: Number,
            required: true,
        },
        set_selected_page: {
            type: Function,
            required: true,
        },
        updateList: {
            type: Function,
            required: true,
        },
    },
    computed: {
        getPaginationCount() {
            return Math.ceil(this.general_count / 20);
        },
        pagination() {
            let pagination_array = [];
            if (this.selected_page >= 4) {
                let start_index = this.selected_page - 3;
                let end_index = start_index + 9;

                if (end_index >= this.getPaginationCount) {
                    start_index = this.getPaginationCount - 9;
                    if (start_index <= 0) start_index = 1;
                    end_index = this.getPaginationCount;
                }

                for (let i = start_index; i < end_index + 1; i++) {
                    pagination_array.push(i);
                }
            } else {
                let start_index = 1;
                let end_index = start_index + 9;

                if (end_index >= this.getPaginationCount) {
                    start_index = this.getPaginationCount - 9;
                    if (start_index <= 0) start_index = 1;
                    end_index = this.getPaginationCount;
                }

                for (let i = start_index; i < end_index + 1; i++) {
                    pagination_array.push(i);
                }
            }
            return pagination_array;
        },
    }
}

</script>

<style>

.nav-pagination {
    margin-left: auto;
    margin-right: auto;
    display: flex;
    height: 28px;
    align-items: center;
    padding: 0 4px;
    position: relative;
    z-index: 5;
    user-select: none;
}
.nav-pagination span {
    background: white;
    padding: 0 7px;
    padding-top: 1px;
    cursor: pointer;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.nav-pagination span:hover,
.nav-pagination span.active {
    border-bottom: 1px solid #3b5998;
    color: #3b5998;
    font-weight: 600;
}

.result-count {
    font-family: sans-serif;
    font-size: 15px;
    font-weight: 600;
}

.result-count__items {
    color: #1cb394;
}
.result-count__resource {
    color: #7cb5ec;
}

.nav-pagination i {
    font-size: 16px;
    font-weight: 600;
    background: white;
    height: 28px;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.15s;
}

.nav-pagination i:hover {
    color: white;
    background: #3b5998;
}

.first-page.icon-w-0 {
    margin-left: 0;
}

.first-page {
    margin-right: 3px;
    border-radius: 4px 0 0 4px;
}

.second-page {
    margin-left: 3px;
    border-radius: 0 4px 4px 0;
}

.hovered-angle {
    display: flex;
    align-items: center;
}

.hovered-angle:hover .border-radius-0 {
    border-radius: 0;
}

.icon-w-0 {
    overflow: hidden;
}

.hovered-angle:not(.hovered-angle:hover) .first-page.icon-w-0 {
    margin-left: 22px;
}
.hovered-angle:not(.hovered-angle:hover) .icon-w-0 {
    width: 0;
}

.hovered-angle:not(.hovered-angle:hover) .fa-angle-right + .icon-w-0 {
    margin-right: 22px;
}
</style>