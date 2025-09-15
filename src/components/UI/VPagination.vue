<template>
  <div class="nav-pagination">
    <div
        v-show="selected_page !== 1"
        class="hovered-angle"
    >
      <i
          class="fa-solid fa-angles-left first-page icon-w-0"
          @click="set_selected_page(1)"
      ></i>
      <i
          class="fa fa-angle-left first-page border-radius-0"
          @click="set_selected_page(selected_page === 1 ? 1 : selected_page - 1)"
      ></i>
    </div>
    <span
        v-for="page in pagination"
        :key="page"
        :class="{ active: page === selected_page, }"
        @click="set_selected_page(page)"
    >
          {{ page }}
        </span>
    <div
        v-show="pagination.length !== 1"
        class="hovered-angle"
    >
      <i
          class="fa fa-angle-right second-page border-radius-0"
          @click="set_selected_page(selected_page === getPaginationCount ? getPaginationCount : selected_page + 1)"
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
      required: true
    },
    general_count: {
      type: Number,
      required: true
    },
    set_selected_page: {
      type: Function,
      required: true
    },
    updateList: {
      type: Function,
      required: true
    }
  },
  computed: {
    getPaginationCount() {
      return Math.ceil(this.general_count / 20);
    },
    pagination() {
      const totalPages = this.getPaginationCount;
      const maxVisible = Math.min(10, totalPages);
      let start, end;

      if (totalPages <= maxVisible) {
        start = 1;
        end = totalPages;
      } else {
        const half = Math.floor(maxVisible / 2);
        start = Math.max(1, this.selected_page - half);
        end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1);
        }
      }

      const pagination_array = [];
      for (let i = start; i <= end; i++) {
        pagination_array.push(i);
      }
      return pagination_array;
    }
  }
};

</script>

<style scoped>
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
  padding: 1px 7px 0;
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