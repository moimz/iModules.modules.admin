/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 툴바 클래스를 정의한다.
 *
 * @file /scripts/Aui.Toolbar.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 9. 22.
 */
var Aui;
(function (Aui) {
    class Toolbar extends Aui.Component {
        type = 'toolbar';
        role = 'bar';
        position;
        border;
        /**
         * 툴바를 생성한다.
         *
         * @param {Aui.Toolbar.Properties|(Aui.Component|string)[]} properties - 객체설정
         */
        constructor(properties = null) {
            if (properties?.constructor.name == 'Array') {
                const items = properties;
                properties = { items: items };
            }
            super(properties);
            this.position = this.properties.position ?? 'top';
            this.border = this.properties.border ?? true;
            this.scrollable = 'x';
            this.$setTop();
            this.$setBottom();
        }
        /**
         * 툴바의 하위 컴포넌트를 초기화한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                for (const item of this.properties.items ?? []) {
                    if (item instanceof Aui.Toolbar) {
                        this.items.push(item);
                    }
                    else if (item instanceof Aui.Component) {
                        item.setLayoutType('column-item');
                        this.items.push(item);
                    }
                    else if (typeof item == 'string') {
                        this.items.push(new Aui.Toolbar.Item(item));
                    }
                }
            }
            super.initItems();
        }
        /**
         * 툴바의 비활성화여부를 설정한다.
         *
         * @param {boolean} disabled - 비활성여부
         * @return {Aui.Component} this
         */
        setDisabled(disabled) {
            if (disabled == true) {
                this.$getComponent().addClass('disabled');
            }
            else {
                this.$getComponent().removeClass('disabled');
            }
            return super.setDisabled(disabled);
        }
        /**
         * @todo 툴바 좌측 스크롤 버튼을 랜더링한다.
         */
        renderTop() { }
        /**
         * @todo 툴바 우축 스크롤 버튼을 랜더링한다.
         */
        renderBottom() { }
        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            this.$getContainer().setData('position', this.position);
            if (this.border == true) {
                this.$getContainer().addClass('border');
            }
            super.render();
        }
        /**
         * 툴바위치를 지정한다.
         *
         * @param {'top'|'bottom'} position - 툴바위치
         */
        setPosition(position) {
            this.position = position;
        }
    }
    Aui.Toolbar = Toolbar;
    (function (Toolbar) {
        /**
         * 툴바아이템 클래스를 정의한다.툴바아이템 객체를 생성한다.
         */
        class Item extends Aui.Component {
            type = 'toolbar';
            role = 'item';
            tool;
            text;
            $text;
            /**
             * 툴바아이템을 생성한다.
             *
             * @param {Aui.Toolbar.Item.Properties|string} properties - 객체설정
             */
            constructor(properties = null) {
                if (typeof properties == 'string') {
                    const text = properties;
                    properties = { text: text };
                }
                super(properties);
                this.tool = 'text';
                this.text = this.properties.text ?? '';
                if (this.text == '->') {
                    this.tool = 'fill';
                }
                else if (this.text == '-' || this.text == '|') {
                    this.tool = 'separator';
                }
            }
            /**
             * 툴바아이템을 랜더링한다.
             */
            renderContent() {
                if (this.tool == 'text') {
                    this.$getContent().text(this.text);
                }
            }
            /**
             * 툴바아이템은 랜더링한다.
             */
            render() {
                super.render();
                this.$getComponent().setAttr('data-tool', this.tool);
            }
        }
        Toolbar.Item = Item;
    })(Toolbar = Aui.Toolbar || (Aui.Toolbar = {}));
})(Aui || (Aui = {}));
