<template>
  <div>
    <div class="board-wrapper">
      <div class="board">
        <div class="board-header">
          <input v-if="isEditTitle" class="form-control" type="text" v-model="inputTitle" ref="inputTitle"
            @blur="onSubmitTitle"
            @keyup.enter="onSubmitTitle">
          <span v-else class="board-title" @click.prevent="onClickTitle">{{board.title}}</span>
          <a class="board-header-btn show-menu" href="" @click.prevent="onShowSettings">...Show menu</a>
        </div>
        <div class="list-section-wrapper">
          <div class="list-section">
            <div class="list-wrapper" v-for="list in board.lists"
                 :key="list.pos" :data-list-id="list.id">
              <list :data="list"/>
            </div>
            <div class="list-wrapper">
              <add-list/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <board-settings v-if="isShowBoardSettings"/>
    <router-view></router-view>
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from 'vuex';
  import list from './List';
  import dragger from '../utils/dragger';
  import BoardSettings from './BoardSettings';
  import AddList from './AddList';

  export default {
    name: "Board",
    components: {AddList, BoardSettings, list},
    data() {
      return {
        bid: 0,
        loading: false,
        cDragger: null,
        listDragger: null,
        isEditTitle: false,
        inputTitle: '',
      };
    },
    computed: {
      ...mapState([
        'board',
        'isShowBoardSettings',
      ]),
    },
    created() {
      this.fetchData()
        .then(() => {
          this.inputTitle = this.board.title;
          this.SET_THEME(this.board.bgColor);
        });
      this.SET_IS_SHOW_BOARD_MENU(false);
    },
    updated() {
      this.setCardDraggable();
      this.setListDraggable();
    },
    methods: {
      ...mapActions([
        'FETCH_BOARD',
        'UPDATE_BOARD',
        'UPDATE_CARD',
        'UPDATE_LIST',
      ]),
      ...mapMutations([
        'SET_THEME',
        'SET_IS_SHOW_BOARD_MENU',
      ]),
      fetchData() {
        this.loading = true;
        return this.FETCH_BOARD({id: this.$route.params.bid})
          .then(() => this.loading = false);
      },
      setCardDraggable() {
        if (this.cDragger) this.cDragger.destroy();
        this.cDragger = dragger.init(Array.from(this.$el.querySelectorAll('.card-list')));

        this.cDragger.on('drop', (el, wrapper, target, siblings) => {
          const targetCard = {
            id: Number(el.dataset.cardId),
            pos: 65535,
          };

          const {prev, next} = dragger.siblings({
            el,
            wrapper,
            candidates: Array.from(this.$el.querySelectorAll('.card-item')),
            type: 'card',
          });

          if (!prev && next) {
            targetCard.pos = next.pos / 2;
          } else if (prev && !next) {
            targetCard.pos = prev.pos * 2;
          } else if (prev && next) {
            targetCard.pos = (prev.pos + next.pos) / 2;
          }
          this.UPDATE_CARD(targetCard);
        });
      },
      setListDraggable() {
        if (this.listDragger) this.listDragger.destroy();

        const options = {
          invalid: (el, handle) => !/^list/.test(handle.className),
        };

        this.listDragger = dragger.init(Array.from(this.$el.querySelectorAll('.list-section')), options);

        this.listDragger.on('drop', (el, wrapper, target, siblings) => {
          const targetList = {
            id: Number(el.dataset.listId),
            pos: 65535,
          };

          const {prev, next} = dragger.siblings({
            el,
            wrapper,
            candidates: Array.from(this.$el.querySelectorAll('.list')),
            type: 'list',
          });

          console.log('prev : ', prev);
          console.log('next : ', next);

          if (!prev && next) {
            targetList.pos = next.pos / 2;
          } else if (prev && !next) {
            targetList.pos = prev.pos * 2;
          } else if (prev && next) {
            targetList.pos = (prev.pos + next.pos) / 2;
          }
          this.UPDATE_LIST(targetList);
        });
      },
      onShowSettings() {
        this.SET_IS_SHOW_BOARD_MENU(true);
      },
      onClickTitle() {
        this.isEditTitle = true;
        this.$nextTick(() => {
          this.$refs.inputTitle.focus();
        });
      },
      onSubmitTitle() {
        this.isEditTitle = false;
        this.inputTitle = this.inputTitle.trim();
        if (!this.inputTitle) return;

        const id = this.board.id;
        const title = this.inputTitle;
        if (title === this.board.title) return;

        this.UPDATE_BOARD({id, title});
      }
    }
  }
</script>

<style>
  .board-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
  .board {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .board-header {
    flex: none;
    padding: 8px 4px 8px 8px;
    margin: 0;
    height: 32px;
    line-height: 32px;
  }
  .board-header input[type=text] {
    width: 200px;
  }
  .board-header-btn {
    border-radius: 4px;
    padding: 2px 10px;
    height: 30px;
    margin-bottom: 15px;
    display: inline-block;
    color: #fff;
  }
  .board-header-btn:hover,
  .board-header-btn:focus {
    background-color: rgba(0,0,0,.15);
    cursor: pointer;
  }
  .board-title {
    font-weight: 700;
    font-size: 18px;
  }
  .show-menu {
    font-size: 14px;
    position: absolute;
    right: 15px;
  }

  .list-section-wrapper {
    flex-grow: 1;
    position: relative;
  }
  .list-section {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding: 0 10px;
  }
  .list-wrapper {
    display: inline-block;
    height: 100%;
    width: 272px;
    vertical-align: top;
    margin-right: 5px;
  }

  .card-item.gu-transit {
    background-color: #555 !important;
  }
  .card-item.gu-mirror {
    opacity: 1 !important;
    background-color: #fff !important;
    transform: rotate(3deg) !important;
  }
  .list-wrapper.gu-transit .list {
    background-color: #555 !important;
    color: #555 !important;
    opacity: 1 !important;
  }
  .list-wrapper.gu-mirror .list {
    opacity: 1 !important;
    background-color: #fff !important;
    transform: rotate(3deg) !important;
  }
</style>
